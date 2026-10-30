"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

/**
 * Stylised landmark models for the destination journey, built from simple
 * primitives. Each evokes the best-known scenery of a place; none is an
 * architectural model. Units: ground at y = 0, footprint within about 3.5
 * of the origin.
 */

const STONE = "#e6dcc7";
const MARBLE = "#f3efe6";
const GOLD = "#e3b467";

type V2 = [number, number];

function Lathe({ profile, segments = 24, color, flat = false, ...rest }: { profile: V2[]; segments?: number; color: string; flat?: boolean } & ThreeElements["mesh"]) {
  const geo = useMemo(() => new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), segments), [profile, segments]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} {...rest}>
      <meshStandardMaterial color={color} roughness={0.7} flatShading={flat} />
    </mesh>
  );
}

function Box({ size, color, rough = 0.75, metal = 0, ...rest }: { size: [number, number, number]; color: string; rough?: number; metal?: number } & ThreeElements["mesh"]) {
  return (
    <mesh {...rest}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

function Cyl({ r, r2 = r, h, seg = 16, color, rough = 0.7, metal = 0, flat = false, ...rest }: { r: number; r2?: number; h: number; seg?: number; color: string; rough?: number; metal?: number; flat?: boolean } & ThreeElements["mesh"]) {
  return (
    <mesh {...rest}>
      <cylinderGeometry args={[r2, r, h, seg]} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} flatShading={flat} />
    </mesh>
  );
}

function Water({ size = 7, z = 0, x = 0 }: { size?: number; x?: number; z?: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[x, 0.02, z]}>
      <circleGeometry args={[size / 2, 48]} />
      <meshStandardMaterial color="#1d4a63" roughness={0.15} metalness={0.2} />
    </mesh>
  );
}

function Pine({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <Cyl r={0.06} h={0.3} color="#5a4030" position={[0, 0.15, 0]} seg={6} />
      <Cyl r={0.42} r2={0} h={0.9} color="#24452f" position={[0, 0.7, 0]} seg={7} flat />
      <Cyl r={0.3} r2={0} h={0.7} color="#2c5238" position={[0, 1.05, 0]} seg={7} flat />
    </group>
  );
}

function Palm({ x, z, s = 1, lean = 0.15 }: { x: number; z: number; s?: number; lean?: number }) {
  return (
    <group position={[x, 0, z]} scale={s} rotation-z={lean}>
      <Cyl r={0.07} r2={0.05} h={1.8} color="#7a5a3a" position={[0, 0.9, 0]} seg={6} />
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[0, 1.8, 0]} rotation={[0, (i / 6) * Math.PI * 2, 0]}>
          <mesh position={[0.45, -0.1, 0]} rotation-z={-0.45}>
            <boxGeometry args={[0.9, 0.03, 0.22]} />
            <meshStandardMaterial color="#3d6b3a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Dune({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <mesh position={[x, 0, z]} scale={[1.6 * s, 0.45 * s, 1 * s]}>
      <sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#c9a46e" roughness={0.95} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- India */

const ONION: V2[] = [[0, 0], [0.95, 0], [1.12, 0.45], [1.05, 1.0], [0.7, 1.5], [0.3, 1.9], [0.08, 2.15], [0, 2.3]];
const SMALL_DOME: V2[] = [[0, 0], [0.3, 0], [0.34, 0.15], [0.22, 0.38], [0.05, 0.52], [0, 0.56]];

function Minaret({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.3, z]}>
      <Cyl r={0.17} r2={0.13} h={3.4} color={MARBLE} position={[0, 1.7, 0]} />
      {[1.1, 2.2, 3.2].map((y) => (
        <Cyl key={y} r={0.22} h={0.08} color={STONE} position={[0, y, 0]} />
      ))}
      <Cyl r={0.2} h={0.25} color={MARBLE} position={[0, 3.5, 0]} seg={8} />
      <Lathe profile={SMALL_DOME} color={MARBLE} position={[0, 3.62, 0]} scale={0.7} />
    </group>
  );
}

function TajMahal() {
  return (
    <group>
      <Box size={[6.4, 0.3, 6.4]} color={STONE} position={[0, 0.15, 0]} />
      <Cyl r={2.1} h={2.2} seg={8} color={MARBLE} position={[0, 1.4, 0]} rotation-y={Math.PI / 8} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation-y={(i * Math.PI) / 2} position={[0, 0, 0]}>
          <mesh position={[0, 1.2, 1.95]}>
            <planeGeometry args={[0.75, 1.3]} />
            <meshStandardMaterial color="#5a6178" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <Cyl r={0.95} h={0.5} color={MARBLE} position={[0, 2.75, 0]} />
      <Lathe profile={ONION} color={MARBLE} position={[0, 3.0, 0]} />
      <Cyl r={0.03} h={0.6} color={GOLD} position={[0, 5.5, 0]} metal={0.6} rough={0.3} />
      {[[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 2.5, z]}>
          <Cyl r={0.32} h={0.4} seg={8} color={MARBLE} position={[0, 0.2, 0]} />
          <Lathe profile={SMALL_DOME} color={MARBLE} position={[0, 0.4, 0]} />
        </group>
      ))}
      {[[-2.9, -2.9], [2.9, -2.9], [-2.9, 2.9], [2.9, 2.9]].map(([x, z]) => (
        <Minaret key={`${x}${z}`} x={x} z={z} />
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.31, 3.6]}>
        <planeGeometry args={[0.8, 3]} />
        <meshStandardMaterial color="#244d66" roughness={0.1} metalness={0.3} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- Nepal */

function Peak({ x, z, r, h, rot = 0 }: { x: number; z: number; r: number; h: number; rot?: number }) {
  const cap = 0.38;
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      <Cyl r={r} r2={0} h={h} seg={6} color="#5d6676" position={[0, h / 2, 0]} flat />
      <Cyl r={r * cap} r2={0} h={h * cap} seg={6} color="#f1f3f6" position={[0, h - (h * cap) / 2 + 0.02, 0]} flat scale={1.02} />
    </group>
  );
}

function Nepal() {
  return (
    <group>
      <Peak x={-1.4} z={-2.2} r={2.2} h={4.8} rot={0.3} />
      <Peak x={1.6} z={-2.6} r={2} h={4} rot={1.1} />
      <Peak x={0.2} z={-3.4} r={2.6} h={5.6} rot={0.7} />
      <group position={[0.4, 0, 1.2]}>
        <Box size={[3, 0.25, 3]} color="#e9e4d8" position={[0, 0.12, 0]} />
        <Box size={[2.5, 0.25, 2.5]} color="#e9e4d8" position={[0, 0.37, 0]} />
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f6f3ec" roughness={0.6} />
        </mesh>
        <Box size={[0.6, 0.5, 0.6]} color={GOLD} metal={0.5} rough={0.35} position={[0, 1.75, 0]} />
        <Lathe profile={[[0, 0], [0.32, 0], [0.24, 0.3], [0.2, 0.32], [0.14, 0.7], [0.1, 0.72], [0.04, 1.1], [0, 1.2]]} segments={4} color={GOLD} position={[0, 2.0, 0]} rotation-y={Math.PI / 4} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- Thailand */

const PRANG: V2[] = [
  [1.3, 0], [1.3, 0.35], [1.05, 0.35], [1.05, 0.8], [0.88, 0.8], [0.86, 1.5], [0.72, 1.5], [0.7, 2.3], [0.58, 2.3],
  [0.55, 3.0], [0.44, 3.0], [0.4, 3.6], [0.3, 3.7], [0.2, 4.2], [0.1, 4.5], [0.03, 5.1], [0, 5.3],
];

function Thailand() {
  return (
    <group>
      <Box size={[5.6, 0.35, 5.6]} color="#d9cdb4" position={[0, 0.17, 0]} />
      <Lathe profile={PRANG} segments={12} color="#efe5cf" position={[0, 0.35, 0]} />
      <Cyl r={0.04} h={0.5} color={GOLD} metal={0.6} rough={0.3} position={[0, 5.85, 0]} />
      {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z]) => (
        <Lathe key={`${x}${z}`} profile={PRANG} segments={12} color="#e8dcc2" position={[x, 0.35, z]} scale={0.42} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------- Malaysia */

function TwinTower() {
  const tiers: [number, number][] = [[0.62, 2.2], [0.56, 0.9], [0.5, 0.7], [0.43, 0.55], [0.36, 0.45], [0.28, 0.35]];
  let y = 0;
  return (
    <group>
      {tiers.map(([r, h], i) => {
        const el = <Cyl key={i} r={r} h={h} seg={16} color="#c7d0da" metal={0.45} rough={0.32} position={[0, y + h / 2, 0]} />;
        y += h;
        return el;
      })}
      <Cyl r={0.2} r2={0.03} h={0.7} color="#d8dee5" metal={0.5} rough={0.3} position={[0, y + 0.35, 0]} />
      <Cyl r={0.025} h={1.2} color="#e8ecf0" metal={0.6} position={[0, y + 1.2, 0]} />
    </group>
  );
}

function Malaysia() {
  return (
    <group>
      <Box size={[5, 0.25, 3.2]} color="#7f8794" position={[0, 0.12, 0]} />
      <group position={[-1.05, 0.25, 0]}>
        <TwinTower />
      </group>
      <group position={[1.05, 0.25, 0]}>
        <TwinTower />
      </group>
      <Box size={[1.1, 0.16, 0.3]} color="#aeb7c2" metal={0.4} rough={0.35} position={[0, 2.95, 0]} />
      <Cyl r={0.03} h={1.2} color="#aeb7c2" position={[-0.35, 2.4, 0]} rotation-z={-0.5} />
      <Cyl r={0.03} h={1.2} color="#aeb7c2" position={[0.35, 2.4, 0]} rotation-z={0.5} />
      <Palm x={-2.6} z={1.6} s={0.8} />
      <Palm x={2.5} z={1.8} s={0.9} lean={-0.2} />
    </group>
  );
}

/* -------------------------------------------------------------- Vietnam */

function Karst({ x, z, s, rot = 0 }: { x: number; z: number; s: number; rot?: number }) {
  const prof: V2[] = [[0, 0], [0.9, 0], [0.75, 0.6], [0.85, 1.4], [0.6, 2.2], [0.7, 2.7], [0.4, 3.2], [0, 3.35]];
  return <Lathe profile={prof} segments={7} color="#4e6a55" flat position={[x, 0, z]} scale={[s, s * (0.9 + (rot % 0.3)), s]} rotation-y={rot} />;
}

function Junk() {
  const sail = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.75, 0.1);
    s.quadraticCurveTo(0.95, 0.7, 0.7, 1.4);
    s.lineTo(0, 1.3);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  useEffect(() => () => sail.dispose(), [sail]);
  return (
    <group>
      <Box size={[1.8, 0.3, 0.55]} color="#6b4a32" position={[0, 0.15, 0]} />
      <Box size={[0.5, 0.25, 0.5]} color="#7a563a" position={[-0.6, 0.42, 0]} />
      {[-0.35, 0.25, 0.75].map((x, i) => (
        <group key={x} position={[x, 0.3, 0]}>
          <Cyl r={0.02} h={1.6 - i * 0.2} color="#3b2a1e" position={[0, 0.8 - i * 0.1, 0]} />
          <mesh geometry={sail} position={[0.02, 0.15, 0]} scale={1 - i * 0.12}>
            <meshStandardMaterial color="#b85a32" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Vietnam() {
  return (
    <group>
      <Water size={8} />
      <Karst x={-1.8} z={-1.5} s={1.1} rot={0.4} />
      <Karst x={0.4} z={-2.4} s={1.35} rot={1.3} />
      <Karst x={2.3} z={-1} s={0.9} rot={2.2} />
      <Karst x={-2.8} z={0.9} s={0.7} rot={0.9} />
      <Karst x={2.6} z={1.6} s={0.55} rot={1.7} />
      <group position={[0.2, 0.02, 1.4]} rotation-y={-0.4}>
        <Junk />
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------- Dubai */

function BurjKhalifa() {
  const tiers: [number, number, number][] = [
    [0.72, 1.4, 0], [0.62, 1.2, 0.04], [0.54, 1.1, -0.04], [0.46, 1.0, 0.05], [0.38, 0.9, -0.05], [0.3, 0.8, 0.04], [0.22, 0.7, 0], [0.15, 0.6, 0],
  ];
  let y = 0;
  return (
    <group>
      {tiers.map(([r, h, off], i) => {
        const el = (
          <group key={i} position={[off, y + h / 2, -off]}>
            {[0, 1, 2].map((k) => (
              <Cyl
                key={k}
                r={r * 0.62}
                h={h}
                seg={6}
                color="#bfcad6"
                metal={0.5}
                rough={0.3}
                position={[Math.cos((k * Math.PI * 2) / 3) * r * 0.42, 0, Math.sin((k * Math.PI * 2) / 3) * r * 0.42]}
              />
            ))}
          </group>
        );
        y += h;
        return el;
      })}
      <Cyl r={0.08} r2={0.015} h={1.9} color="#dfe5ec" metal={0.6} rough={0.25} position={[0, y + 0.95, 0]} />
    </group>
  );
}

function Dubai() {
  return (
    <group>
      <Box size={[3.2, 0.2, 3.2]} color="#a79b88" position={[0, 0.1, 0]} />
      <group position={[0, 0.2, 0]}>
        <BurjKhalifa />
      </group>
      <Water size={2.6} x={0} z={2.4} />
      <Dune x={-2.6} z={-1.4} s={1} />
      <Dune x={2.7} z={-0.8} s={0.8} />
      <Palm x={-1.7} z={1.9} s={0.7} />
      <Palm x={1.8} z={2.2} s={0.6} lean={-0.2} />
    </group>
  );
}

/* ---------------------------------------------------------------- Qatar */

function Dhow() {
  const sail = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.1, 0.2);
    s.quadraticCurveTo(0.2, 0.6, 1.3, 2.6);
    s.quadraticCurveTo(0.6, 1.2, -0.2, 0.0);
    s.closePath();
    return new THREE.ShapeGeometry(s, 16);
  }, []);
  useEffect(() => () => sail.dispose(), [sail]);
  return (
    <group>
      <Lathe profile={[[0, 0], [0.32, 0.05], [0.42, 0.4], [0, 0.45]]} segments={10} color="#7b5536" scale={[3.4, 1, 1]} rotation-z={0} />
      <Cyl r={0.04} h={2.4} color="#4a3324" position={[0.1, 1.5, 0]} rotation-z={0.12} />
      <mesh geometry={sail} position={[0, 0.5, 0.05]} scale={0.8}>
        <meshStandardMaterial color="#efe4cc" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Qatar() {
  return (
    <group>
      <Water size={4.4} x={0.4} z={1.2} />
      <group position={[0.4, 0.05, 1.3]} rotation-y={-0.35}>
        <Dhow />
      </group>
      <Dune x={-2} z={-1.8} s={1.4} />
      <Dune x={1.4} z={-2.4} s={1.7} />
      <Dune x={-2.9} z={0.8} s={0.8} />
      <Palm x={2.6} z={-0.3} s={0.8} lean={-0.2} />
      <Palm x={-1.7} z={2.3} s={0.7} />
    </group>
  );
}

/* ------------------------------------------------------------ Indonesia */

const BELL: V2[] = [[0, 0], [0.22, 0], [0.24, 0.1], [0.2, 0.28], [0.1, 0.4], [0.04, 0.44], [0.02, 0.62], [0, 0.64]];

function Indonesia() {
  const terraces = [5.6, 4.9, 4.2, 3.5, 2.8];
  const stone = "#8d8677";
  return (
    <group>
      <Cyl r={2.6} r2={0.5} h={3.6} seg={9} color="#3d4148" flat position={[-2.6, 1.8, -3.4]} />
      {terraces.map((w, i) => (
        <Box key={w} size={[w, 0.38, w]} color={i % 2 ? "#958e7e" : stone} position={[0, 0.19 + i * 0.38, 0]} />
      ))}
      {[1.15, 0.85, 0.55].map((r, i) => {
        const y = 1.9 + i * 0.28;
        const n = [16, 12, 8][i];
        return (
          <group key={r}>
            <Cyl r={r + 0.2} h={0.28} seg={32} color={stone} position={[0, y + 0.14, 0]} />
            {Array.from({ length: n }, (_, k) => (
              <Lathe key={k} profile={BELL} segments={10} color="#a39b89" position={[Math.cos((k / n) * Math.PI * 2) * r, y + 0.28, Math.sin((k / n) * Math.PI * 2) * r]} />
            ))}
          </group>
        );
      })}
      <Lathe profile={BELL} segments={16} color="#aaa290" position={[0, 2.74, 0]} scale={2.2} />
    </group>
  );
}

/* ---------------------------------------------------------------- China */

const hill = (x: number, z: number) => 1.6 * Math.exp(-((x + 1.2) ** 2 + (z + 0.6) ** 2) / 3) + 1.2 * Math.exp(-((x - 1.8) ** 2 + (z + 1.5) ** 2) / 2.2) + 0.5 * Math.exp(-((x - 0.2) ** 2 + (z - 2) ** 2) / 3);

function China() {
  const { ground, wall, towers } = useMemo(() => {
    const ground = new THREE.PlaneGeometry(8, 8, 40, 40);
    ground.rotateX(-Math.PI / 2);
    const pos = ground.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getZ(i));
      // the hills fade into the island's edge; corners drop below the sea
      pos.setY(i, r > 4.4 ? -0.8 : hill(pos.getX(i), pos.getZ(i)) * Math.max(0, Math.min(1, (4.2 - r) / 1.4)));
    }
    ground.computeVertexNormals();
    const curve = new THREE.CatmullRomCurve3(
      [[-3, 1.6], [-2, 0.2], [-1, -0.8], [0.4, -0.6], [1.6, -1.5], [2.9, -0.6]].map(([x, z]) => new THREE.Vector3(x, 0, z)),
    );
    const n = 60;
    const wall: { p: THREE.Vector3; a: number }[] = [];
    const towers: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const p = curve.getPointAt(i / n);
      const t = curve.getTangentAt(i / n);
      const fade = Math.max(0, Math.min(1, (4.2 - Math.hypot(p.x, p.z)) / 1.4));
      p.y = hill(p.x, p.z) * fade;
      wall.push({ p, a: Math.atan2(-t.z, t.x) });
      if (i % 15 === 0) towers.push(p.clone());
    }
    return { ground, wall, towers };
  }, []);
  useEffect(() => () => ground.dispose(), [ground]);
  return (
    <group>
      <mesh geometry={ground}>
        <meshStandardMaterial color="#3f5e3c" roughness={0.95} flatShading />
      </mesh>
      {wall.map(({ p, a }, i) => (
        <Box key={i} size={[0.2, 0.42, 0.28]} color="#b9ab8e" position={[p.x, p.y + 0.18, p.z]} rotation-y={a} />
      ))}
      {towers.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]}>
          <Box size={[0.5, 0.8, 0.5]} color="#c4b697" position={[0, 0.4, 0]} />
          <Box size={[0.58, 0.08, 0.58]} color="#9d8f74" position={[0, 0.84, 0]} />
        </group>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- Japan */

function Japan() {
  const red = "#c8402e";
  return (
    <group>
      <group position={[0, 0, -2]}>
        <Cyl r={3.4} r2={0.55} h={3.6} seg={32} color="#4f6283" position={[0, 1.8, 0]} />
        <Cyl r={1.36} r2={0.55} h={1.15} seg={32} color="#f1f3f7" position={[0, 3.03, 0]} scale={1.01} />
      </group>
      <group position={[0, 0, 1.8]}>
        <Cyl r={0.12} h={2} color={red} position={[-0.85, 1, 0]} />
        <Cyl r={0.12} h={2} color={red} position={[0.85, 1, 0]} />
        <Box size={[2.2, 0.12, 0.2]} color={red} position={[0, 1.6, 0]} />
        <Box size={[2.7, 0.16, 0.26]} color={red} position={[0, 2.02, 0]} />
        <Box size={[2.9, 0.08, 0.3]} color="#2a2522" position={[0, 2.14, 0]} />
      </group>
      {[[-2.4, 1], [2.3, 0.6]].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <Cyl r={0.08} r2={0.05} h={1} color="#4b3427" position={[0, 0.5, 0]} seg={6} />
          {[[0, 1.25, 0, 0.55], [0.35, 1.1, 0.1, 0.4], [-0.3, 1.15, -0.1, 0.42], [0.05, 1.45, 0.2, 0.35]].map(([a, b, c, r], i) => (
            <mesh key={i} position={[a, b, c]}>
              <icosahedronGeometry args={[r, 1]} />
              <meshStandardMaterial color="#e9a9b8" roughness={0.8} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------- United Kingdom */

function ElizabethTower() {
  const sand = "#d6c08f";
  return (
    <group>
      <Box size={[1, 3.6, 1]} color={sand} position={[0, 1.8, 0]} />
      <Box size={[1.2, 1.2, 1.2]} color={sand} position={[0, 4.2, 0]} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation-y={(i * Math.PI) / 2}>
          <mesh position={[0, 4.2, 0.61]}>
            <circleGeometry args={[0.42, 32]} />
            <meshStandardMaterial color="#f7eed8" emissive="#ffd99a" emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[0, 4.2, 0.62]}>
            <ringGeometry args={[0.4, 0.46, 32]} />
            <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <Box size={[1, 0.7, 1]} color={sand} position={[0, 5.15, 0]} />
      <Cyl r={0.85} r2={0} h={1.3} seg={4} color="#3c4a5c" position={[0, 6.15, 0]} rotation-y={Math.PI / 4} />
      <Cyl r={0.025} h={0.9} color={GOLD} metal={0.6} position={[0, 7.2, 0]} />
    </group>
  );
}

function UnitedKingdom() {
  return (
    <group>
      <group position={[1.3, 0, 0]}>
        <ElizabethTower />
      </group>
      <Box size={[4.2, 1.5, 1.4]} color="#cbb584" position={[-1.4, 0.75, 0.2]} />
      {[-3.3, -2.5, -1.7, -0.9, -0.1].map((x) => (
        <Cyl key={x} r={0.09} r2={0} h={0.6} seg={4} color="#c3ad7c" position={[x, 1.8, 0.85]} />
      ))}
      <Box size={[0.9, 2.6, 0.9]} color="#cbb584" position={[-3.2, 1.3, -0.2]} />
      <Water size={2.6} x={0} z={2.6} />
    </group>
  );
}

/* --------------------------------------------------------------- Canada */

function Canada() {
  return (
    <group>
      <Water size={3.2} x={0.6} z={2} />
      <Cyl r={0.55} r2={0.2} h={5} seg={3} color="#cfd2d6" position={[0, 2.5, 0]} />
      <Cyl r={0.22} h={1.2} seg={12} color="#cfd2d6" position={[0, 5.3, 0]} />
      <Cyl r={0.75} r2={0.85} h={0.35} seg={24} color="#e3e6ea" position={[0, 5.1, 0]} />
      <Cyl r={0.85} r2={0.6} h={0.3} seg={24} color="#56687d" metal={0.4} rough={0.3} position={[0, 5.42, 0]} />
      <Cyl r={0.32} h={0.25} seg={16} color="#e3e6ea" position={[0, 6.1, 0]} />
      <Cyl r={0.06} r2={0.02} h={2.1} color="#e8ebef" metal={0.5} position={[0, 7.25, 0]} />
      {[[-2.4, -1.2, 1.1], [-1.8, 1.4, 0.9], [-3, 0.4, 0.8], [2.2, -1.6, 1.2], [2.8, -0.2, 0.9], [1.6, -2.6, 1]].map(([x, z, s]) => (
        <Pine key={`${x}${z}`} x={x} z={z} s={s} />
      ))}
      <group position={[-1.2, 0, -2.2]}>
        <Cyl r={0.07} h={0.8} color="#4b3427" position={[0, 0.4, 0]} seg={6} />
        <mesh position={[0, 1.05, 0]}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color="#c4472e" roughness={0.8} flatShading />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------- United States */

function GoldenGate() {
  const orange = "#c4502f";
  const { cable, hangers } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const span = (x0: number, x1: number, y0: number, y1: number, sag: number) => {
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - sag * 4 * t * (1 - t), 0));
      }
    };
    span(-5.6, -2.4, 0.9, 3.4, 0.3);
    span(-2.4, 2.4, 3.4, 3.4, 2.3);
    span(2.4, 5.6, 3.4, 0.9, 0.3);
    const curve = new THREE.CatmullRomCurve3(pts);
    const hang: number[] = [];
    pts.forEach((p) => {
      if (p.y > 1.2 && Math.abs(Math.abs(p.x) - 2.4) > 0.1) hang.push(p.x, 1.0, 0, p.x, p.y, 0);
    });
    const hangers = new THREE.BufferGeometry();
    hangers.setAttribute("position", new THREE.Float32BufferAttribute(hang, 3));
    return { cable: new THREE.TubeGeometry(curve, 120, 0.035, 6, false), hangers };
  }, []);
  useEffect(() => () => {
    cable.dispose();
    hangers.dispose();
  }, [cable, hangers]);
  return (
    <group>
      {[-2.4, 2.4].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-0.32, 0.32].map((z) => (
            <Box key={z} size={[0.22, 3.6, 0.22]} color={orange} position={[0, 1.8, z]} />
          ))}
          {[1.6, 2.4, 3.0, 3.5].map((y) => (
            <Box key={y} size={[0.2, 0.14, 0.7]} color={orange} position={[0, y, 0]} />
          ))}
        </group>
      ))}
      <Box size={[11.2, 0.16, 0.7]} color={orange} position={[0, 0.95, 0]} />
      {[-0.32, 0.32].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={cable}>
            <meshStandardMaterial color={orange} roughness={0.6} />
          </mesh>
          <lineSegments geometry={hangers}>
            <lineBasicMaterial color="#d6795a" transparent opacity={0.7} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function UnitedStates() {
  return (
    <group>
      <Water size={8} />
      <group rotation-y={-0.35} scale={0.62} position={[0, 0, 0]}>
        <GoldenGate />
      </group>
      <Peak x={-3.2} z={-1.6} r={1.2} h={1.1} rot={0.4} />
      <Peak x={3.3} z={1.2} r={1.1} h={0.9} rot={1.2} />
    </group>
  );
}

/* ------------------------------------------------------------ Australia */

function Shell({ r, rot, x, z, lean = 0.5 }: { r: number; rot: number; x: number; z: number; lean?: number }) {
  return (
    <group position={[x, 0.55, z]} rotation-y={rot}>
      <mesh rotation={[-lean, 0, 0]} scale={[0.6, 1.45, 1]}>
        <sphereGeometry args={[r, 28, 14, -Math.PI / 2, Math.PI, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f5f1e8" roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Australia() {
  return (
    <group>
      <Water size={8} />
      <Box size={[4.6, 0.55, 2.2]} color="#b9937a" position={[0, 0.27, 0]} rotation-y={0.3} />
      <group rotation-y={0.3}>
        <Shell r={1.15} rot={0} x={-1.2} z={-0.35} />
        <Shell r={0.95} rot={0} x={-0.25} z={-0.35} />
        <Shell r={0.75} rot={0} x={0.55} z={-0.35} />
        <Shell r={0.8} rot={0} x={-0.6} z={0.45} />
        <Shell r={0.6} rot={0} x={1.35} z={0.3} />
      </group>
    </group>
  );
}

/* --------------------------------------------------------------- Jaffna */

function Origin() {
  return (
    <group>
      <Palm x={-1.6} z={-0.8} s={1.1} />
      <Palm x={1.8} z={-1.2} s={0.9} lean={-0.2} />
      <Palm x={-0.6} z={-2} s={1.2} lean={0.05} />
      <Cyl r={0.03} h={2.4} color={GOLD} position={[0, 1.2, 0.4]} metal={0.5} />
      <mesh position={[0, 2.5, 0.4]}>
        <sphereGeometry args={[0.18, 24, 16]} />
        <meshBasicMaterial color="#f6d08e" toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0.4]}>
        <ringGeometry args={[0.3, 0.38, 48]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
    </group>
  );
}

export type LandmarkDef = {
  model: () => ReactNode;
  /** Visual height, for framing. */
  height: number;
  /** Island ground colour. */
  ground: string;
};

export const LANDMARKS: Record<string, LandmarkDef> = {
  jaffna: { model: () => <Origin />, height: 3, ground: "#3e5a3a" },
  india: { model: () => <TajMahal />, height: 5.6, ground: "#6b7a4c" },
  nepal: { model: () => <Nepal />, height: 5.6, ground: "#4a5a48" },
  thailand: { model: () => <Thailand />, height: 6, ground: "#4f6a45" },
  malaysia: { model: () => <Malaysia />, height: 7.4, ground: "#3f5c43" },
  vietnam: { model: () => <Vietnam />, height: 4, ground: "#3a5546" },
  "dubai-uae": { model: () => <Dubai />, height: 10, ground: "#c2a173" },
  qatar: { model: () => <Qatar />, height: 3.2, ground: "#c7a776" },
  indonesia: { model: () => <Indonesia />, height: 4, ground: "#46623f" },
  china: { model: () => <China />, height: 3, ground: "#3f5e3c" },
  japan: { model: () => <Japan />, height: 4.6, ground: "#4b6544" },
  "united-kingdom": { model: () => <UnitedKingdom />, height: 7.4, ground: "#4c6747" },
  australia: { model: () => <Australia />, height: 2.6, ground: "#b99a72" },
  canada: { model: () => <Canada />, height: 8.4, ground: "#3e5b41" },
  "united-states": { model: () => <UnitedStates />, height: 3.2, ground: "#5e6b4c" },
};
