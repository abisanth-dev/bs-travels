"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useEffect, useState } from "react";
import { useStage } from "@/components/home/HomeExperience";
import { HeroScene } from "./HeroScene";
import { GlobeScene } from "./GlobeScene";

/** Clears the shared canvas each frame before the views draw into it. */
function Clearer() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
  }, 0);
  return null;
}

/**
 * The single, lazily loaded WebGL canvas for the homepage. It sits fixed
 * behind the page and draws into the DOM slots it tracks, so the hero
 * aircraft and the globe share one context.
 */
export default function Stage() {
  const { tier, heroSlot, globeSlot, setReady } = useStage();
  const [visible, setVisible] = useState({ hero: true, globe: false });
  const [pageVisible, setPageVisible] = useState(true);

  // Stop rendering entirely when neither scene is on screen or the tab is hidden.
  useEffect(() => {
    const entries: [keyof typeof visible, HTMLElement | null][] = [
      ["hero", heroSlot.current],
      ["globe", globeSlot.current],
    ];
    const io = new IntersectionObserver(
      (list) => {
        setVisible((prev) => {
          const next = { ...prev };
          list.forEach((e) => {
            const key = entries.find(([, el]) => el === e.target)?.[0];
            if (key) next[key] = e.isIntersecting;
          });
          return next;
        });
      },
      { rootMargin: "120px 0px" },
    );
    entries.forEach(([, el]) => el && io.observe(el));
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [heroSlot, globeSlot]);

  useEffect(() => () => setReady(false), [setReady]);

  const active = pageVisible && (visible.hero || visible.globe);
  const high = tier === "high";

  return (
    <Canvas
      aria-hidden
      className="!fixed inset-0 -z-10 !h-dvh !w-screen"
      style={{ pointerEvents: "none" }}
      frameloop={active ? "always" : "never"}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: high, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", () => setReady(false));
        // Give the first frames a moment to settle before fading out the poster.
        setTimeout(() => setReady(true), 250);
      }}
    >
      <Clearer />
      <View track={heroSlot as React.RefObject<HTMLElement>} visible={visible.hero}>
        <HeroScene tier={tier} />
      </View>
      <View track={globeSlot as React.RefObject<HTMLElement>} visible={visible.globe}>
        <GlobeScene tier={tier} />
      </View>
    </Canvas>
  );
}
