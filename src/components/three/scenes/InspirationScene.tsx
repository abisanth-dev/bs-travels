"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/components/home/sceneState";
import { CHOREO, damp, enterAmount, exitAmount } from "../choreo";
import { usePointer, useSectionProgress } from "./common";
import { ATMOSPHERE, silhouetteGeometry } from "./silhouettes";
import { INSPIRATION } from "@/components/home/homeData";


const loader = new THREE.TextureLoader();

function softSprite(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function frond(len: number, bend: number) {
  // a palm frond: a curved spine with leaflets either side
  const s = new THREE.Shape();
  const n = 14;
  const spine = (t: number) => new THREE.Vector2(t * len, -bend * t * t * len);
  s.moveTo(0, 0);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const p = spine(t);
    const w = Math.sin(Math.PI * t) * len * 0.16;
    s.lineTo(p.x - w * 0.3, p.y + w);
    s.lineTo(p.x, p.y + 0.02);
  }
  for (let i = n; i >= 1; i--) {
    const t = i / n;
    const p = spine(t);
    const w = Math.sin(Math.PI * t) * len * 0.16;
    s.lineTo(p.x - w * 0.3, p.y - w);
    s.lineTo(p.x - 0.05, p.y - 0.02);
  }
  s.closePath();
  return new THREE.ShapeGeometry(s, 4);
}

/**
 * Destination inspiration: a layered composition per destination. The
 * illustrated backdrop sits far back, a landmark silhouette holds the middle
 * ground, and an atmosphere layer (palms, clouds, lanterns or haze) passes in
 * front. Changing destination slides the camera while a dark cloud bank wipes
 * across the frame and the layers swap behind it.
 */
export function InspirationScene() {
  const progress = useSectionProgress("inspire");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 1;
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const back = useRef<THREE.Mesh>(null);
  const backMat = useRef<THREE.MeshBasicMaterial>(null);
  const sil = useRef<THREE.Mesh>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const wipe = useRef<THREE.Group>(null);
  const fore = useRef<Record<string, THREE.Group | null>>({});
  const palms = useRef<THREE.Group>(null);
  const shown = useRef(-1);
  const trans = useRef({ t: 1, dir: 1 as 1 | -1, swapped: true });
  const geos = useRef(new Map<string, THREE.BufferGeometry>());
  const texes = useRef(new Map<string, THREE.Texture>());

  const cloudTex = useMemo(() => softSprite("rgba(255,255,255,0.85)", "rgba(255,255,255,0)"), []);
  const wipeTex = useMemo(() => softSprite("rgba(6,10,22,1)", "rgba(6,10,22,0)"), []);
  const lanternTex = useMemo(() => softSprite("rgba(255,190,120,1)", "rgba(255,120,60,0)"), []);
  const frondGeos = useMemo(() => [frond(4.2, 0.35), frond(3.4, 0.5), frond(3.8, 0.2)], []);
  const tint = useMemo(() => new THREE.Color(), []);

  const texFor = (slug: string) => {
    let t = texes.current.get(slug);
    if (!t) {
      t = loader.load(`/images/destinations/${slug}.jpg`);
      t.colorSpace = THREE.SRGBColorSpace;
      texes.current.set(slug, t);
    }
    return t;
  };
  const geoFor = (slug: string) => {
    let g = geos.current.get(slug);
    if (!g) {
      g = silhouetteGeometry(slug);
      geos.current.set(slug, g);
    }
    return g;
  };

  useEffect(
    () => () => {
      geos.current.forEach((g) => g.dispose());
      texes.current.forEach((t) => t.dispose());
      [cloudTex, wipeTex, lanternTex].forEach((t) => t.dispose());
      frondGeos.forEach((g) => g.dispose());
    },
    [cloudTex, wipeTex, lanternTex, frondGeos],
  );

  const apply = (index: number) => {
    const slug = INSPIRATION[index];
    shown.current = index;
    if (backMat.current) {
      backMat.current.map = texFor(slug);
      backMat.current.needsUpdate = true;
    }
    if (sil.current) sil.current.geometry = geoFor(slug);
    const a = ATMOSPHERE[slug];
    Object.entries(fore.current).forEach(([k, g]) => g && (g.visible = k === a.fore));
    if (glowMat.current) glowMat.current.color.set(a.glow);
    if (rimLight.current) rimLight.current.color.set(a.glow);
    // preload neighbours so the next swap is instant
    texFor(INSPIRATION[(index + 1) % INSPIRATION.length]);
    texFor(INSPIRATION[(index + INSPIRATION.length - 1) % INSPIRATION.length]);
  };

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    const st = sceneState.get();
    if (shown.current < 0) apply(st.inspiration);
    const tr = trans.current;
    if (st.inspiration !== shown.current && tr.t >= 1) {
      tr.t = 0;
      tr.dir = st.inspirationDir;
      tr.swapped = false;
    }
    if (tr.t < 1) {
      tr.t = Math.min(1, tr.t + delta / CHOREO.swap);
      if (!tr.swapped && tr.t >= 0.5) {
        apply(sceneState.get().inspiration);
        tr.swapped = true;
      }
    }
    const k = Math.sin(Math.PI * tr.t); // 0 → 1 → 0 over the transition
    const w = wipe.current;
    if (w) {
      w.visible = tr.t < 1;
      w.position.x = tr.dir * THREE.MathUtils.lerp(16, -16, tr.t);
    }
    const c = cam.current;
    if (c) {
      const slide = tr.dir * k * 1.6;
      c.position.x = damp(c.position.x, slide + pointer.current.x * 0.7, 6, delta);
      c.position.y = damp(c.position.y, 0.6 - pointer.current.y * 0.35 + (1 - enter) * -2.2 + exit * 2.5, 4, delta);
      c.position.z = tall ? 15 : 12;
      c.lookAt(slide * 0.5, 0.6 + exit * 3, 0);
    }
    // backdrop dims during the wipe and with the section's arrival
    if (backMat.current) backMat.current.opacity = (0.35 + enter * 0.65) * (1 - k * 0.6);
    if (sil.current) sil.current.position.x = -tr.dir * k * 1.2;
    if (palms.current) palms.current.rotation.z = Math.sin(t * 0.6) * 0.03;
    Object.values(fore.current).forEach((g, gi) => {
      if (!g || !g.visible) return;
      g.children.forEach((ch, i) => {
        if (ch.userData.drift) {
          ch.position.x = ((ch.userData.x + t * ch.userData.drift + 30) % 26) - 13;
          ch.position.y = ch.userData.y + Math.sin(t * 0.5 + i + gi) * 0.15;
        }
      });
    });
    if (glowMat.current) {
      tint.set(ATMOSPHERE[INSPIRATION[Math.max(0, shown.current)]].glow);
      glowMat.current.opacity = 0.55 + Math.sin(t * 0.4) * 0.05;
    }
  });

  // backdrop plane sized to cover the view at its depth
  const backSize = useMemo(() => {
    const dist = (tall ? 15 : 12) + 16;
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(tall ? 22 : 18)) * dist * 1.25;
    const aspect = size.width / size.height;
    const wNeeded = h * aspect;
    const img = 16 / 9;
    return wNeeded / h > img ? [wNeeded * 1.15, (wNeeded * 1.15) / img] : [h * img, h];
  }, [size.width, size.height, tall]);

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0, 0.6, tall ? 15 : 12]} fov={tall ? 44 : 36} near={0.1} far={80} />
      <color attach="background" args={["#060b16"]} />
      <fog attach="fog" args={["#0a1326", 18, 40]} />
      <mesh ref={back} position={[0, 2, -16]}>
        <planeGeometry args={[backSize[0], backSize[1]]} />
        <meshBasicMaterial ref={backMat} transparent toneMapped={false} fog={false} />
      </mesh>
      {/* horizon glow behind the silhouette */}
      <mesh position={[0, -1.2, -9]}>
        <planeGeometry args={[40, 7]} />
        <meshBasicMaterial ref={glowMat} map={cloudTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.55} />
      </mesh>
      <ambientLight intensity={0.25} />
      <pointLight ref={rimLight} position={[0, 3, -11]} intensity={120} distance={30} decay={1.6} />
      <directionalLight position={[2, 3, 6]} intensity={0.25} color="#9fb0e0" />
      <mesh ref={sil} position={[0, -3.2, -6.5]} scale={[0.82, 0.82, 1]}>
        <meshStandardMaterial color="#0b1020" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* ground plane the silhouettes stand on */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -3.2, -4]}>
        <planeGeometry args={[60, 14]} />
        <meshStandardMaterial color="#070b16" roughness={1} />
      </mesh>

      {/* atmosphere layers */}
      <group ref={(g) => void (fore.current.clouds = g)}>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[0, 0, 1 + (i % 3) * 1.4]} userData={{ drift: 0.25 + (i % 4) * 0.08, x: i * 3.1, y: -2.6 + (i % 4) * 1.6 }}>
            <planeGeometry args={[7, 2.6]} />
            <meshBasicMaterial map={cloudTex} transparent opacity={0.16} depthWrite={false} color="#c9d2ee" />
          </mesh>
        ))}
      </group>
      <group ref={(g) => void (fore.current.palms = g)}>
        <group ref={palms}>
          {[
            { x: tall ? -5.4 : -9, y: 6, r: -0.4, g: 0, s: 1.3 },
            { x: tall ? -5.6 : -9.4, y: 5.4, r: -1.1, g: 1, s: 1.2 },
            { x: tall ? -5 : -8.6, y: 6.3, r: 0.2, g: 2, s: 1 },
            { x: tall ? 5.4 : 9, y: 6.2, r: Math.PI + 0.4, g: 0, s: 1.25, flip: true },
            { x: tall ? 5.6 : 9.3, y: 5.6, r: Math.PI + 1.0, g: 2, s: 1.1, flip: true },
          ].map((f, i) => (
            <mesh key={i} geometry={frondGeos[f.g]} position={[f.x, f.y - 2, 3]} rotation-z={f.r} scale={[f.s, f.flip ? -f.s : f.s, 1]}>
              <meshBasicMaterial color="#04070e" side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      </group>
      <group ref={(g) => void (fore.current.lanterns = g)}>
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i} position={[0, 0, 0.5 + (i % 3) * 1.2]} userData={{ drift: 0.08 + (i % 3) * 0.03, x: i * 3.7, y: 2.4 + (i % 3) * 0.9 }}>
            <mesh>
              <cylinderGeometry args={[0.28, 0.24, 0.6, 16]} />
              <meshStandardMaterial color="#ff8a4a" emissive="#ff7a3a" emissiveIntensity={1.4} roughness={0.6} />
            </mesh>
            <mesh>
              <planeGeometry args={[2.4, 2.4]} />
              <meshBasicMaterial map={lanternTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.6} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={(g) => void (fore.current.haze = g)}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[0, 0, 0.5 + i * 0.8]} userData={{ drift: 0.18 + i * 0.03, x: i * 4.6, y: -2.8 + (i % 2) * 0.6 }}>
            <planeGeometry args={[12, 2.2]} />
            <meshBasicMaterial map={cloudTex} transparent opacity={0.12} depthWrite={false} color="#ffcf9a" />
          </mesh>
        ))}
      </group>

      {/* the wipe: a dark cloud bank that crosses the lens on a change */}
      <group ref={wipe} position={[16, 0, 6]} visible={false}>
        {[-3, 0, 3].map((y, i) => (
          <mesh key={i} position={[i * 1.5, y, 0]}>
            <planeGeometry args={[14, 12]} />
            <meshBasicMaterial map={wipeTex} transparent depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}
