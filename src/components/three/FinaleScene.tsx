"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useStage } from "@/components/home/HomeExperience";
import { Aircraft } from "./Aircraft";
import type { SceneTier } from "./useSceneTier";

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const skyFragment = /* glsl */ `
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 top = vec3(0.04, 0.07, 0.15);
    vec3 mid = vec3(0.23, 0.15, 0.25);
    vec3 low = vec3(0.95, 0.58, 0.36);
    vec3 col = mix(low, mid, smoothstep(-0.01, 0.12, h));
    col = mix(col, top, smoothstep(0.1, 0.5, h));
    float sun = max(dot(normalize(vDir), normalize(vec3(0.0, 0.02, -1.0))), 0.0);
    col += vec3(1.0, 0.75, 0.45) * (pow(sun, 30.0) * 0.6 + pow(sun, 600.0) * 1.4);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Runway edge and centre lights, drawn as one instanced mesh. */
function RunwayLights({ count }: { count: number }) {
  const data = useMemo(() => {
    const out: { p: THREE.Vector3; c: THREE.Color }[] = [];
    const edge = new THREE.Color("#ffe2b0");
    const centre = new THREE.Color("#9ec3ff");
    for (let i = 0; i < count; i++) {
      const z = -2 - i * 2.2;
      out.push({ p: new THREE.Vector3(-3.2, 0.02, z), c: edge });
      out.push({ p: new THREE.Vector3(3.2, 0.02, z), c: edge });
      if (i % 2 === 0) out.push({ p: new THREE.Vector3(0, 0.02, z), c: centre });
    }
    return out;
  }, [count]);
  return (
    <instancedMesh
      args={[undefined, undefined, data.length]}
      onUpdate={(m) => {
        const dummy = new THREE.Object3D();
        data.forEach((d, i) => {
          dummy.position.copy(d.p);
          dummy.scale.setScalar(0.06);
          dummy.updateMatrix();
          m.setMatrixAt(i, dummy.matrix);
          m.setColorAt(i, d.c);
        });
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/** A faint outline of Sri Lanka drawn in the evening sky above the runway. */
function SkyIsland() {
  const [line, setLine] = useState<THREE.LineLoop | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/geo/sri-lanka.json")
      .then((r) => r.json() as Promise<{ rings: [number, number][][] }>)
      .then(({ rings }) => {
        if (!alive) return;
        const main = rings.reduce((a, b) => (b.length > a.length ? b : a));
        const pts = main.map(([lng, lat]) => new THREE.Vector3((lng - 80.7) * 0.99, lat - 7.9, 0));
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: "#f3c48d", transparent: true, opacity: 0.32, fog: false });
        setLine(new THREE.LineLoop(geo, mat));
      })
      .catch(() => null);
    return () => {
      alive = false;
    };
  }, []);
  useEffect(
    () => () => {
      line?.geometry.dispose();
      (line?.material as THREE.Material | undefined)?.dispose();
    },
    [line],
  );
  return line ? <primitive object={line} position={[22, 26, -110]} scale={6} /> : null;
}

/**
 * The landing at the end of the homepage journey: a runway running into a
 * warm horizon, and the aircraft descending onto it as the section scrolls in.
 */
export function FinaleScene({ tier }: { tier: SceneTier }) {
  const { finaleProgress, pointer } = useStage();
  const plane = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const { size } = useThree();
  const narrow = size.width < 768;
  const start = useMemo(() => new THREE.Vector3(7, 9, 1), []);
  const touch = useMemo(() => new THREE.Vector3(0, 0.42, -3), []);
  const end = useMemo(() => new THREE.Vector3(0, 0.42, -12), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const runway = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 1024;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1b1d27";
    g.fillRect(0, 0, 256, 1024);
    g.fillStyle = "rgba(244,238,226,0.55)";
    for (let y = 0; y < 1024; y += 64) g.fillRect(124, y, 8, 36);
    g.fillRect(14, 0, 4, 1024);
    g.fillRect(238, 0, 4, 1024);
    const t = new THREE.CanvasTexture(c);
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 6);
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = THREE.MathUtils.smoothstep(finaleProgress.current, 0.05, 1);
    const g = plane.current;
    if (g) {
      // approach and flare until touchdown, then roll out along the runway
      const a = Math.min(p / 0.8, 1);
      const air = 1 - a;
      if (p < 0.8) {
        tmp.lerpVectors(start, touch, a);
        tmp.x = THREE.MathUtils.lerp(start.x, touch.x, 1 - Math.pow(air, 2));
        tmp.y = THREE.MathUtils.lerp(start.y, touch.y, 1 - Math.pow(air, 1.6)) + Math.sin(t * 0.9) * 0.05 * air;
      } else {
        tmp.lerpVectors(touch, end, (p - 0.8) / 0.2);
      }
      g.position.copy(tmp);
      // bank into the final turn, then level out; nose slightly up for the flare
      g.rotation.order = "YXZ";
      g.rotation.set(-0.3 * air * air + Math.sin(t * 0.6) * 0.03 * air, Math.PI / 2 + 0.22 * air * air, 0.06 * (1 - air) - 0.05 * air);
    }
    const c = cam.current;
    if (c) {
      c.position.x = THREE.MathUtils.damp(c.position.x, pointer.current.x * 0.4, 2, delta);
      c.lookAt(0, narrow ? 4.4 : 2.6, -30);
    }
  });

  const high = tier === "high";
  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0, 6, 12]} fov={narrow ? 62 : 42} near={0.1} far={600} />
      <fog attach="fog" args={["#4a2f3a", 30, 160]} />
      <mesh scale={300}>
        <sphereGeometry args={[1, 32, 16]} />
        <shaderMaterial side={THREE.BackSide} depthWrite={false} vertexShader={skyVertex} fragmentShader={skyFragment} />
      </mesh>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -100]}>
        <planeGeometry args={[600, 300]} />
        <meshStandardMaterial color="#120d16" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -50]}>
        <planeGeometry args={[7, 96]} />
        <meshStandardMaterial map={runway} roughness={0.8} />
      </mesh>
      <RunwayLights count={high ? 40 : 24} />
      <SkyIsland />
      <hemisphereLight args={["#f2b88a", "#1a1020", 0.45]} />
      <directionalLight position={[0, 4, -30]} intensity={2.4} color="#ffb98a" />
      <directionalLight position={[0, 8, 10]} intensity={0.8} color="#c9d2ee" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ffbf8a" position={[0, 2, -12]} scale={[20, 4, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#9fb0e0" position={[0, 10, 8]} scale={[20, 10, 1]} />
      </Environment>
      <group ref={plane} scale={0.55}>
        <Aircraft detail={high ? "high" : "low"} />
      </group>
    </>
  );
}
