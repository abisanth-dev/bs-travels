"use client";

import { useEffect, useState } from "react";

/**
 * Decides how much 3D a visitor gets:
 * - "static": reduced motion, no WebGL, or data saver. Static artwork only.
 * - "low": phones, tablets and modest hardware. Lighter scenes.
 * - "high": everything else.
 * Append ?3d=off|low|high to the URL to force a tier for testing.
 */
export type SceneTier = "pending" | "static" | "low" | "high";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function detectTier(): Exclude<SceneTier, "pending"> {
  const forced = new URLSearchParams(window.location.search).get("3d");
  if (forced === "off") return "static";
  if (forced === "low" || forced === "high") return forced;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  if (nav.connection?.saveData) return "static";
  if (!hasWebGL()) return "static";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 900;
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return coarse || small || weak ? "low" : "high";
}

export function useSceneTier() {
  const [tier, setTier] = useState<SceneTier>("pending");
  useEffect(() => {
    setTier(detectTier());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setTier(detectTier());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return tier;
}
