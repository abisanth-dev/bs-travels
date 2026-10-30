"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/components/home/sceneState";
import { Aircraft } from "../Aircraft";
import { arcFragment, arcVertex } from "../GlobeScene";
import { CompassObject, Documents, Suitcase } from "../TravelObjects";
import { damp, enterAmount, exitAmount } from "../choreo";
import { SoftShadow, usePointer, useSectionProgress } from "./common";

/** Where each stage sits on the route (u along the curve). */
const STOPS = [0.04, 0.36, 0.66, 0.96];

const groundVertex = /* glsl */ `
  varying vec2 vP;
  void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const groundFragment = /* glsl */ `
  varying vec2 vP;
  void main() {
    // faint contour lines, like a travel map
    float h = sin(vP.x * 0.45) * cos(vP.y * 0.38) + sin(vP.x * 0.17 + vP.y * 0.21) * 1.4;
    float line = smoothstep(0.06, 0.0, abs(fract(h * 2.0) - 0.5) - 0.44);
    float fade = smoothstep(22.0, 6.0, length(vP));
    vec3 col = vec3(0.039, 0.075, 0.149) + vec3(0.12, 0.16, 0.24) * line * 0.45 * fade;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function SpeechBubble() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, 1, 0.72, 0, Math.PI * 2, false, 0);
    const tail = new THREE.Shape();
    tail.moveTo(-0.5, -0.5);
    tail.lineTo(-0.9, -1.15);
    tail.lineTo(-0.1, -0.66);
    tail.closePath();
    const opts = { depth: 0.22, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3 };
    const a = new THREE.ExtrudeGeometry(s, opts);
    const b = new THREE.ExtrudeGeometry(tail, opts);
    return [a, b];
  }, []);
  useEffect(() => () => geo.forEach((g) => g.dispose()), [geo]);
  return (
    <group>
      {geo.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshPhysicalMaterial color="#f4eee2" roughness={0.35} clearcoat={0.6} />
        </mesh>
      ))}
      {[-0.4, 0, 0.4].map((x) => (
        <mesh key={x} position={[x, 0, 0.3]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#b8873a" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

const OBJECTS = [
  { el: SpeechBubble, scale: 0.75, rot: [0, -0.3, 0] as [number, number, number] },
  { el: CompassObject, scale: 0.6, rot: [-0.9, 0, 0] as [number, number, number] },
  { el: Documents, scale: 0.7, rot: [-0.2, -0.3, 0] as [number, number, number] },
  { el: Suitcase, scale: 0.62, rot: [0, -0.5, 0] as [number, number, number] },
];

/**
 * How it works: a route across a dark travel map with four stops. The small
 * aircraft flies to whichever stage is active; that stop's object rises into
 * the light while the others rest.
 */
export function StepsScene() {
  const progress = useSectionProgress("steps");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 0.9;
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const jet = useRef<THREE.Group>(null);
  const stops = useRef<(THREE.Group | null)[]>([]);
  const u = useRef(STOPS[0]);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        tall
          ? [new THREE.Vector3(-1.5, 0, 7), new THREE.Vector3(1.8, 0, 3.5), new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(1.6, 0, -3.6), new THREE.Vector3(-1.2, 0, -7)]
          : [new THREE.Vector3(-8, 0, 2.5), new THREE.Vector3(-4, 0, -1.5), new THREE.Vector3(0, 0, 1.8), new THREE.Vector3(4, 0, -1.2), new THREE.Vector3(8, 0, 1.5)],
      ),
    [tall],
  );
  const route = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color("#e3b467") },
        uOpacity: { value: 1.1 },
        uTime: { value: 0 },
        uReveal: { value: 0 },
        uOffset: { value: 0 },
      },
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
    });
    return { geo: new THREE.TubeGeometry(curve, 160, 0.05, 8, false), mat };
  }, [curve]);
  useEffect(() => () => {
    route.geo.dispose();
    route.mat.dispose();
  }, [route]);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    const step = sceneState.get().step;
    route.mat.uniforms.uTime.value = t;
    route.mat.uniforms.uReveal.value = 0.08 + enter * 0.92;
    u.current = damp(u.current, STOPS[step], 1.6, delta);
    curve.getPointAt(Math.min(0.999, u.current), pos);
    curve.getPointAt(Math.min(1, u.current + 0.01), ahead);
    const j = jet.current;
    if (j) {
      const moving = Math.abs(u.current - STOPS[step]) > 0.01;
      j.position.set(pos.x, 2.3 + Math.sin(t * 1.2) * 0.06, pos.z);
      j.lookAt(ahead.x, j.position.y, ahead.z);
      j.rotateY(-Math.PI / 2);
      j.rotateX(moving ? -0.25 * Math.sign(ahead.x - pos.x || 1) : 0);
    }
    stops.current.forEach((g, i) => {
      if (!g) return;
      const on = i === step;
      g.position.y = damp(g.position.y, (on ? 1.15 : 0.55) + (1 - enter) * -2, 4, delta);
      g.rotation.y = damp(g.rotation.y, OBJECTS[i].rot[1] + (on ? Math.sin(t * 0.5) * 0.3 + pointer.current.x * 0.3 : 0), 3, delta);
      g.scale.setScalar(damp(g.scale.x, OBJECTS[i].scale * (on ? 1.15 : 0.8), 4, delta));
    });
    const c = cam.current;
    if (c) {
      // three-quarter chase view that keeps the next stop in frame
      camTarget.set(pos.x + (tall ? 4 : 2.5), (tall ? 9 : 6) + (1 - enter) * 4 + exit * 3, pos.z + (tall ? 6 : 8));
      camTarget.x += pointer.current.x * 0.6;
      c.position.x = damp(c.position.x, camTarget.x, 2, delta);
      c.position.y = damp(c.position.y, camTarget.y, 2, delta);
      c.position.z = damp(c.position.z, camTarget.z, 2, delta);
      look.x = damp(look.x, pos.x, 2, delta);
      look.z = damp(look.z, pos.z - (tall ? 1.5 : 0), 2, delta);
      look.y = 0.6;
      c.lookAt(look);
    }
  });

  const points = STOPS.map((s) => curve.getPointAt(s));
  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0, 8, 10]} fov={tall ? 48 : 36} near={0.1} far={80} />
      <fog attach="fog" args={["#0a1326", 9, 24]} />
      <hemisphereLight args={["#c8d4f0", "#0a1326", 0.6]} />
      <directionalLight position={[4, 8, 6]} intensity={1.8} color="#ffe2bf" />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[60, 60]} />
        <shaderMaterial vertexShader={groundVertex} fragmentShader={groundFragment} />
      </mesh>
      <mesh geometry={route.geo} material={route.mat} position={[0, 0.04, 0]} />
      {points.map((pt, i) => {
        const El = OBJECTS[i].el;
        return (
          <group key={i} position={[pt.x, 0, pt.z]}>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.7, 0.8, 0.1, 40]} />
              <meshStandardMaterial color="#1a2744" roughness={0.5} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.11, 0]} rotation-x={-Math.PI / 2}>
              <ringGeometry args={[0.6, 0.66, 48]} />
              <meshBasicMaterial color="#e3b467" />
            </mesh>
            <SoftShadow size={2.2} opacity={0.5} position={[0, 0.12, 0]} />
            <group ref={(g) => void (stops.current[i] = g)} position={[0, 0.6, 0]}>
              <group rotation={[OBJECTS[i].rot[0], 0, OBJECTS[i].rot[2]]}>
                <El />
              </group>
            </group>
          </group>
        );
      })}
      <group ref={jet} scale={0.16}>
        <Aircraft detail="low" />
      </group>
    </>
  );
}
