"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/components/home/sceneState";
import { faqs } from "@/content/faqs";
import { Aircraft } from "../Aircraft";
import { Documents, Passport, Suitcase } from "../TravelObjects";
import { damp, enterAmount, exitAmount } from "../choreo";
import { SoftShadow, usePointer, useSectionProgress } from "./common";

/**
 * FAQ: a quiet still life. Opening a question nudges the object it relates
 * to: the passport for visas, the route and a small aircraft for travel,
 * papers for documents and the suitcase for general questions.
 */
export function FaqScene() {
  const progress = useSectionProgress("faq");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 0.9;
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const passport = useRef<THREE.Group>(null);
  const suitcase = useRef<THREE.Group>(null);
  const papers = useRef<THREE.Group>(null);
  const jet = useRef<THREE.Group>(null);
  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(new THREE.Vector3(-3, 0.02, 1.4), new THREE.Vector3(0.2, 2.6, -1.6), new THREE.Vector3(3.2, 0.02, -0.4)),
    [],
  );
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
    const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: "#e3b467", dashSize: 0.12, gapSize: 0.1, transparent: true, opacity: 0.6 }));
    l.computeLineDistances();
    return l;
  }, [curve]);
  const fly = useRef(1);
  const last = useRef<string | null>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    const id = sceneState.get().faq;
    const topic = faqs.find((f) => f.id === id)?.topic ?? null;
    if (id !== last.current) {
      last.current = id;
      if (topic === "travel") fly.current = 0;
    }
    const pp = passport.current;
    if (pp) {
      const on = topic === "visas";
      pp.position.y = damp(pp.position.y, on ? 0.9 : 0.09, 4, delta);
      pp.rotation.x = damp(pp.rotation.x, on ? -0.9 : -Math.PI / 2, 4, delta);
      pp.rotation.z = damp(pp.rotation.z, on ? 0.1 + Math.sin(t) * 0.04 : 0.4, 4, delta);
    }
    const sc = suitcase.current;
    if (sc) {
      const on = topic === "general";
      sc.rotation.z = damp(sc.rotation.z, on ? Math.sin(t * 2) * 0.05 : 0, 4, delta);
      sc.position.y = damp(sc.position.y, (on ? 0.78 : 0.62) + (1 - enter) * -2, 4, delta);
    }
    const pa = papers.current;
    if (pa) {
      const on = topic === "documents";
      pa.position.y = damp(pa.position.y, on ? 0.7 : 0.05, 4, delta);
      pa.rotation.x = damp(pa.rotation.x, on ? -1.0 : -Math.PI / 2, 4, delta);
    }
    // the small aircraft flies the route once when a travel question opens
    const j = jet.current;
    if (j) {
      fly.current = Math.min(1, fly.current + delta * 0.35);
      j.visible = fly.current < 1;
      curve.getPointAt(fly.current, tmp);
      curve.getPointAt(Math.min(1, fly.current + 0.01), ahead);
      j.position.copy(tmp);
      j.lookAt(ahead);
      j.rotateY(-Math.PI / 2);
    }
    (line.material as THREE.LineDashedMaterial).opacity = topic === "travel" ? 0.95 : 0.45;
    const c = cam.current;
    if (c) {
      c.position.x = damp(c.position.x, (tall ? 0 : 1) + pointer.current.x * 0.5, 3, delta);
      c.position.y = (tall ? 7.5 : 4.6) + exit * 2;
      c.position.z = tall ? 8 : 8.5;
      c.lookAt(0, 0.4, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[1, 4.6, 8.5]} fov={tall ? 48 : 34} near={0.1} far={60} />
      <fog attach="fog" args={["#0a1326", 8, 15]} />
      <hemisphereLight args={["#e6ecff", "#0a1326", 0.6]} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} color="#fff0dc" />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#121b30" roughness={0.9} />
      </mesh>
      <primitive object={line} />
      <group ref={suitcase} position={[-1.8, 0.62, -0.6]} rotation-y={0.5} scale={0.55}>
        <Suitcase />
      </group>
      <SoftShadow size={2.4} opacity={0.5} position={[-1.8, 0.01, -0.6]} />
      <group ref={passport} position={[0.6, 0.09, 1.1]} rotation={[-Math.PI / 2, 0, 0.4]} scale={0.6}>
        <Passport />
      </group>
      <group ref={papers} position={[2.1, 0.05, 0.6]} rotation={[-Math.PI / 2, 0, -0.3]} scale={0.6}>
        <Documents />
      </group>
      <group ref={jet} scale={0.12} visible={false}>
        <Aircraft detail="low" />
      </group>
    </>
  );
}
