"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/components/home/sceneState";
import { JOURNEY } from "@/components/home/homeData";
import { Aircraft } from "../Aircraft";
import { damp } from "../choreo";
import { LANDMARKS } from "./Landmarks";
import { SoftShadow, usePointer } from "./common";

const GAP = 20;
const stopAt = (i: number) => new THREE.Vector3(i * GAP, 0, Math.sin(i * 1.3) * 7);
const smooth = (x: number) => x * x * (3 - 2 * x);

/** Where the camera sits and looks for each stop, for the current frame shape. */
function framing(i: number, tall: boolean) {
  const def = LANDMARKS[JOURNEY[i].slug];
  const s = stopAt(i);
  const h = def.height;
  const dist = Math.max(15, h * 2.45) * (tall ? 1.3 : 1);
  const pos = new THREE.Vector3(s.x - dist * 0.22, h * 0.55 + dist * 0.28, s.z + dist);
  // Desktop: the landmark sits right of centre, clear of the card on the left.
  // Tall screens: it sits in the upper half, clear of the card at the bottom.
  const look = new THREE.Vector3(s.x - (tall ? 0.6 : dist * 0.12), tall ? h * 0.45 - dist * 0.24 : h * 0.45, s.z);
  return { pos, look };
}

/**
 * Destinations: an island-hopping flight from Jaffna. Scrolling the section
 * carries the camera from one island to the next, each holding a stylised
 * landmark of a destination people ask BS Travels about.
 */
export function JourneyScene() {
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 0.9;
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const jet = useRef<THREE.Group>(null);
  const sea = useRef<THREE.Mesh>(null);
  const islands = useRef<(THREE.Group | null)[]>([]);
  const frames = useMemo(() => JOURNEY.map((_, i) => framing(i, tall)), [tall]);
  const stops = useMemo(() => JOURNEY.map((_, i) => stopAt(i)), []);
  const look = useRef(frames[0].look.clone());
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3() }), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const last = JOURNEY.length - 1;
    const j = THREE.MathUtils.clamp(sceneState.get().journey, 0, last);
    const i = Math.min(Math.floor(j), last - 1);
    const e = smooth(THREE.MathUtils.clamp((j - i - 0.2) / 0.6, 0, 1));
    const lift = Math.sin(Math.PI * e);

    tmp.pos.lerpVectors(frames[i].pos, frames[i + 1].pos, e);
    tmp.pos.y += lift * 5;
    tmp.pos.x += Math.sin(t * 0.15) * 0.6 + pointer.current.x * 0.8;
    tmp.pos.y -= pointer.current.y * 0.4;
    tmp.look.lerpVectors(frames[i].look, frames[i + 1].look, e);
    tmp.look.y += lift * 1.5;

    const c = cam.current;
    if (c) {
      c.position.x = damp(c.position.x, tmp.pos.x, 3.5, delta);
      c.position.y = damp(c.position.y, tmp.pos.y, 3.5, delta);
      c.position.z = damp(c.position.z, tmp.pos.z, 3.5, delta);
      look.current.x = damp(look.current.x, tmp.look.x, 3.5, delta);
      look.current.y = damp(look.current.y, tmp.look.y, 3.5, delta);
      look.current.z = damp(look.current.z, tmp.look.z, 3.5, delta);
      c.lookAt(look.current);
      if (sea.current) sea.current.position.x = c.position.x;
    }

    // The aircraft flies just ahead of the camera between islands.
    const p = jet.current;
    if (p) {
      const u = Math.min(1, e + 0.18);
      tmp.a.lerpVectors(stops[i], stops[i + 1], u);
      tmp.b.lerpVectors(stops[i], stops[i + 1], Math.min(1, u + 0.02));
      p.visible = e > 0.02 && e < 0.9;
      p.position.set(tmp.a.x, 3.5 + Math.sin(Math.PI * u) * 5, tmp.a.z);
      p.lookAt(tmp.b.x, p.position.y, tmp.b.z);
      p.rotateY(-Math.PI / 2);
      p.rotateX(Math.sin(t * 0.8) * 0.06);
    }

    // Only the islands near the camera are drawn; the active one rises gently.
    islands.current.forEach((g, k) => {
      if (!g) return;
      const d = Math.abs(k - j);
      g.visible = d < 1.6;
      g.position.y = damp(g.position.y, d < 0.5 ? 0 : -0.35, 3, delta);
      g.rotation.y = d < 0.5 ? Math.sin(t * 0.12) * 0.05 : g.rotation.y;
    });
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={frames[0].pos.toArray()} fov={tall ? 50 : 36} near={0.1} far={120} />
      <fog attach="fog" args={["#0a1326", 30, 70]} />
      <hemisphereLight args={["#c9d6f2", "#0a1326", 0.75]} />
      <directionalLight position={[-6, 10, 8]} intensity={2.4} color="#ffd9ad" />
      <directionalLight position={[8, 4, -6]} intensity={0.6} color="#9fb8ff" />
      <Stars radius={70} depth={30} count={1200} factor={3} saturation={0} fade speed={0.4} />
      <mesh ref={sea} rotation-x={-Math.PI / 2} position={[0, -0.4, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#0c2036" roughness={0.35} metalness={0.25} />
      </mesh>
      {JOURNEY.map(({ slug }, k) => {
        const def = LANDMARKS[slug];
        const s = stops[k];
        return (
          <group key={slug} ref={(g) => void (islands.current[k] = g)} position={[s.x, 0, s.z]}>
            <mesh position={[0, -0.32, 0]}>
              <cylinderGeometry args={[4.5, 5.2, 0.64, 48]} />
              <meshStandardMaterial color={def.ground} roughness={0.95} />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[5.25, 5.6, 0.3, 48]} />
              <meshStandardMaterial color="#c2a87e" roughness={1} />
            </mesh>
            <SoftShadow size={7} opacity={0.35} position={[0, 0.01, 0]} />
            {def.model()}
          </group>
        );
      })}
      <group ref={jet} scale={0.3}>
        <Aircraft detail="low" />
      </group>
    </>
  );
}
