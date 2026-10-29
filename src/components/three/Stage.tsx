"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { useStage } from "@/components/home/HomeExperience";
import { HeroScene } from "./HeroScene";
import { GlobeScene } from "./GlobeScene";
import { FinaleScene } from "./FinaleScene";
import { ServiceCardScene, SupportingScene } from "./ObjectScenes";

/** Clears the shared canvas each frame before the views draw into it. */
function Clearer() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
  }, 0);
  return null;
}

const FEATURED = ["visa-consultancy", "air-ticketing", "immigration-support"];

/**
 * The single, lazily loaded WebGL canvas for the homepage. It sits fixed
 * behind the page and draws into the DOM slots it tracks, so the hero,
 * service objects, globe and landing all share one context.
 */
export default function Stage() {
  const { tier, heroSlot, globeSlot, slot, setReady } = useStage();
  const slots = useMemo(() => {
    const named: [string, React.RefObject<HTMLElement | null>][] = [
      ["hero", heroSlot],
      ["globe", globeSlot],
      ...FEATURED.map((s): [string, React.RefObject<HTMLElement | null>] => [`svc-${s}`, slot(`svc-${s}`)]),
      ["svc-more", slot("svc-more")],
      ["finale", slot("finale")],
    ];
    return named;
  }, [heroSlot, globeSlot, slot]);
  const [visible, setVisible] = useState<Record<string, boolean>>({ hero: true });
  const [pageVisible, setPageVisible] = useState(true);

  // Stop rendering entirely when no scene is on screen or the tab is hidden.
  useEffect(() => {
    const io = new IntersectionObserver(
      (list) =>
        setVisible((prev) => {
          const next = { ...prev };
          list.forEach((e) => {
            const key = slots.find(([, r]) => r.current === e.target)?.[0];
            if (key) next[key] = e.isIntersecting;
          });
          return next;
        }),
      { rootMargin: "120px 0px" },
    );
    slots.forEach(([, r]) => r.current && io.observe(r.current));
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [slots]);

  useEffect(() => () => setReady(false), [setReady]);

  const active = pageVisible && Object.values(visible).some(Boolean);
  const high = tier === "high";
  const track = (name: string) => slots.find(([n]) => n === name)![1] as React.RefObject<HTMLElement>;
  const shown = (name: string) => Boolean(visible[name]) && Boolean(track(name).current);

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
      <View track={track("hero")} visible={shown("hero")}>
        <HeroScene tier={tier} />
      </View>
      {FEATURED.map((s, i) => (
        <View key={s} track={track(`svc-${s}`)} visible={shown(`svc-${s}`)}>
          <ServiceCardScene slug={s} large={i === 0} />
        </View>
      ))}
      <View track={track("svc-more")} visible={shown("svc-more")}>
        <SupportingScene />
      </View>
      <View track={track("globe")} visible={shown("globe")}>
        <GlobeScene tier={tier} />
      </View>
      <View track={track("finale")} visible={shown("finale")}>
        <FinaleScene tier={tier} />
      </View>
    </Canvas>
  );
}
