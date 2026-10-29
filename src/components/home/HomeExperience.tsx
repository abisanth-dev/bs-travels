"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSceneTier, type SceneTier } from "@/components/three/useSceneTier";

gsap.registerPlugin(ScrollTrigger);

export type GlobeInteraction = {
  dragging: boolean;
  dx: number;
  dy: number;
  lastInteraction: number;
};

type StageContextValue = {
  tier: SceneTier;
  ready: boolean;
  setReady: (v: boolean) => void;
  heroSlot: RefObject<HTMLDivElement | null>;
  globeSlot: RefObject<HTMLDivElement | null>;
  /** 0 at the top of the hero, 1 once it has scrolled away. Written by GSAP. */
  heroProgress: MutableRefObject<number>;
  /** 0 to 1 as the globe section enters. Written by GSAP. */
  globeReveal: MutableRefObject<number>;
  /** Pointer position in -1..1, for restrained camera parallax. */
  pointer: MutableRefObject<{ x: number; y: number }>;
  selected: string | null;
  setSelected: (slug: string | null) => void;
  globeInput: MutableRefObject<GlobeInteraction>;
  /** DOM label elements positioned by the globe scene each frame. */
  globeLabels: MutableRefObject<Map<string, HTMLElement>>;
};

const StageContext = createContext<StageContextValue | null>(null);

export function useStage() {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStage must be used inside <HomeExperience>");
  return ctx;
}

const Stage = dynamic(() => import("@/components/three/Stage"), { ssr: false });

export function HomeExperience({ children }: { children: ReactNode }) {
  const tier = useSceneTier();
  const [ready, setReady] = useState(false);
  const [mountStage, setMountStage] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const heroSlot = useRef<HTMLDivElement>(null);
  const globeSlot = useRef<HTMLDivElement>(null);
  const heroProgress = useRef(0);
  const globeReveal = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const globeInput = useRef<GlobeInteraction>({ dragging: false, dx: 0, dy: 0, lastInteraction: 0 });
  const globeLabels = useRef(new Map<string, HTMLElement>());

  // Load the 3D bundle once the page is idle, so text and CTAs come first.
  useEffect(() => {
    if (tier !== "low" && tier !== "high") {
      setMountStage(false);
      setReady(false);
      return;
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMountStage(true), { timeout: 1500 });
      return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setMountStage(true), 400);
    return () => clearTimeout(t);
  }, [tier]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Scroll choreography. GSAP is the only system driving scroll-linked values.
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    if (heroSlot.current) {
      triggers.push(
        ScrollTrigger.create({
          trigger: heroSlot.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => (heroProgress.current = self.progress),
        }),
      );
    }
    if (globeSlot.current) {
      triggers.push(
        ScrollTrigger.create({
          trigger: globeSlot.current,
          start: "top 85%",
          end: "center center",
          scrub: true,
          onUpdate: (self) => (globeReveal.current = self.progress),
        }),
      );
    }
    return () => triggers.forEach((t) => t.kill());
  }, []);

  // Text reveals: short, once, and skipped for reduced motion.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            delay: Number(el.dataset.revealDelay ?? 0),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });
    });
    return () => mm.revert();
  }, []);

  const value = useMemo<StageContextValue>(
    () => ({
      tier,
      ready,
      setReady,
      heroSlot,
      globeSlot,
      heroProgress,
      globeReveal,
      pointer,
      selected,
      setSelected,
      globeInput,
      globeLabels,
    }),
    [tier, ready, selected],
  );

  return (
    <StageContext.Provider value={value}>
      {mountStage ? <Stage /> : null}
      {children}
    </StageContext.Provider>
  );
}
