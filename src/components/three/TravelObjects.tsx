"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * Small procedural travel objects (passport, boarding pass, suitcase,
 * documents, parcel, compass) used as 3D motifs. Each is a handful of
 * primitives with a canvas texture, so they cost almost nothing to load.
 */

const GOLD = "#d9a95b";
const NAVY = "#13254a";

export function canvasTexture(w: number, h: number, paint: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paint(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function Passport() {
  const cover = useMemo(
    () =>
      canvasTexture(512, 720, (g) => {
        g.fillStyle = NAVY;
        g.fillRect(0, 0, 512, 720);
        g.strokeStyle = GOLD;
        g.fillStyle = GOLD;
        g.lineWidth = 6;
        g.beginPath();
        g.arc(256, 330, 110, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.ellipse(256, 330, 46, 110, 0, 0, Math.PI * 2);
        g.stroke();
        [-55, 0, 55].forEach((dy) => {
          g.beginPath();
          const half = Math.sqrt(110 * 110 - dy * dy);
          g.moveTo(256 - half, 330 + dy);
          g.lineTo(256 + half, 330 + dy);
          g.stroke();
        });
        g.font = "600 46px Georgia, serif";
        g.textAlign = "center";
        g.fillText("PASSPORT", 256, 150);
        g.font = "28px Georgia, serif";
        g.fillText("TRAVEL SMART", 256, 560);
        g.strokeRect(150, 610, 212, 44);
      }),
    [],
  );
  return (
    <group>
      <RoundedBox args={[1.4, 1.95, 0.16]} radius={0.06} smoothness={4}>
        <meshStandardMaterial attach="material" color={NAVY} roughness={0.55} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0, 0.081]}>
        <planeGeometry args={[1.32, 1.86]} />
        <meshStandardMaterial map={cover} roughness={0.5} metalness={0.25} />
      </mesh>
      {/* page edges */}
      <mesh position={[0.66, 0, 0]}>
        <boxGeometry args={[0.06, 1.86, 0.12]} />
        <meshStandardMaterial color="#efe6d2" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function BoardingPass() {
  const tex = useMemo(
    () =>
      canvasTexture(1024, 420, (g) => {
        g.fillStyle = "#f4eee2";
        g.fillRect(0, 0, 1024, 420);
        g.fillStyle = NAVY;
        g.fillRect(0, 0, 1024, 70);
        g.fillStyle = GOLD;
        g.font = "600 34px Arial, sans-serif";
        g.fillText("BS TRAVELS  ·  BOARDING PASS", 40, 48);
        g.fillStyle = "#7a7468";
        g.font = "22px Arial, sans-serif";
        g.fillText("FROM", 40, 130);
        g.fillText("TO", 380, 130);
        g.fillText("PASSENGER", 40, 290);
        g.fillText("CHAPTER", 380, 290);
        g.fillStyle = "#0a1326";
        g.font = "600 78px Georgia, serif";
        g.fillText("JAF", 40, 215);
        g.fillStyle = "#b8873a";
        g.fillText("NEXT", 380, 215);
        g.fillStyle = "#0a1326";
        g.font = "34px Georgia, serif";
        g.fillText("You", 40, 340);
        g.fillText("Begins here", 380, 340);
        g.strokeStyle = "#b9b1a0";
        g.setLineDash([8, 10]);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(760, 80);
        g.lineTo(760, 420);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = "#0a1326";
        for (let i = 0; i < 34; i++) g.fillRect(800 + i * 5.6, 120, i % 3 === 0 ? 3.6 : 2, 220);
        // little plane between the codes
        g.fillStyle = "#b8873a";
        g.beginPath();
        g.moveTo(330, 190);
        g.lineTo(250, 170);
        g.lineTo(250, 210);
        g.closePath();
        g.fill();
      }),
    [],
  );
  const geo = useMemo(() => {
    // gently curved ticket
    const g = new THREE.PlaneGeometry(2.6, 1.07, 24, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) / 2.6) * Math.PI) * 0.08);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.7} />
    </mesh>
  );
}

export function Suitcase() {
  return (
    <group>
      <RoundedBox args={[1.5, 1.9, 0.62]} radius={0.12} smoothness={4}>
        <meshStandardMaterial attach="material" color={GOLD} roughness={0.35} metalness={0.55} />
      </RoundedBox>
      {[-0.42, 0, 0.42].map((x) => (
        <mesh key={x} position={[x, 0, 0.315]}>
          <boxGeometry args={[0.06, 1.7, 0.02]} />
          <meshStandardMaterial color="#b98a3e" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.18, 0]}>
        <torusGeometry args={[0.28, 0.05, 12, 32, Math.PI]} />
        <meshStandardMaterial color="#1a1f2e" roughness={0.6} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, -1.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
          <meshStandardMaterial color="#141822" />
        </mesh>
      ))}
      {/* luggage tag */}
      <group position={[0.62, 0.9, 0.34]} rotation={[0, 0, -0.35]}>
        <mesh>
          <boxGeometry args={[0.32, 0.5, 0.02]} />
          <meshStandardMaterial color="#f4eee2" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.1, 0.012]}>
          <planeGeometry args={[0.2, 0.04]} />
          <meshBasicMaterial color={NAVY} />
        </mesh>
      </group>
    </group>
  );
}

export function Documents() {
  const page = useMemo(
    () =>
      canvasTexture(512, 700, (g) => {
        g.fillStyle = "#f7f2e7";
        g.fillRect(0, 0, 512, 700);
        g.fillStyle = "#0a1326";
        g.font = "600 34px Georgia, serif";
        g.fillText("Certified Translation", 40, 80);
        g.fillStyle = "#9a9384";
        for (let i = 0; i < 14; i++) g.fillRect(40, 130 + i * 32, 260 + ((i * 97) % 170), 9);
        g.strokeStyle = "#b8873a";
        g.lineWidth = 6;
        g.beginPath();
        g.arc(400, 600, 56, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = "#b8873a";
        g.font = "600 22px Arial";
        g.textAlign = "center";
        g.fillText("SWORN", 400, 608);
      }),
    [],
  );
  const back = useMemo(
    () =>
      canvasTexture(512, 700, (g) => {
        g.fillStyle = "#ece4d2";
        g.fillRect(0, 0, 512, 700);
        g.fillStyle = "#8f8878";
        g.font = "30px Arial";
        g.fillText("தமிழ்  ·  සිංහල", 40, 80);
        for (let i = 0; i < 15; i++) g.fillRect(40, 130 + i * 32, 220 + ((i * 53) % 200), 9);
      }),
    [],
  );
  return (
    <group>
      <mesh position={[-0.28, 0.12, -0.06]} rotation={[0, 0, 0.12]}>
        <planeGeometry args={[1.4, 1.92]} />
        <meshStandardMaterial map={back} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      <mesh rotation={[0, 0, -0.06]}>
        <planeGeometry args={[1.4, 1.92]} />
        <meshStandardMaterial map={page} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Parcel() {
  return (
    <group>
      <RoundedBox args={[1.4, 1.0, 1.1]} radius={0.04} smoothness={2}>
        <meshStandardMaterial attach="material" color="#b7865a" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.505, 0]}>
        <boxGeometry args={[0.24, 0.01, 1.12]} />
        <meshStandardMaterial color="#d9c19a" roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 0.1, 0.556]}>
        <planeGeometry args={[0.5, 0.34]} />
        <meshStandardMaterial color="#f4eee2" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function CompassObject() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.95, 0.95, 0.22, 48]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.112, 0]}>
        <cylinderGeometry args={[0.82, 0.82, 0.01, 48]} />
        <meshStandardMaterial color="#0f1b33" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[0, 0.6, 0]}>
        <coneGeometry args={[0.1, 1.2, 4]} />
        <meshStandardMaterial color="#f4eee2" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function StampObject() {
  const tex = useMemo(
    () =>
      canvasTexture(400, 400, (g) => {
        g.fillStyle = "#f4eee2";
        g.fillRect(0, 0, 400, 400);
        g.strokeStyle = "#b8873a";
        g.lineWidth = 10;
        g.beginPath();
        g.arc(200, 200, 150, 0, Math.PI * 2);
        g.stroke();
        g.lineWidth = 4;
        g.beginPath();
        g.arc(200, 200, 120, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = "#b8873a";
        g.font = "600 52px Georgia";
        g.textAlign = "center";
        g.fillText("EXTENDED", 200, 218);
      }),
    [],
  );
  return (
    <group>
      <RoundedBox args={[1.6, 1.6, 0.05]} radius={0.04}>
        <meshStandardMaterial attach="material" map={tex} roughness={0.85} />
      </RoundedBox>
    </group>
  );
}

/** Gentle float and spin, with a little extra tilt towards the pointer. */
export function Floating({
  children,
  speed = 1,
  amplitude = 0.12,
  spin = 0.25,
  phase = 0,
  pointer,
}: {
  children: ReactNode;
  speed?: number;
  amplitude?: number;
  spin?: number;
  phase?: number;
  pointer?: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    const o = g.current;
    if (!o) return;
    const t = clock.elapsedTime * speed + phase;
    o.position.y = Math.sin(t) * amplitude;
    o.rotation.y = Math.sin(t * 0.6) * spin + (pointer ? pointer.current.x * 0.25 : 0);
    const tx = Math.cos(t * 0.8) * spin * 0.4 + (pointer ? pointer.current.y * 0.15 : 0);
    o.rotation.x = THREE.MathUtils.damp(o.rotation.x, tx, 3, delta);
  });
  return <group ref={g}>{children}</group>;
}

/** Shared studio lighting for the object scenes. */
export function ObjectLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff1dc" />
      <directionalLight position={[-4, -1, 2]} intensity={0.6} color="#8fb0ff" />
      <pointLight position={[0, 0, -3]} intensity={6} color="#e3b467" distance={8} />
    </>
  );
}

export const serviceObject: Record<string, () => React.JSX.Element> = {
  "visa-consultancy": Passport,
  "air-ticketing": BoardingPass,
  "immigration-support": Suitcase,
  "sworn-translation": Documents,
  "tour-packages": CompassObject,
  "visa-extension": StampObject,
  "international-courier": Parcel,
};
