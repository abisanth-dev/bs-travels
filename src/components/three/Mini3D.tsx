"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MiniSceneSpec } from "./MiniScenes";
import { useSceneTier } from "./useSceneTier";

const MiniCanvas = dynamic(() => import("./MiniScenes"), { ssr: false });

/**
 * A small, self-contained 3D scene for inner pages. It loads only once it is
 * near the viewport, pauses when scrolled away or the tab is hidden, and
 * keeps the static fallback for reduced motion or when WebGL is unavailable.
 */
export function Mini3D({ spec, className = "", children }: { spec: MiniSceneSpec; className?: string; children: ReactNode }) {
  const tier = useSceneTier();
  const box = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const enabled = tier === "low" || tier === "high";

  useEffect(() => {
    const el = box.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setOnScreen(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
    };
  }, [enabled]);

  const live = enabled && ready;
  return (
    <div ref={box} className={`relative ${className}`} aria-hidden>
      <div className={`absolute inset-0 transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}>{children}</div>
      {enabled && near ? (
        <div className={`absolute inset-0 transition-opacity duration-700 ${live ? "opacity-100" : "opacity-0"}`}>
          <MiniCanvas spec={spec} active={onScreen && pageVisible} high={tier === "high"} pointer={pointer} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
