"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { sceneState, useSceneState } from "@/components/home/sceneState";
import { checklists } from "@/content/checklists";
import { Passport } from "../TravelObjects";
import { Folder, Pen, useChecklistSheet } from "../ObjectsExtra";
import { damp, enterAmount, exitAmount } from "../choreo";
import { SoftShadow, usePointer, useSectionProgress } from "./common";

const SHEETS = 6;

function Sheet({ index, title }: { index: number; title: string }) {
  const tex = useChecklistSheet(title, 9, index === SHEETS - 1 ? 3 : 0);
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[1.8, 2.4]} />
      <meshStandardMaterial map={tex} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * Checklists: a document folder opens as the section arrives. Ticking items
 * in the HTML checklist files completed sheets into the folder's pocket.
 */
export function FolderScene() {
  const progress = useSectionProgress("folder");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 0.9;
  const slug = useSceneState((s) => s.checklist.slug);
  const title = checklists.find((c) => c.slug === slug)?.title.replace(/ Checklist$/, "") ?? "";
  const cover = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const rig = useRef<THREE.Group>(null);
  const sheets = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    const { done, total } = sceneState.get().checklist;
    const filed = total ? Math.round((done / total) * SHEETS) : 0;
    if (cover.current) cover.current.rotation.z = damp(cover.current.rotation.z, Math.PI * (1 - enter) * 0.98, 4, delta);
    sheets.current.forEach((g, i) => {
      if (!g) return;
      // sheets are filed from the top of the stack down
      const isFiled = SHEETS - 1 - i < filed;
      const tx = isFiled ? -1.05 + (i % 2) * 0.04 : 1.25 + Math.sin(i * 2.1) * 0.06;
      const ty = isFiled ? 0.05 + (SHEETS - i) * 0.004 : 0.12 + i * 0.035 + Math.sin(t * 0.8 + i) * 0.01;
      const tz = isFiled ? 0.25 : -0.05 + Math.cos(i * 1.7) * 0.05;
      g.position.x = damp(g.position.x, tx, 4, delta);
      g.position.y = damp(g.position.y, ty + Math.max(0, 1 - enter) * (1 + i * 0.3), 4, delta);
      g.position.z = damp(g.position.z, tz, 4, delta);
      g.rotation.y = damp(g.rotation.y, isFiled ? 0.02 : (i - 3) * 0.04, 4, delta);
    });
    if (rig.current) {
      rig.current.rotation.y = damp(rig.current.rotation.y, pointer.current.x * 0.12, 3, delta);
      rig.current.position.y = exit * 1.5;
    }
    const c = cam.current;
    if (c) {
      c.position.set(tall ? 0.2 : 0.6, tall ? 9 : 6.4, tall ? 5.2 : 5.2);
      c.lookAt(tall ? 0.1 : 0.3, 0, 0.2);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0.6, 6.4, 5.2]} fov={tall ? 50 : 38} near={0.1} far={60} />
      <fog attach="fog" args={["#0a1326", 7.5, 13]} />
      <hemisphereLight args={["#fff1dc", "#0a1326", 0.6]} />
      <spotLight position={[2, 7, 3]} angle={0.6} penumbra={0.9} intensity={80} decay={2} color="#ffe2bf" />
      <directionalLight position={[-4, 3, 2]} intensity={0.35} color="#9fb8ff" />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#15203a" roughness={0.85} />
      </mesh>
      <group ref={rig}>
        <SoftShadow size={6.5} opacity={0.55} position={[0, -0.04, 0]} />
        <Folder ref={cover} label="Travel documents" />
        {Array.from({ length: SHEETS }, (_, i) => (
          <group key={i} ref={(g) => void (sheets.current[i] = g)} position={[1.25, 2, 0]}>
            <Sheet index={i} title={title} />
          </group>
        ))}
        <group position={[-2.9, 0.1, -0.6]} rotation={[-Math.PI / 2, 0, 0.35]} scale={0.6}>
          <Passport />
        </group>
        <group position={[2.6, 0.08, 1.3]} rotation-y={0.6} scale={0.8}>
          <Pen />
        </group>
      </group>
    </>
  );
}
