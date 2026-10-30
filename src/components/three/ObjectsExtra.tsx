"use client";

import { forwardRef, useEffect, useMemo, type ReactNode } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { canvasTexture } from "./TravelObjects";

/**
 * More procedural travel props for the homepage scenes: a camera, an
 * opening document folder, a desk calendar, an open book, postcards and a
 * pen. Like TravelObjects, each is a few primitives with canvas textures,
 * written so a licensed GLB can replace any one of them later.
 */

const NAVY = "#13254a";
const INK = "#0a1326";
const BRASS = "#b8873a";

export function CameraObject() {
  return (
    <group>
      <RoundedBox args={[1.9, 1.15, 0.72]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial attach="material" color="#1c1f26" roughness={0.55} clearcoat={0.4} clearcoatRoughness={0.4} />
      </RoundedBox>
      {/* leatherette band */}
      <mesh position={[0, -0.08, 0.362]}>
        <planeGeometry args={[1.84, 0.62]} />
        <meshStandardMaterial color="#3a2f28" roughness={0.95} />
      </mesh>
      {/* top plate and dials */}
      <RoundedBox args={[1.9, 0.18, 0.72]} radius={0.05} position={[0, 0.62, 0]}>
        <meshStandardMaterial attach="material" color="#c9ccd2" roughness={0.3} metalness={0.9} />
      </RoundedBox>
      {[-0.6, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.8, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.14, 28]} />
          <meshStandardMaterial color="#d6d8dd" roughness={0.25} metalness={0.95} />
        </mesh>
      ))}
      <mesh position={[0.2, 0.76, 0]}>
        <boxGeometry args={[0.5, 0.18, 0.4]} />
        <meshStandardMaterial color="#1c1f26" roughness={0.5} />
      </mesh>
      {/* lens */}
      <group position={[0.05, -0.06, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.44, 0.48, 0.32, 40]} />
          <meshStandardMaterial color="#15171c" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.4, 0.42, 0.1, 40]} />
          <meshStandardMaterial color="#c9ccd2" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.395, 0]}>
          <cylinderGeometry args={[0.33, 0.33, 0.01, 40]} />
          <meshPhysicalMaterial color="#1b2a44" roughness={0.05} metalness={0.2} clearcoat={1} reflectivity={1} />
        </mesh>
      </group>
      {/* viewfinder window */}
      <mesh position={[-0.62, 0.32, 0.365]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshPhysicalMaterial color="#20304d" roughness={0.05} clearcoat={1} />
      </mesh>
    </group>
  );
}

/** A sheet of paper with a checklist printed on it. */
export function useChecklistSheet(title: string, lines = 9, ticked = 0) {
  const tex = useMemo(
    () =>
      canvasTexture(512, 680, (g) => {
        g.fillStyle = "#f7f2e7";
        g.fillRect(0, 0, 512, 680);
        g.fillStyle = INK;
        g.font = "600 36px Georgia, serif";
        g.fillText(title, 40, 70);
        g.fillStyle = "#8f8878";
        g.font = "18px Arial";
        g.fillText("DOCUMENT CHECKLIST · REFERENCE ONLY", 40, 104);
        for (let i = 0; i < lines; i++) {
          const y = 150 + i * 54;
          g.strokeStyle = "#7c7566";
          g.lineWidth = 3;
          g.strokeRect(40, y, 26, 26);
          if (i < ticked) {
            g.strokeStyle = BRASS;
            g.lineWidth = 5;
            g.beginPath();
            g.moveTo(45, y + 13);
            g.lineTo(52, y + 21);
            g.lineTo(64, y + 4);
            g.stroke();
          }
          g.fillStyle = "#a59e8e";
          g.fillRect(84, y + 8, 200 + ((i * 83) % 180), 10);
        }
      }),
    [title, lines, ticked],
  );
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/**
 * Manila folder lying open like a book. The front cover hinges on the spine
 * (local x = 0); pass a ref to rotate `cover` from closed (PI) to open (0).
 */
export const Folder = forwardRef<THREE.Group, { children?: ReactNode; label?: string }>(function Folder({ children, label = "BS TRAVELS" }, coverRef) {
  const tab = useMemo(
    () =>
      canvasTexture(512, 360, (g) => {
        g.fillStyle = "#d8bf8c";
        g.fillRect(0, 0, 512, 360);
        g.fillStyle = "rgba(90,70,40,0.08)";
        for (let i = 0; i < 400; i++) g.fillRect(Math.random() * 512, Math.random() * 360, 2, 2);
        g.fillStyle = "#6b5532";
        g.font = "600 30px Georgia, serif";
        g.fillText(label, 36, 60);
        g.strokeStyle = "#a88d5c";
        g.lineWidth = 2;
        g.strokeRect(36, 84, 220, 40);
      }),
    [label],
  );
  return (
    <group>
      {/* back panel with a pocket */}
      <mesh position={[-1.05, 0, 0]} rotation-x={-Math.PI / 2}>
        <boxGeometry args={[2.1, 2.8, 0.03]} />
        <meshStandardMaterial color="#cfb37e" roughness={0.85} />
      </mesh>
      <mesh position={[-1.05, 0.035, 0.55]} rotation-x={-Math.PI / 2}>
        <boxGeometry args={[2.0, 1.5, 0.02]} />
        <meshStandardMaterial color="#c2a46c" roughness={0.85} />
      </mesh>
      {children}
      {/* front cover, hinged at the spine */}
      <group ref={coverRef}>
        <mesh position={[1.05, 0.02, 0]} rotation-x={-Math.PI / 2}>
          <boxGeometry args={[2.1, 2.8, 0.03]} />
          <meshStandardMaterial color="#d8bf8c" roughness={0.85} />
        </mesh>
        <mesh position={[1.05, 0.037, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[2.1, 1.48]} />
          <meshStandardMaterial map={tab} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
});

/** Desk calendar; highlights the chosen day of the shown month. */
export function Calendar({ date }: { date: string }) {
  const d = date ? new Date(`${date}T00:00:00`) : null;
  const shown = d ?? new Date();
  const year = shown.getFullYear();
  const month = shown.getMonth();
  const day = d ? d.getDate() : -1;
  const tex = useMemo(
    () =>
      canvasTexture(640, 560, (g) => {
        g.fillStyle = "#f7f2e7";
        g.fillRect(0, 0, 640, 560);
        g.fillStyle = NAVY;
        g.fillRect(0, 0, 640, 96);
        g.fillStyle = "#e3b467";
        g.font = "600 44px Georgia, serif";
        g.textAlign = "center";
        g.fillText(new Date(year, month, 1).toLocaleString("en-GB", { month: "long", year: "numeric" }), 320, 64);
        g.font = "20px Arial";
        g.fillStyle = "#8f8878";
        ["M", "T", "W", "T", "F", "S", "S"].forEach((l, i) => g.fillText(l, 64 + i * 86, 132));
        const first = (new Date(year, month, 1).getDay() + 6) % 7;
        const days = new Date(year, month + 1, 0).getDate();
        for (let n = 1; n <= days; n++) {
          const idx = first + n - 1;
          const x = 64 + (idx % 7) * 86;
          const y = 186 + Math.floor(idx / 7) * 70;
          const sunday = idx % 7 === 6;
          if (n === day) {
            g.fillStyle = "#b8873a";
            g.beginPath();
            g.arc(x, y - 10, 28, 0, Math.PI * 2);
            g.fill();
          }
          g.fillStyle = n === day ? "#ffffff" : sunday ? "#b9b1a0" : INK;
          g.font = `${n === day ? "600 " : ""}28px Georgia, serif`;
          g.fillText(String(n), x, y);
        }
      }),
    [year, month, day],
  );
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      {/* easel stand */}
      <mesh position={[0, 0.85, -0.42]} rotation-x={0.42}>
        <boxGeometry args={[2.4, 2.1, 0.05]} />
        <meshStandardMaterial color="#20232b" roughness={0.6} />
      </mesh>
      <group position={[0, 0.95, 0]} rotation-x={-0.32}>
        <mesh>
          <boxGeometry args={[2.4, 2.1, 0.05]} />
          <meshStandardMaterial color="#e9e1cf" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[2.3, 2.0]} />
          <meshStandardMaterial map={tex} roughness={0.85} />
        </mesh>
        {/* ring binding */}
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[-1.0 + i * 0.25, 1.05, 0.02]} rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.07, 0.015, 8, 16]} />
            <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Pen() {
  return (
    <group rotation-z={Math.PI / 2}>
      <mesh>
        <cylinderGeometry args={[0.055, 0.055, 1.5, 20]} />
        <meshPhysicalMaterial color={NAVY} roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <coneGeometry args={[0.055, 0.16, 20]} />
        <meshStandardMaterial color="#d9a95b" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0.06, -0.4, 0]}>
        <boxGeometry args={[0.02, 0.5, 0.04]} />
        <meshStandardMaterial color="#d9a95b" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** A postcard with a printed title and a stamp, for the guidance section. */
export function Postcard({ title, kicker, hue }: { title: string; kicker: string; hue: string }) {
  const front = useMemo(
    () =>
      canvasTexture(720, 480, (g) => {
        const grad = g.createLinearGradient(0, 0, 720, 480);
        grad.addColorStop(0, hue);
        grad.addColorStop(1, "#0f1b33");
        g.fillStyle = grad;
        g.fillRect(0, 0, 720, 480);
        g.strokeStyle = "rgba(244,238,226,0.5)";
        g.lineWidth = 3;
        g.strokeRect(22, 22, 676, 436);
        g.fillStyle = "#e3b467";
        g.font = "600 22px Arial";
        g.fillText(kicker.toUpperCase(), 54, 84);
        g.fillStyle = "#f4eee2";
        g.font = "600 58px Georgia, serif";
        const words = title.split(" ");
        let line = "";
        let y = 170;
        words.forEach((w) => {
          if (g.measureText(line + w).width > 520) {
            g.fillText(line, 54, y);
            y += 66;
            line = "";
          }
          line += `${w} `;
        });
        g.fillText(line, 54, y);
        // stamp
        g.fillStyle = "#f4eee2";
        g.fillRect(580, 52, 90, 110);
        g.fillStyle = hue;
        g.fillRect(588, 60, 74, 94);
        g.strokeStyle = "rgba(244,238,226,0.6)";
        g.beginPath();
        g.arc(560, 140, 44, 0, Math.PI * 2);
        g.stroke();
      }),
    [title, kicker, hue],
  );
  useEffect(() => () => front.dispose(), [front]);
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.7, 1.8, 0.02]} />
        <meshStandardMaterial color="#efe7d6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[2.66, 1.76]} />
        <meshStandardMaterial map={front} roughness={0.75} />
      </mesh>
    </group>
  );
}
