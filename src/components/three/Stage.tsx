"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useStage } from "@/components/home/HomeExperience";
import { HeroScene } from "./HeroScene";
import { GlobeScene } from "./GlobeScene";
import { FinaleScene } from "./FinaleScene";
import { ServicesScene } from "./scenes/ServicesScene";
import { InspirationScene } from "./scenes/InspirationScene";
import { IslandScene } from "./scenes/IslandScene";
import { StepsScene } from "./scenes/StepsScene";
import { BookScene } from "./scenes/BookScene";
import { FolderScene } from "./scenes/FolderScene";
import { JournalScene } from "./scenes/JournalScene";
import { FaqScene } from "./scenes/FaqScene";
import { DeskScene } from "./scenes/DeskScene";
import type { SceneTier } from "./useSceneTier";

/** Clears the shared canvas each frame before the views draw into it. */
function Clearer() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
  }, 0);
  return null;
}

/** Homepage scenes, in page order. Each draws into the DOM slot of the same name. */
const SCENES: { name: string; render: (tier: SceneTier) => ReactNode }[] = [
  { name: "hero", render: (tier) => <HeroScene tier={tier} /> },
  { name: "services", render: () => <ServicesScene /> },
  { name: "globe", render: (tier) => <GlobeScene tier={tier} /> },
  { name: "inspire", render: () => <InspirationScene /> },
  { name: "about", render: () => <IslandScene /> },
  { name: "steps", render: () => <StepsScene /> },
  { name: "book", render: () => <BookScene /> },
  { name: "folder", render: () => <FolderScene /> },
  { name: "journal", render: () => <JournalScene /> },
  { name: "faq", render: () => <FaqScene /> },
  { name: "desk", render: () => <DeskScene /> },
  { name: "finale", render: (tier) => <FinaleScene tier={tier} /> },
];

/**
 * The single, lazily loaded WebGL canvas for the homepage. It sits fixed
 * behind the page and draws each section's scene into that section's slot.
 * A scene is mounted only while its section is within about a screen of the
 * viewport (and unmounted, freeing its GPU resources, once far away), and
 * drawn only while actually visible.
 */
export default function Stage() {
  const { tier, heroSlot, slot, setReady } = useStage();
  const refs = useMemo(
    () => Object.fromEntries(SCENES.map(({ name }) => [name, name === "hero" ? heroSlot : slot(name)])) as Record<string, React.RefObject<HTMLElement | null>>,
    [heroSlot, slot],
  );
  const [visible, setVisible] = useState<Record<string, boolean>>({ hero: true });
  const [near, setNear] = useState<Record<string, boolean>>({ hero: true });
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const keyOf = (el: Element) => Object.entries(refs).find(([, r]) => r.current === el)?.[0];
    const watch = (set: typeof setVisible, margin: string) =>
      new IntersectionObserver(
        (list) =>
          set((prev) => {
            const next = { ...prev };
            list.forEach((e) => {
              const key = keyOf(e.target);
              if (key) next[key] = e.isIntersecting;
            });
            return next;
          }),
        { rootMargin: margin },
      );
    const seen = watch(setVisible, "80px 0px");
    const close = watch(setNear, "120% 0px");
    Object.values(refs).forEach((r) => {
      if (!r.current) return;
      seen.observe(r.current);
      close.observe(r.current);
    });
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      seen.disconnect();
      close.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refs]);

  useEffect(() => () => setReady(false), [setReady]);

  const active = pageVisible && Object.values(visible).some(Boolean);
  const high = tier === "high";

  return (
    <Canvas
      aria-hidden
      className="!fixed inset-0 -z-10 !h-dvh !w-screen"
      style={{ pointerEvents: "none" }}
      frameloop={active ? "always" : "never"}
      dpr={high ? [1, 1.6] : [1, 1.25]}
      gl={{ antialias: high, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", () => setReady(false));
        // Give the first frames a moment to settle before the stills fade out.
        setTimeout(() => setReady(true), 250);
      }}
    >
      <Clearer />
      {SCENES.map(({ name, render }) =>
        near[name] && refs[name].current ? (
          <View key={name} track={refs[name] as React.RefObject<HTMLElement>} visible={Boolean(visible[name])}>
            <Suspense fallback={null}>{render(tier)}</Suspense>
          </View>
        ) : null,
      )}
    </Canvas>
  );
}
