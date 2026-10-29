"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useStage } from "@/components/home/HomeExperience";
import type { SceneTier } from "./useSceneTier";
import { Aircraft } from "./Aircraft";

const SUN_DIR = new THREE.Vector3(0.55, 0.06, -1).normalize();

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  uniform vec3 uZenith; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uSun; uniform vec3 uSunDir;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(-0.03, 0.14, h));
    col = mix(col, uZenith, smoothstep(0.12, 0.6, h));
    float s = max(dot(normalize(vDir), uSunDir), 0.0);
    col += uSun * (pow(s, 8.0) * 0.32 + pow(s, 120.0) * 0.45 + pow(s, 2400.0) * 1.6);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function SkyDome() {
  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color("#050b1a") },
      uMid: { value: new THREE.Color("#14214a") },
      uHorizon: { value: new THREE.Color("#b46a58") },
      uSun: { value: new THREE.Color("#ffc68a") },
      uSunDir: { value: SUN_DIR },
    }),
    [],
  );
  return (
    <mesh scale={400} renderOrder={-2}>
      <sphereGeometry args={[1, 48, 32]} />
      <shaderMaterial side={THREE.BackSide} depthWrite={false} uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment} />
    </mesh>
  );
}

const rimFragment = /* glsl */ `
  uniform vec3 uColor; uniform vec3 uRim;
  varying vec3 vNormal; varying vec3 vView;
  void main() {
    float f = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    gl_FragColor = vec4(mix(uColor, uRim, f), 1.0);
  }
`;
const rimVertex = /* glsl */ `
  varying vec3 vNormal; varying vec3 vView;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/** A vast planet below the cloud deck gives the horizon its gentle curve. */
function Horizon() {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#0c1630") }, uRim: { value: new THREE.Color("#d58a63") } }),
    [],
  );
  return (
    <mesh position={[0, -262, -60]} rotation={[0, 0, 0.035]}>
      <sphereGeometry args={[255, 96, 48]} />
      <shaderMaterial uniforms={uniforms} vertexShader={rimVertex} fragmentShader={rimFragment} />
    </mesh>
  );
}

function makeCloudTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  let seed = 3;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Many small puffs, brighter towards the top edge, flatter at the base.
  for (let i = 0; i < 70; i++) {
    const x = 40 + r() * 176;
    const y = 52 + r() * 46 - Math.sin(((x - 40) / 176) * Math.PI) * 18;
    const rad = 8 + r() * 22;
    const grad = g.createRadialGradient(x, y - rad * 0.3, 0, x, y, rad);
    const lit = Math.round(255 - (y - 30) * 0.9);
    grad.addColorStop(0, `rgba(${lit},${lit},${lit},0.5)`);
    grad.addColorStop(0.6, `rgba(${lit - 30},${lit - 30},${lit - 25},0.22)`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
  }
  const fade = g.createLinearGradient(0, 96, 0, 128);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  g.globalCompositeOperation = "destination-in";
  g.fillStyle = fade;
  g.fillRect(0, 0, 256, 128);
  g.globalCompositeOperation = "source-over";
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Instanced billboard clouds drifting past, lit warm from the sun side. */
function CloudDeck({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();
  const data = useMemo(() => {
    let seed = 11;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: count }, () => {
      const z = -70 + r() * 76;
      return {
        x: -60 + r() * 120,
        y: -4.6 + r() * 2.2 + (z < -30 ? -1.5 : 0),
        z,
        s: 5 + r() * 9,
        speed: 0.6 + r() * 0.5,
      };
    });
  }, [count]);
  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      map: makeCloudTexture(),
      transparent: true,
      depthWrite: false,
      color: new THREE.Color("#c9a99a"),
      fog: true,
    });
    return m;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => {
    const warm = new THREE.Color("#e4b08e");
    const cool = new THREE.Color("#3d4a70");
    return data.map((d) => cool.clone().lerp(warm, THREE.MathUtils.clamp((d.x + 60) / 120, 0, 1) * 0.6 + (d.y + 4.6) / 6));
  }, [data]);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    data.forEach((d, i) => {
      d.x -= d.speed * delta * 2.2;
      if (d.x < -64) d.x = 64;
      dummy.position.set(d.x, d.y, d.z);
      dummy.quaternion.copy(camera.quaternion);
      dummy.scale.set(d.s * 1.9, d.s * 0.75, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      material={material}
      onUpdate={(m) => colors.forEach((c, i) => m.setColorAt(i, c))}
    >
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
}

/** A soft luminous trail behind the aircraft: the start of the flight path. */
function Trail({ target, progress }: { target: React.RefObject<THREE.Group | null>; progress: React.MutableRefObject<number> }) {
  const points = 40;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points * 3), 3));
    const a = new Float32Array(points);
    for (let i = 0; i < points; i++) a[i] = i / (points - 1);
    g.setAttribute("alpha", new THREE.BufferAttribute(a, 1));
    return g;
  }, []);
  const history = useRef<THREE.Vector3[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#f0c27a") }, uFade: { value: 0 } },
        vertexShader: `attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
        fragmentShader: `uniform vec3 uColor; uniform float uFade; varying float vA; void main(){ gl_FragColor = vec4(uColor, vA * vA * 0.9 * uFade); }`,
      }),
    [],
  );
  useFrame(() => {
    const g = target.current;
    if (!g) return;
    mat.uniforms.uFade.value = THREE.MathUtils.smoothstep(progress.current, 0.01, 0.12);
    // Emit from the tail, then let the history drift backwards with the air.
    tmp.set(-3.3, 0.1, 0).applyMatrix4(g.matrixWorld);
    const h = history.current;
    h.push(tmp.clone());
    while (h.length > points) h.shift();
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < points; i++) {
      const p = h[Math.max(0, h.length - points + i)] ?? tmp;
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    }
    geo.attributes.position.needsUpdate = true;
  });
  const line = useMemo(() => new THREE.Line(geo, mat), [geo, mat]);
  return <primitive object={line} frustumCulled={false} />;
}

/** Flight path the aircraft follows as the hero scrolls away. */
const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(3.7, 0.05, 0),
  new THREE.Vector3(4.7, -1.0, 0.4),
  new THREE.Vector3(5.0, -3.0, 0.6),
  new THREE.Vector3(4.6, -6.5, 0.6),
]);

export function HeroScene({ tier }: { tier: SceneTier }) {
  const { heroProgress, pointer } = useStage();
  const plane = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const { size } = useThree();
  const narrow = size.width < 768;
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = THREE.MathUtils.smoothstep(heroProgress.current, 0, 1);
    const g = plane.current;
    if (g) {
      PATH.getPointAt(p, pos);
      PATH.getTangentAt(Math.min(0.999, p + 0.001), tangent);
      g.position.set(pos.x + (narrow ? -2.5 : 0), pos.y + Math.sin(t * 0.8) * 0.08 + (narrow ? 4.2 : 0), pos.z);
      const pitch = Math.atan2(tangent.y, Math.hypot(tangent.x, tangent.z));
      g.rotation.set(
        // bank gently, more as it turns down the page
        0.24 + Math.sin(t * 0.5) * 0.03 - p * 0.45,
        // yaw so we see a three-quarter view of the nose
        -0.62 + p * 0.25,
        0.06 + Math.sin(t * 0.7) * 0.02 + pitch * 0.6,
      );
    }
    const c = cam.current;
    if (c) {
      const tx = pointer.current.x * 0.45;
      const ty = 1.7 - pointer.current.y * 0.25;
      c.position.x = THREE.MathUtils.damp(c.position.x, tx, 2.2, delta);
      c.position.y = THREE.MathUtils.damp(c.position.y, ty, 2.2, delta);
      c.lookAt(narrow ? 0 : 1.6, narrow ? 0.4 : -0.1, 0);
    }
  });

  const high = tier === "high";
  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0, 1.7, narrow ? 15 : 11.5]} fov={narrow ? 48 : 38} near={0.1} far={900} />
      <fog attach="fog" args={["#22284a", 25, 120]} />
      <SkyDome />
      <Horizon />
      <CloudDeck count={high ? 70 : 34} />
      <hemisphereLight args={["#c8cfe6", "#3a2a2a", 0.5]} />
      <directionalLight position={[8, 3, -10]} intensity={2.4} color="#ffc995" />
      <directionalLight position={[3, 6, 8]} intensity={1.3} color="#fff1e0" />
      <directionalLight position={[-6, 4, 8]} intensity={0.35} color="#9db4ff" />
      <Environment resolution={high ? 128 : 64} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffcf9a" position={[10, 2, -10]} scale={[20, 6, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#c9d2ee" position={[-10, 6, 6]} scale={[16, 10, 1]} />
        <Lightformer form="rect" intensity={0.35} color="#1c2442" position={[0, -8, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
      </Environment>
      <group ref={plane} scale={narrow ? 0.42 : 0.62}>
        <Aircraft detail={high ? "high" : "low"} />
      </group>
      <Trail target={plane} progress={heroProgress} />
    </>
  );
}
