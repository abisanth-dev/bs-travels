"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/components/home/sceneState";
import { courses } from "@/content/courses";
import { canvasTexture } from "../TravelObjects";
import { CHOREO, damp, enterAmount, exitAmount } from "../choreo";
import { SoftShadow, usePointer, useSectionProgress } from "./common";

const PW = 2.4; // page width
const PD = 3.2; // page depth (along the spine)
const SEG = 28;

/** Words for each page spread: greetings and test parts, nothing about fees or levels. */
const SPREAD: Record<string, { word: string; lines: string[] }> = {
  spanish: { word: "Español", lines: ["Hola", "Gracias", "Buenos días", "¿Dónde está…?"] },
  dutch: { word: "Nederlands", lines: ["Hallo", "Dank je wel", "Goedemorgen", "Waar is…?"] },
  french: { word: "Français", lines: ["Bonjour", "Merci", "Bonne journée", "Où est…?"] },
  ielts: { word: "IELTS", lines: ["Listening", "Reading", "Writing", "Speaking"] },
};

function paper(g: CanvasRenderingContext2D, w: number, h: number) {
  g.fillStyle = "#f6efe0";
  g.fillRect(0, 0, w, h);
  const grad = g.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, "rgba(120,100,70,0.18)");
  grad.addColorStop(0.12, "rgba(120,100,70,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
}

function leftPage(slug: string) {
  const s = SPREAD[slug];
  return canvasTexture(600, 800, (g) => {
    // drawn mirrored: the left page's texture runs outwards from the spine
    g.translate(600, 0);
    g.scale(-1, 1);
    paper(g, 600, 800);
    g.fillStyle = "#0a1326";
    g.font = "italic 300 82px Georgia, serif";
    g.fillText(s.word, 60, 200);
    g.fillStyle = "#b8873a";
    g.fillRect(60, 240, 80, 4);
    g.fillStyle = "#3b3a36";
    g.font = "40px Georgia, serif";
    s.lines.forEach((l, i) => g.fillText(l, 60, 340 + i * 76));
  });
}

function rightPage(slug: string) {
  const c = courses.find((x) => x.slug === slug)!;
  return canvasTexture(600, 800, (g) => {
    paper(g, 600, 800);
    g.fillStyle = "rgba(184,135,58,0.9)";
    g.font = "300 230px Georgia, serif";
    g.fillText(c.short, 70, 330);
    g.fillStyle = "#0a1326";
    g.font = "600 46px Georgia, serif";
    g.fillText(c.name, 74, 430);
    g.fillStyle = "#6f6a60";
    g.font = "28px Arial";
    c.usedIn.forEach((u, i) => g.fillText(u, 76, 500 + i * 44));
    g.strokeStyle = "rgba(10,19,38,0.25)";
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.moveTo(76, 660 + i * 26);
      g.lineTo(420 - i * 40, 660 + i * 26);
      g.stroke();
    }
  });
}

/** Curl a flat page grid: distance d from the spine, base angle a. */
function bendPage(geo: THREE.BufferGeometry, angle: number, curl: number, side: 1 | -1) {
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const u = (i % (SEG + 1)) / SEG; // 0 at spine
    const d = u * PW;
    const a = angle + curl * u * u;
    // the spread rises a little towards the spine
    const lift = (1 - u) * 0.12;
    p.setX(i, side * d * Math.cos(a));
    p.setY(i, d * Math.sin(a) + lift);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
}

function pageGeometry() {
  const g = new THREE.PlaneGeometry(PW, PD, SEG, 1);
  // rebuild as an x/z grid with x from 0 (spine) outward; z along the spine
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const col = i % (SEG + 1);
    const row = Math.floor(i / (SEG + 1));
    p.setXYZ(i, (col / SEG) * PW, 0, row === 0 ? -PD / 2 : PD / 2);
  }
  return g;
}

function Letters() {
  const glyphs = ["ñ", "é", "ç", "ij", "ü", "Aa", "¿", "è"];
  const tex = useMemo(
    () =>
      glyphs.map((ch) =>
        canvasTexture(128, 128, (g) => {
          g.fillStyle = "#e3b467";
          g.font = "300 96px Georgia, serif";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText(ch, 64, 70);
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => () => tex.forEach((t) => t.dispose()), [tex]);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((s, i) => {
      if (!s) return;
      const a = i * 0.8 + t * 0.07;
      s.position.set(Math.cos(a) * (3.4 + (i % 3) * 0.6), 1.2 + ((t * 0.12 + i * 0.37) % 1) * 2.4, Math.sin(a) * 2.6 - 0.5);
      (s.material as THREE.SpriteMaterial).opacity = Math.sin((((t * 0.12 + i * 0.37) % 1) * Math.PI)) * 0.55;
    });
  });
  return (
    <>
      {tex.map((t, i) => (
        <sprite key={i} ref={(s) => void (refs.current[i] = s)} scale={[0.6, 0.6, 1]}>
          <spriteMaterial map={t} transparent depthWrite={false} />
        </sprite>
      ))}
    </>
  );
}

/**
 * Language courses: an open book. Choosing a course turns a page; the new
 * spread shows the language's name and a few everyday words.
 */
export function BookScene() {
  const progress = useSectionProgress("book");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 0.9;
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const book = useRef<THREE.Group>(null);
  const coverL = useRef<THREE.Group>(null);
  const coverR = useRef<THREE.Group>(null);
  const turning = useRef<THREE.Group>(null);
  const leftMat = useRef<THREE.MeshStandardMaterial>(null);
  const rightMat = useRef<THREE.MeshStandardMaterial>(null);
  const frontMat = useRef<THREE.MeshStandardMaterial>(null);
  const backMat = useRef<THREE.MeshStandardMaterial>(null);
  const geos = useMemo(() => ({ l: pageGeometry(), r: pageGeometry(), turn: pageGeometry() }), []);
  const tex = useMemo(() => {
    const m = new Map<string, { l: THREE.Texture; r: THREE.Texture }>();
    courses.forEach((c) => m.set(c.slug, { l: leftPage(c.slug), r: rightPage(c.slug) }));
    return m;
  }, []);
  useEffect(
    () => () => {
      Object.values(geos).forEach((g) => g.dispose());
      tex.forEach((t) => {
        t.l.dispose();
        t.r.dispose();
      });
    },
    [geos, tex],
  );
  const state = useRef({ shown: "", from: "", t: 1, dir: 1 as 1 | -1 });
  const order = courses.map((c) => c.slug);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    const want = sceneState.get().course;
    const s = state.current;
    if (!s.shown) {
      s.shown = want;
      s.from = want;
    }
    if (want !== s.shown && s.t >= 1) {
      s.from = s.shown;
      s.shown = want;
      s.dir = order.indexOf(want) >= order.indexOf(s.from) ? 1 : -1;
      s.t = 0;
    }
    s.t = Math.min(1, s.t + delta / (CHOREO.swap * 1.3));
    const e = THREE.MathUtils.smootherstep(s.t, 0, 1);
    const cur = tex.get(s.shown)!;
    const prev = tex.get(s.from)!;
    const turningNow = s.t < 1;
    // forward: the old right page turns over to the left; backward: the reverse
    if (leftMat.current && rightMat.current && frontMat.current && backMat.current) {
      if (s.dir === 1) {
        leftMat.current.map = turningNow ? prev.l : cur.l;
        rightMat.current.map = cur.r;
        frontMat.current.map = prev.r;
        backMat.current.map = cur.l;
      } else {
        leftMat.current.map = cur.l;
        rightMat.current.map = turningNow ? prev.r : cur.r;
        frontMat.current.map = cur.r;
        backMat.current.map = prev.l;
      }
      [leftMat, rightMat, frontMat, backMat].forEach((m) => (m.current!.needsUpdate = true));
    }
    // the book opens as the section arrives
    const open = enter;
    const coverAngle = (1 - open) * (Math.PI / 2 - 0.04);
    if (coverL.current) coverL.current.rotation.z = -coverAngle;
    if (coverR.current) coverR.current.rotation.z = coverAngle;
    bendPage(geos.l, Math.PI - 0.05 - coverAngle, 0, 1);
    bendPage(geos.r, 0.05 + coverAngle, 0, 1);
    const tg = turning.current;
    if (tg) {
      tg.visible = turningNow && open > 0.95;
      const a = s.dir === 1 ? 0.06 + e * (Math.PI - 0.12) : Math.PI - 0.06 - e * (Math.PI - 0.12);
      bendPage(geos.turn, a, Math.sin(e * Math.PI) * 0.9 * s.dir, 1);
    }
    const b = book.current;
    if (b) {
      b.rotation.y = damp(b.rotation.y, pointer.current.x * 0.15 + (1 - enter) * 0.6, 3, delta);
      b.position.y = (1 - enter) * -1.5 + exit * 1.2;
      b.rotation.x = exit * 0.5;
    }
    const c = cam.current;
    if (c) {
      c.position.x = damp(c.position.x, pointer.current.x * 0.5, 3, delta);
      c.position.y = damp(c.position.y, (tall ? 8 : 5.6) - pointer.current.y * 0.3, 3, delta);
      c.position.z = tall ? 6.5 : 6.2;
      c.lookAt(0, 0.2, 0.2);
    }
    void time;
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0, 5.6, 6.2]} fov={tall ? 46 : 36} near={0.1} far={60} />
      <fog attach="fog" args={["#0a1326", 8, 14]} />
      <hemisphereLight args={["#ffe9cc", "#0a1326", 0.5]} />
      <spotLight position={[-2, 7, 3]} angle={0.6} penumbra={0.8} intensity={90} decay={2} color="#ffd9a6" />
      <directionalLight position={[4, 3, 2]} intensity={0.4} color="#9fb8ff" />
      {/* desk */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.2, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#141b2c" roughness={0.75} />
      </mesh>
      <SoftShadow size={7} opacity={0.6} position={[0, -0.19, 0]} />
      <group ref={book} position={[0, 0, 0]}>
        {/* covers hinge at the spine */}
        {[
          { ref: coverL, x: -1 },
          { ref: coverR, x: 1 },
        ].map(({ ref, x }) => (
          <group key={x} ref={ref}>
            <mesh position={[x * (PW / 2 + 0.06), -0.1, 0]}>
              <boxGeometry args={[PW + 0.12, 0.06, PD + 0.16]} />
              <meshPhysicalMaterial color="#13254a" roughness={0.55} clearcoat={0.3} />
            </mesh>
          </group>
        ))}
        {/* page blocks */}
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x * (PW / 2), -0.05, 0]}>
            <boxGeometry args={[PW - 0.04, 0.09, PD - 0.02]} />
            <meshStandardMaterial color="#e9dfc9" roughness={0.95} />
          </mesh>
        ))}
        <mesh geometry={geos.l}>
          <meshStandardMaterial ref={leftMat} side={THREE.DoubleSide} roughness={0.92} />
        </mesh>
        <mesh geometry={geos.r}>
          <meshStandardMaterial ref={rightMat} side={THREE.DoubleSide} roughness={0.92} />
        </mesh>
        <group ref={turning} position={[0, 0.01, 0]}>
          <mesh geometry={geos.turn}>
            <meshStandardMaterial ref={frontMat} side={THREE.FrontSide} roughness={0.92} />
          </mesh>
          <mesh geometry={geos.turn} scale={[1, 1, 1]}>
            <meshStandardMaterial ref={backMat} side={THREE.BackSide} roughness={0.92} />
          </mesh>
        </group>
        {/* ribbon */}
        <mesh position={[0.08, 0.02, PD / 2 + 0.3]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.08, 0.7]} />
          <meshStandardMaterial color="#b8873a" side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Letters />
    </>
  );
}
