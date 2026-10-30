"use client";

import { useMemo } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useStage } from "@/components/home/HomeExperience";
import { BoardingPass, CompassObject, Documents, Floating, ObjectLights, Parcel, Passport, Suitcase, StampObject } from "./TravelObjects";

/** Soft additive glow disc that sits behind an object. */
export function Glow({ color = "#e3b467", size = 4, opacity = 0.35, position = [0, 0, -1.5] as [number, number, number] }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/** Drifting specks of light, used to give scenes depth. */
export function Specks({ count = 60, spread = [6, 4, 3] as [number, number, number], color = "#f4eee2", size = 0.04 }) {
  const positions = useMemo(() => {
    let s = 7;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (r() - 0.5) * spread[0];
      a[i * 3 + 1] = (r() - 0.5) * spread[1];
      a[i * 3 + 2] = (r() - 0.5) * spread[2];
    }
    return a;
  }, [count, spread]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const featured: Record<string, { el: () => React.JSX.Element; scale: number; tilt: [number, number, number] }> = {
  "visa-consultancy": { el: Passport, scale: 1.15, tilt: [0.1, -0.5, 0.12] },
  "air-ticketing": { el: BoardingPass, scale: 1.05, tilt: [-0.2, -0.35, 0.08] },
  "immigration-support": { el: Suitcase, scale: 0.95, tilt: [0.05, -0.55, 0.05] },
};

/** The 3D motif inside a featured service panel. */
export function ServiceCardScene({ slug, large }: { slug: string; large: boolean }) {
  const { pointer } = useStage();
  const f = featured[slug];
  if (!f) return null;
  const El = f.el;
  return (
    <>
      <color attach="background" args={["#0f1b33"]} />
      <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={32} />
      <ObjectLights />
      <group position={[large ? 0.1 : 1.6, large ? 0.5 : 0.15, 0]}>
        <Glow size={large ? 6 : 4.5} opacity={0.28} />
        <Floating pointer={pointer} phase={slug.length}>
          <group rotation={f.tilt} scale={large ? f.scale * 0.8 : f.scale * 0.85}>
            <El />
          </group>
        </Floating>
      </group>
      <Specks count={40} spread={[10, 7, 3]} />
    </>
  );
}

/** A small cluster for the supporting services: translation, stamp, parcel, compass. */
export function SupportingScene() {
  const { pointer } = useStage();
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={34} />
      <ObjectLights />
      <Glow size={7} opacity={0.22} position={[0, 0, -2]} />
      <group position={[-0.7, 0.8, 0]} rotation={[0.1, 0.4, 0.1]} scale={1.05}>
        <Floating pointer={pointer} phase={1}>
          <Documents />
        </Floating>
      </group>
      <group position={[1.15, -1.1, 0.4]} rotation={[0.4, -0.6, 0]} scale={0.8}>
        <Floating pointer={pointer} phase={2.4} amplitude={0.08}>
          <Parcel />
        </Floating>
      </group>
      <group position={[1.4, 1.4, -0.6]} rotation={[0.2, -0.4, 0.3]} scale={0.55}>
        <Floating pointer={pointer} phase={4}>
          <StampObject />
        </Floating>
      </group>
      <group position={[-1.3, -1.4, 0.2]} scale={0.6}>
        <Floating pointer={pointer} phase={5.5} spin={0.6}>
          <CompassObject />
        </Floating>
      </group>
    </>
  );
}
