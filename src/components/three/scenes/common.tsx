"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStage } from "@/components/home/HomeExperience";

/** Scroll progress ref for a named homepage section. */
export function useSectionProgress(name: string) {
  return useStage().progress(name);
}

const v = new THREE.Vector3();

/**
 * Keeps a DOM element (registered under `name` in the stage anchors) pinned
 * over this group's world position, in percentages of the tracked slot.
 * Hidden when the point is behind the camera or `visible` returns false.
 */
export function Anchor({ name, visible }: { name: string; visible?: () => boolean }) {
  const { anchors } = useStage();
  const g = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useFrame(() => {
    const el = anchors.current.get(name);
    if (!el || !g.current) return;
    g.current.getWorldPosition(v);
    v.project(camera);
    const show = v.z < 1 && (visible ? visible() : true);
    el.style.left = `${(v.x * 0.5 + 0.5) * 100}%`;
    el.style.top = `${(-v.y * 0.5 + 0.5) * 100}%`;
    el.style.opacity = show ? "1" : "0";
    el.style.pointerEvents = show ? "auto" : "none";
  });
  return <group ref={g} />;
}

/** A soft, drawn contact shadow under objects without a full shadow pass. */
export function SoftShadow({ size = 3, opacity = 0.45, position = [0, 0, 0] as [number, number, number] }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.9)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.35)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/** Pointer in -1..1 from the stage, for restrained camera parallax. */
export function usePointer() {
  return useStage().pointer;
}

export function isNarrow(width: number) {
  return width < 768;
}
