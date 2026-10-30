"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A lightweight, procedurally modelled twin-engine passenger jet.
 * Nose points along +x, wings span z, y is up. Roughly 6 units long.
 * Built from a handful of primitives (well under 10k triangles) so it
 * needs no model download.
 */

const LENGTH = 6.1;
const TAIL_Y = -3.0;

function fuselageRadius(y: number) {
  // y runs from the tail (-3) to the nose (+3.1)
  if (y > 2.0) {
    const t = (y - 2.0) / 1.1;
    return 0.5 * Math.sqrt(Math.max(0, 1 - t * t * t));
  }
  if (y < -0.9) {
    const t = (-0.9 - y) / 2.1;
    return 0.5 - 0.39 * Math.pow(t, 1.6);
  }
  return 0.5;
}

function makeFuselageTexture() {
  // u wraps around the body, v runs tail (0) to nose (1).
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 1024;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f1f2f4";
  g.fillRect(0, 0, 512, 1024);
  // belly in a cooler grey
  g.fillStyle = "#c9ced6";
  g.fillRect(96, 0, 64, 1024);
  const vOf = (y: number) => 1024 - ((y - TAIL_Y) / LENGTH) * 1024;
  // After the lathe is turned on its side, u = 0 faces +z, 0.25 is the
  // belly, 0.5 faces -z and 0.75 is the crown.
  const sides = [
    { windows: 0.968, stripe: 0.992 },
    { windows: 0.532, stripe: 0.508 },
  ];
  g.fillStyle = "#d6a65a";
  sides.forEach(({ stripe }) => g.fillRect(stripe * 512 - 3, vOf(2.35), 6, vOf(-2.3) - vOf(2.35)));
  g.fillStyle = "#1b2433";
  sides.forEach(({ windows }) => {
    const x = windows * 512;
    for (let y = -1.9; y < 1.95; y += 0.13) {
      g.beginPath();
      g.ellipse(x, vOf(y), 3.2, 4.4, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "#9aa3b2";
    g.lineWidth = 1.5;
    [2.05, -2.05].forEach((y) => g.strokeRect(x - 5, vOf(y) - 12, 10, 24));
  });
  // cockpit windscreen band around the nose top
  g.fillStyle = "#111925";
  for (let i = 0; i < 4; i++) {
    const u = 0.68 + i * 0.045;
    g.beginPath();
    g.moveTo(u * 512 - 10, vOf(2.72));
    g.lineTo(u * 512 + 10, vOf(2.72));
    g.lineTo(u * 512 + 8, vOf(2.58));
    g.lineTo(u * 512 - 8, vOf(2.58));
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function sweptSurface(rootLead: number, rootTrail: number, span: number, tipLead: number, tipTrail: number, thickness: number) {
  const shape = new THREE.Shape();
  shape.moveTo(rootLead, 0);
  shape.lineTo(tipLead, span);
  shape.lineTo(tipTrail, span);
  shape.lineTo(rootTrail, 0);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.45,
    bevelSize: thickness * 0.45,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -thickness / 2);
  return geo;
}

export function Aircraft({ detail = "high" }: { detail?: "high" | "low" }) {
  const strobe = useRef<THREE.Mesh>(null);
  const beacon = useRef<THREE.MeshBasicMaterial>(null);

  const parts = useMemo(() => {
    const seg = detail === "high" ? 48 : 28;
    const pts: THREE.Vector2[] = [];
    const steps = detail === "high" ? 64 : 36;
    for (let i = 0; i <= steps; i++) {
      const y = TAIL_Y + (i / steps) * LENGTH;
      pts.push(new THREE.Vector2(Math.max(0.001, fuselageRadius(y)), y));
    }
    const fuselage = new THREE.LatheGeometry(pts, seg);
    // Sweep the tail upward slightly, like a real airliner's empennage.
    const pos = fuselage.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < -1.2) {
        const t = (-1.2 - y) / 1.8;
        pos.setX(i, pos.getX(i) - t * t * 0.32);
      }
    }
    fuselage.computeVertexNormals();
    fuselage.rotateZ(-Math.PI / 2);

    // Wing planform in (x = chord, y = span) then turned so span runs along z.
    const wing = sweptSurface(0.95, -0.45, 3.1, -0.85, -1.35, 0.07);
    const wingR = wing.clone().rotateX(Math.PI / 2);
    const wingL = wing.clone().rotateX(-Math.PI / 2);
    const stab = sweptSurface(-2.15, -2.75, 1.25, -2.85, -3.15, 0.05);
    const stabR = stab.clone().rotateX(Math.PI / 2);
    const stabL = stab.clone().rotateX(-Math.PI / 2);
    const fin = sweptSurface(-1.75, -2.85, 1.5, -2.75, -3.2, 0.06);
    const winglet = sweptSurface(0.1, -0.35, 0.42, -0.3, -0.5, 0.04);
    const nacelle = new THREE.CylinderGeometry(0.2, 0.17, 0.95, detail === "high" ? 28 : 16, 1, true).rotateZ(Math.PI / 2);
    const intake = new THREE.CircleGeometry(0.19, detail === "high" ? 28 : 16).rotateY(Math.PI / 2);
    const lip = new THREE.TorusGeometry(0.195, 0.025, 8, detail === "high" ? 28 : 16).rotateY(Math.PI / 2);
    const exhaust = new THREE.ConeGeometry(0.12, 0.3, 16).rotateZ(Math.PI / 2);
    const pylon = new THREE.BoxGeometry(0.6, 0.22, 0.05);
    return { fuselage, wingR, wingL, stabR, stabL, fin, winglet, nacelle, intake, lip, exhaust, pylon };
  }, [detail]);

  const mats = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({ map: makeFuselageTexture(), roughness: 0.32, metalness: 0.25 });
    const wing = new THREE.MeshStandardMaterial({ color: "#c8ccd4", roughness: 0.42, metalness: 0.55 });
    const tail = new THREE.MeshStandardMaterial({ color: "#14284c", roughness: 0.38, metalness: 0.3 });
    const accent = new THREE.MeshStandardMaterial({ color: "#d6a65a", roughness: 0.3, metalness: 0.6 });
    const engine = new THREE.MeshStandardMaterial({ color: "#e4e6ea", roughness: 0.3, metalness: 0.45, side: THREE.DoubleSide });
    const dark = new THREE.MeshStandardMaterial({ color: "#0d121b", roughness: 0.7, metalness: 0.2 });
    return { body, wing, tail, accent, engine, dark };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (strobe.current) strobe.current.visible = t % 1.4 < 0.07;
    if (beacon.current) beacon.current.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(t * 4.2));
  });

  const engineAt = (z: number) => (
    <group position={[0.55, -0.42, z]}>
      <mesh geometry={parts.nacelle} material={mats.engine} />
      <mesh geometry={parts.lip} material={mats.wing} position={[0.475, 0, 0]} />
      <mesh geometry={parts.intake} material={mats.dark} position={[0.42, 0, 0]} />
      <mesh geometry={parts.exhaust} material={mats.dark} position={[-0.55, 0, 0]} />
      <mesh geometry={parts.pylon} material={mats.wing} position={[-0.05, 0.2, 0]} />
    </group>
  );

  return (
    <group>
      <mesh geometry={parts.fuselage} material={mats.body} />
      {/* wings sit low on the fuselage with a little dihedral */}
      <group position={[0, -0.22, 0]}>
        <group rotation={[0.07, 0, 0]}>
          <mesh geometry={parts.wingR} material={mats.wing} position={[0, 0, 0.35]} />
          <mesh geometry={parts.winglet} material={mats.tail} position={[-0.95, 0.02, 3.42]} />
          <mesh position={[-1.05, 0.05, 3.42]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#5cff8a" />
          </mesh>
        </group>
        <group rotation={[-0.07, 0, 0]}>
          <mesh geometry={parts.wingL} material={mats.wing} position={[0, 0, -0.35]} />
          <mesh geometry={parts.winglet} material={mats.tail} position={[-0.95, 0.02, -3.42]} />
          <mesh position={[-1.05, 0.05, -3.42]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#ff5a5a" />
          </mesh>
        </group>
        {engineAt(1.25)}
        {engineAt(-1.25)}
      </group>
      <group position={[-0.18, 0.12, 0]}>
        <mesh geometry={parts.stabR} material={mats.wing} position={[0, 0, 0.1]} />
        <mesh geometry={parts.stabL} material={mats.wing} position={[0, 0, -0.1]} />
      </group>
      <mesh geometry={parts.fin} material={mats.tail} position={[-0.32, 0.28, 0]} />
      <mesh position={[-2.98, 1.5, 0]} rotation={[0, 0, -0.95]}>
        <boxGeometry args={[0.5, 0.05, 0.075]} />
        <primitive object={mats.accent} attach="material" />
      </mesh>
      {/* tail strobe and belly beacon */}
      <mesh ref={strobe} position={[-3.32, 0.32, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.3, -0.52, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial ref={beacon} color="#ff6a4a" transparent />
      </mesh>
    </group>
  );
}
