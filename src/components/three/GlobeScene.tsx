"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
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
const atmoVertex = /* glsl */ `
  varying vec3 vNormal; varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const atmoFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal; varying vec3 vView;
  void main() {
    // Back faces: dot is 0 at the outer edge and about -0.5 at the globe's rim.
    float f = pow(smoothstep(0.0, 0.55, -dot(vNormal, vView)), 2.2);
    gl_FragColor = vec4(uColor, f * 0.55);
  }
`;

function LandDots({ stride }: { stride: number }) {
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

type ArcObject = { slug: string; line: THREE.Line; count: number; mat: THREE.LineBasicMaterial };

function Arcs({ group }: { group: React.RefObject<THREE.Group | null> }) {
  const { selected, globeReveal } = useStage();
  const arcs = useMemo<ArcObject[]>(
    () =>
      destinations.map((d) => {
        const pts = arcPoints(origin, d.marker, 72, 1.0);
        const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
        const mat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.38, depthWrite: false });
        return { slug: d.slug, line: new THREE.Line(geo, mat), count: pts.length, mat };
      }),
    [],
  );
  const traveller = useRef<THREE.Mesh>(null);
  const travelT = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const reveal = THREE.MathUtils.clamp(globeReveal.current * 1.25, 0, 1);
    arcs.forEach((a, i) => {
      // stagger the draw-in so the arcs fan out from Jaffna
      const local = THREE.MathUtils.clamp(reveal * 1.6 - i * 0.04, 0, 1);
      a.line.geometry.setDrawRange(0, Math.floor(a.count * local));
      const isSel = a.slug === selected;
      const target = selected ? (isSel ? 1 : 0.14) : 0.4;
      a.mat.opacity = THREE.MathUtils.damp(a.mat.opacity, target, 6, delta);
    });
    const sel = arcs.find((a) => a.slug === selected);
    const t = traveller.current;
    if (t) {
      t.visible = Boolean(sel);
      if (sel) {
        travelT.current = (travelT.current + delta * 0.22) % 1;
        const attr = sel.line.geometry.attributes.position as THREE.BufferAttribute;
        const idx = Math.floor(travelT.current * (sel.count - 1));
        tmp.fromBufferAttribute(attr, idx);
        t.position.copy(tmp);
      }
    }
  });

  return (
    <group ref={group}>
      {arcs.map((a) => (
        <primitive key={a.slug} object={a.line} />
      ))}
      <mesh ref={traveller}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshBasicMaterial color="#fff2d6" />
      </mesh>
    </group>
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

export function GlobeScene({ tier }: { tier: SceneTier }) {
  const { selected, globeInput, globeReveal } = useStage();
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
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3.3]} fov={42} />
      <ambientLight intensity={0.6} />
      <group ref={globe}>
        <mesh>
          <sphereGeometry args={[1, 64, 48]} />
          <meshBasicMaterial color="#0c1a33" />
        </mesh>
        <LandDots stride={tier === "high" ? 1 : 2} />
        <Markers />
        <Arcs group={arcGroup} />
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
      <LabelSync globe={globe} />
    </>
  );
}
