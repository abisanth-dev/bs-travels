"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import { Aircraft } from "./Aircraft";
import { enterAmount, exitAmount } from "./choreo";
import * as THREE from "three";
import { useStage } from "@/components/home/HomeExperience";
import { destinations, origin } from "@/content/destinations";
import { arcPoints, facingRotation, latLngToXYZ } from "@/lib/geo";
import type { SceneTier } from "./useSceneTier";

const GOLD = new THREE.Color("#e3b467");
const IVORY = new THREE.Color("#f4eee2");

const dotsVertex = /* glsl */ `
  uniform float uSize; uniform float uPixelRatio;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = dot(n, normalize(-mv.xyz));
    gl_PointSize = uSize * uPixelRatio * (3.2 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const dotsFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFacing;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    float a = smoothstep(-0.05, 0.45, vFacing) * 0.75;
    gl_FragColor = vec4(uColor, a);
  }
`;
export const atmoVertex = /* glsl */ `
  varying vec3 vNormal; varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
export const atmoFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal; varying vec3 vView;
  void main() {
    // Back faces: dot is 0 at the outer edge and about -0.5 at the globe's rim.
    float f = pow(smoothstep(0.0, 0.55, -dot(vNormal, vView)), 2.2);
    gl_FragColor = vec4(uColor, f * 0.55);
  }
`;

export function LandDots({ stride }: { stride: number }) {
  const [positions, setPositions] = useState<Float32Array | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/globe/land-points.json")
      .then((r) => r.json() as Promise<number[]>)
      .then((pts) => {
        if (!alive) return;
        const out: number[] = [];
        for (let i = 0; i < pts.length; i += 2 * stride) out.push(...latLngToXYZ(pts[i], pts[i + 1], 1.002));
        setPositions(new Float32Array(out));
      })
      .catch(() => null);
    return () => {
      alive = false;
    };
  }, [stride]);
  const uniforms = useMemo(
    () => ({
      uColor: { value: IVORY.clone().multiplyScalar(0.92) },
      uSize: { value: stride > 1 ? 2.6 : 2.0 },
      uPixelRatio: { value: typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, 2) },
    }),
    [stride],
  );
  if (!positions) return null;
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial transparent depthWrite={false} uniforms={uniforms} vertexShader={dotsVertex} fragmentShader={dotsFragment} />
    </points>
  );
}

export const arcVertex = /* glsl */ `
  varying float vU;
  void main() { vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const arcFragment = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; uniform float uTime; uniform float uReveal; uniform float uOffset;
  varying float vU;
  void main() {
    if (vU > uReveal) discard;
    // pulses of light flowing from Jaffna outwards
    float flow = pow(fract(vU * 3.0 - uTime * 0.35 + uOffset), 6.0);
    float ends = smoothstep(0.0, 0.04, vU) * smoothstep(1.0, 0.96, vU);
    gl_FragColor = vec4(uColor * (1.0 + flow * 1.6), (0.35 + flow * 0.65) * uOpacity * ends);
  }
`;

type ArcObject = {
  slug: string;
  curve: THREE.CatmullRomCurve3;
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
};

/** A tiny paper-plane glyph that flies along a route. */
export function makePlaneGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0.03, 0);
  shape.lineTo(-0.02, 0.02);
  shape.lineTo(-0.012, 0);
  shape.lineTo(-0.02, -0.02);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

function Arcs({ group, tier }: { group: React.RefObject<THREE.Group | null>; tier: SceneTier }) {
  const { selected, globeReveal } = useStage();
  const arcs = useMemo<ArcObject[]>(
    () =>
      destinations.map((d, i) => {
        const pts = arcPoints(origin, d.marker, 72, 1.0).map((p) => new THREE.Vector3(...p));
        const curve = new THREE.CatmullRomCurve3(pts);
        const geo = new THREE.TubeGeometry(curve, tier === "high" ? 96 : 48, 0.0042, 6, false);
        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uColor: { value: GOLD.clone() },
            uOpacity: { value: 0.6 },
            uTime: { value: 0 },
            uReveal: { value: 0 },
            uOffset: { value: i * 0.37 },
          },
          vertexShader: arcVertex,
          fragmentShader: arcFragment,
        });
        return { slug: d.slug, curve, mesh: new THREE.Mesh(geo, mat), mat };
      }),
    [tier],
  );
  const planeGeo = useMemo(makePlaneGeometry, []);
  const planes = useRef<(THREE.Mesh | null)[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const m = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const reveal = THREE.MathUtils.clamp(globeReveal.current * 1.25, 0, 1);
    arcs.forEach((a, i) => {
      // stagger the draw-in so the arcs fan out from Jaffna
      const local = THREE.MathUtils.clamp(reveal * 1.6 - i * 0.04, 0, 1);
      a.mat.uniforms.uReveal.value = local;
      a.mat.uniforms.uTime.value = t;
      const isSel = a.slug === selected;
      const target = selected ? (isSel ? 1.6 : 0.25) : 0.7;
      a.mat.uniforms.uOpacity.value = THREE.MathUtils.damp(a.mat.uniforms.uOpacity.value, target, 6, delta);
      const pl = planes.current[i];
      if (pl) {
        // every route has a plane in flight; the selected one flies faster
        const speed = isSel ? 0.16 : 0.06;
        const u = Math.min(local, (t * speed + i * 0.13) % 1);
        a.curve.getPointAt(u, tmp);
        a.curve.getPointAt(Math.min(1, u + 0.01), ahead);
        up.copy(tmp).normalize();
        m.lookAt(ahead, tmp, up);
        pl.position.copy(tmp);
        pl.quaternion.setFromRotationMatrix(m);
        pl.rotateY(-Math.PI / 2);
        pl.rotateX(Math.PI / 2);
        pl.visible = local > 0.98 && !selected;
        pl.scale.setScalar(isSel ? 1.6 : 1);
      }
    });
  });

  // A small modelled aircraft flies the selected route.
  const jet = useRef<THREE.Group>(null);
  const jetPos = useRef(0);
  useFrame((_, delta) => {
    const g = jet.current;
    const a = arcs.find((x) => x.slug === selected);
    if (!g) return;
    g.visible = Boolean(a);
    if (!a) {
      jetPos.current = 0;
      return;
    }
    jetPos.current = (jetPos.current + delta * 0.11) % 1;
    const u = jetPos.current;
    a.curve.getPointAt(u, tmp);
    a.curve.getPointAt(Math.min(1, u + 0.01), ahead);
    up.copy(tmp).normalize();
    m.lookAt(ahead, tmp, up);
    g.position.copy(tmp);
    g.quaternion.setFromRotationMatrix(m);
    // the matrix points +z along the route; the aircraft's nose is +x
    g.rotateY(-Math.PI / 2);
    const s = 0.014 * Math.min(1, Math.sin(Math.PI * Math.min(u, 0.999)) * 6);
    g.scale.setScalar(Math.max(0.004, s));
  });

  return (
    <group ref={group}>
      {arcs.map((a, i) => (
        <group key={a.slug}>
          <primitive object={a.mesh} />
          <mesh ref={(el) => void (planes.current[i] = el)} geometry={planeGeo}>
            <meshBasicMaterial color="#fff2d6" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <group ref={jet} visible={false}>
        <Aircraft detail="low" />
      </group>
    </group>
  );
}

/** Distant stars behind the globe. */
function Stars({ count }: { count: number }) {
  const positions = useMemo(() => {
    let s = 5;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      const rad = 9 + r() * 6;
      a[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = rad * Math.cos(ph);
      a[i * 3 + 2] = -Math.abs(rad * Math.sin(ph) * Math.sin(th));
    }
    return a;
  }, [count]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#cfd8f0" size={0.035} transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

function Markers() {
  const { selected } = useStage();
  const pulse = useRef<THREE.Mesh>(null);
  const items = useMemo(
    () => destinations.map((d) => ({ slug: d.slug, pos: new THREE.Vector3(...latLngToXYZ(d.marker.lat, d.marker.lng, 1.004)) })),
    [],
  );
  const originPos = useMemo(() => new THREE.Vector3(...latLngToXYZ(origin.lat, origin.lng, 1.004)), []);
  const originQuat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), originPos.clone().normalize()),
    [originPos],
  );
  useFrame(({ clock }) => {
    const p = pulse.current;
    if (!p) return;
    const k = (clock.elapsedTime * 0.6) % 1;
    p.scale.setScalar(1 + k * 3);
    (p.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - k);
  });
  return (
    <group>
      {items.map((m) => (
        <mesh key={m.slug} position={m.pos}>
          <sphereGeometry args={[m.slug === selected ? 0.02 : 0.012, 12, 12]} />
          <meshBasicMaterial color={m.slug === selected ? GOLD : IVORY} />
        </mesh>
      ))}
      <mesh position={originPos}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <mesh ref={pulse} position={originPos} quaternion={originQuat}>
        <ringGeometry args={[0.024, 0.03, 32]} />
        <meshBasicMaterial color={GOLD} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Projects marker positions to screen space and moves the DOM labels. */
function LabelSync({ globe }: { globe: React.RefObject<THREE.Group | null> }) {
  const { globeLabels, globeSlot } = useStage();
  const entries = useMemo(
    () => [
      { key: "origin", local: new THREE.Vector3(...latLngToXYZ(origin.lat, origin.lng, 1.01)) },
      ...destinations.map((d) => ({ key: d.slug, local: new THREE.Vector3(...latLngToXYZ(d.marker.lat, d.marker.lng, 1.01)) })),
    ],
    [],
  );
  const v = useMemo(() => new THREE.Vector3(), []);
  const n = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    const g = globe.current;
    const slot = globeSlot.current;
    if (!g || !slot) return;
    const w = slot.clientWidth;
    const h = slot.clientHeight;
    entries.forEach(({ key, local }) => {
      const el = globeLabels.current.get(key);
      if (!el) return;
      v.copy(local).applyMatrix4(g.matrixWorld);
      n.copy(v).normalize();
      camDir.copy(camera.position).sub(v).normalize();
      const facing = n.dot(camDir);
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = facing > 0.12 ? "1" : "0";
      el.style.pointerEvents = facing > 0.12 ? "auto" : "none";
    });
  });
  return null;
}

function Earth() {
  const [map, rough] = useTexture(["/globe/earth.jpg", "/globe/earth-rough.jpg"]);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return (
    <mesh>
      <sphereGeometry args={[1, 96, 64]} />
      <meshStandardMaterial map={map} roughnessMap={rough} roughness={1} metalness={0} />
    </mesh>
  );
}

export function GlobeScene({ tier }: { tier: SceneTier }) {
  const { selected, globeInput, globeReveal, progress } = useStage();
  const pass = progress("globe");
  const stage = useRef<THREE.Group>(null);
  const globe = useRef<THREE.Group>(null);
  const arcGroup = useRef<THREE.Group>(null);
  const home = useMemo(() => facingRotation(origin.lat + 8, origin.lng - 25), []);
  const rot = useRef({ x: home.x, y: home.y });
  const atmoUniforms = useMemo(() => ({ uColor: { value: new THREE.Color("#7fa6e6") } }), []);

  useFrame((_, delta) => {
    const g = globe.current;
    if (!g) return;
    const input = globeInput.current;
    const now = performance.now();
    const idle = now - input.lastInteraction > 2500;
    if (input.dragging || input.dx || input.dy) {
      rot.current.y += input.dx * 0.006;
      rot.current.x = THREE.MathUtils.clamp(rot.current.x + input.dy * 0.004, -0.6, 0.6);
      input.dx = 0;
      input.dy = 0;
    } else if (selected) {
      const d = destinations.find((x) => x.slug === selected);
      if (d) {
        // turn to show the arc from Jaffna to the selected destination
        const midLat = (d.marker.lat + origin.lat) / 2;
        let midLng = (d.marker.lng + origin.lng) / 2;
        if (Math.abs(d.marker.lng - origin.lng) > 180) midLng += 180;
        const target = facingRotation(midLat, midLng);
        let dy = target.y - rot.current.y;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        rot.current.y += dy * Math.min(1, delta * 2.4);
        rot.current.x = THREE.MathUtils.damp(rot.current.x, target.x, 2.4, delta);
      }
    } else if (idle) {
      // slow drift; slower still while the arcs are drawing in
      rot.current.y += delta * (globeReveal.current < 1 ? 0.03 : 0.06);
    }
    g.rotation.set(rot.current.x, rot.current.y, 0);
    // rise into place as the section arrives; recede as it leaves
    const st = stage.current;
    if (st) {
      const enter = enterAmount(Math.max(globeReveal.current * 0.4, pass.current));
      const exit = exitAmount(pass.current);
      st.position.y = (1 - enter) * -1.6 + exit * 1.2;
      st.scale.setScalar(0.82 + enter * 0.18 - exit * 0.25);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3.3]} fov={42} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#9fb8ff", "#0a1326", 0.35]} />
      <directionalLight position={[-3, 2, 3]} intensity={2.6} color="#fff1dc" />
      <Stars count={tier === "high" ? 500 : 220} />
      <group ref={stage}>
      <group ref={globe}>
        <Earth />
        <Markers />
        <Arcs group={arcGroup} tier={tier} />
      </group>
      <mesh scale={1.16}>
        <sphereGeometry args={[1, 64, 48]} />
        <shaderMaterial
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={atmoUniforms}
          vertexShader={atmoVertex}
          fragmentShader={atmoFragment}
        />
      </mesh>
      </group>
      <LabelSync globe={globe} />
    </>
  );
}
