"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { sceneState, useSceneState } from "@/components/home/sceneState";
import { BoardingPass, Documents, Passport } from "../TravelObjects";
import { Calendar, Pen } from "../ObjectsExtra";
import { damp, enterAmount, exitAmount } from "../choreo";
import { SoftShadow, usePointer, useSectionProgress } from "./common";

const lerp = THREE.MathUtils.lerp;

/**
 * Appointment: a desk with a calendar, boarding pass and papers. The chosen
 * date is circled on the calendar, and as the form fills in the papers are
 * squared up and the boarding pass settles onto the passport.
 */
export function DeskScene() {
  const progress = useSectionProgress("desk");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 0.9;
  const date = useSceneState((s) => s.appointment.date);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const pass = useRef<THREE.Group>(null);
  const docs = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.SpotLight>(null);
  const tidy = useRef(0);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    tidy.current = damp(tidy.current, sceneState.get().appointment.progress, 2.5, delta);
    const k = tidy.current;
    if (pass.current) {
      pass.current.position.set(lerp(1.9, 0.95, k), 0.02 + k * 0.1, lerp(1.6, 1.05, k));
      pass.current.rotation.z = lerp(0.9, 0.08, k);
    }
    if (docs.current) docs.current.rotation.z = lerp(-0.5, -0.05, k) + Math.sin(t * 0.3) * 0.005;
    if (lamp.current) lamp.current.intensity = 70 + k * 50;
    const c = cam.current;
    if (c) {
      c.position.x = damp(c.position.x, (tall ? 0.6 : 2.2) + pointer.current.x * 0.5 - (1 - enter) * 2, 3, delta);
      c.position.y = damp(c.position.y, (tall ? 7 : 4.2) + (1 - enter) * 2 + exit * 2, 3, delta);
      c.position.z = tall ? 7 : 7.2;
      c.lookAt(tall ? 0.2 : 0.4, 0.6, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[2.2, 4.2, 7.2]} fov={tall ? 48 : 34} near={0.1} far={60} />
      <fog attach="fog" args={["#0a1326", 7, 13]} />
      <hemisphereLight args={["#ffe9cc", "#0a1326", 0.45]} />
      <spotLight ref={lamp} position={[-2.5, 6, 2]} angle={0.7} penumbra={0.9} intensity={70} decay={2} color="#ffd9a6" />
      <directionalLight position={[5, 3, 4]} intensity={0.35} color="#9fb8ff" />
      {/* walnut desk */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#2a1c16" roughness={0.55} metalness={0.05} />
      </mesh>
      <group position={[-1.2, 0, -0.6]} rotation-y={0.25} scale={0.9}>
        <Calendar date={date} />
      </group>
      <SoftShadow size={3.6} opacity={0.55} position={[-1.2, 0.01, -0.4]} />
      <group position={[1, 0.08, 1]} rotation={[-Math.PI / 2, 0, 0.1]} scale={0.6}>
        <Passport />
      </group>
      <group ref={pass} rotation-x={-Math.PI / 2} scale={0.55}>
        <BoardingPass />
      </group>
      <group ref={docs} position={[2.6, 0.03, -0.4]} rotation={[-Math.PI / 2, 0, -0.5]} scale={0.7}>
        <Documents />
      </group>
      <group position={[0.4, 0.07, 2.1]} rotation-y={-0.4} scale={0.7}>
        <Pen />
      </group>
    </>
  );
}
