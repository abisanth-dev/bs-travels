"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/components/home/sceneState";
import { Postcard } from "../ObjectsExtra";
import { damp, enterAmount, exitAmount } from "../choreo";
import { SoftShadow, usePointer, useSectionProgress } from "./common";
import { GUIDES } from "@/components/home/homeData";


const LAYOUT = [
  { p: [-2.2, 0.04, -0.6], r: 0.18 },
  { p: [0.6, 0.08, -1.1], r: -0.12 },
  { p: [-0.9, 0.12, 1.2], r: -0.08 },
  { p: [2.1, 0.16, 0.9], r: 0.14 },
];

/**
 * Travel journal: postcards for the site's guides, laid over a leather
 * journal. Focusing or hovering a guide lifts its card towards the light.
 */
export function JournalScene() {
  const progress = useSectionProgress("journal");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 0.9;
  const cards = useRef<(THREE.Group | null)[]>([]);
  const cam = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    const focus = sceneState.get().journal;
    cards.current.forEach((g, i) => {
      if (!g) return;
      const L = LAYOUT[i];
      const on = focus === i;
      // cards are dealt onto the desk as the section arrives
      const deal = THREE.MathUtils.clamp(enter * 1.6 - i * 0.15, 0, 1);
      g.position.x = damp(g.position.x, L.p[0] * (tall ? 0.6 : 1) + (1 - deal) * 6, 5, delta);
      g.position.y = damp(g.position.y, L.p[1] + (on ? 0.9 : 0) + exit * (1 + i * 0.4), 5, delta);
      g.position.z = damp(g.position.z, L.p[2] * (tall ? 1.6 : 1) + (on ? 0.5 : 0), 5, delta);
      g.rotation.x = damp(g.rotation.x, -Math.PI / 2 + (on ? 0.5 : 0), 5, delta);
      g.rotation.z = damp(g.rotation.z, L.r + (1 - deal) * 0.8 + (on ? Math.sin(t) * 0.02 : 0), 5, delta);
    });
    const c = cam.current;
    if (c) {
      c.position.x = damp(c.position.x, pointer.current.x * 0.6, 3, delta);
      c.position.y = tall ? 10 : 7.2;
      c.position.z = tall ? 6 : 6.4;
      c.lookAt(0, 0, 0.1);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0, 7.2, 6.4]} fov={tall ? 46 : 36} near={0.1} far={60} />
      <fog attach="fog" args={["#0a1326", 9, 15]} />
      <hemisphereLight args={["#fff1dc", "#0a1326", 0.55]} />
      <spotLight position={[1, 8, 4]} angle={0.55} penumbra={0.9} intensity={110} decay={2} color="#ffe2bf" />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.12, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#131c33" roughness={0.9} />
      </mesh>
      {/* leather journal underneath the cards */}
      <group position={[-0.3, -0.05, 0]} rotation-y={0.12}>
        <RoundedBox args={[5.2, 0.16, 3.6]} radius={0.05}>
          <meshPhysicalMaterial attach="material" color="#4a2e22" roughness={0.6} clearcoat={0.25} />
        </RoundedBox>
        <mesh position={[1.9, 0.09, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.08, 3.6]} />
          <meshStandardMaterial color="#b8873a" />
        </mesh>
      </group>
      <SoftShadow size={7} opacity={0.5} position={[0, -0.1, 0]} />
      {GUIDES.map((g, i) => (
        <group key={g.href} ref={(el) => void (cards.current[i] = el)} position={[8, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={tall ? 0.8 : 1}>
          <Postcard title={g.title} kicker={g.kicker} hue={g.hue} />
        </group>
      ))}
    </>
  );
}
