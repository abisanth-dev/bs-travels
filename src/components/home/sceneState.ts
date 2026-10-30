"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared interaction state between the homepage HTML controls and the 3D
 * scenes. The HTML owns every decision (tabs, selectors, forms); scenes only
 * read it. Scenes read `sceneState.get()` inside useFrame, so a change never
 * re-renders the canvas tree; React components subscribe with useSceneState.
 */
export type SceneState = {
  service: string;
  inspiration: number;
  /** +1 when moving forward through destinations, -1 backwards. */
  inspirationDir: 1 | -1;
  jaffnaOpen: boolean;
  step: number;
  course: string;
  checklist: { slug: string; done: number; total: number };
  journal: number | null;
  faq: string | null;
  appointment: { date: string; progress: number };
};

let state: SceneState = {
  service: "visa-consultancy",
  inspiration: 0,
  inspirationDir: 1,
  jaffnaOpen: false,
  step: 0,
  course: "spanish",
  checklist: { slug: "canada", done: 0, total: 0 },
  journal: null,
  faq: null,
  appointment: { date: "", progress: 0 },
};
const listeners = new Set<() => void>();

export const sceneState = {
  get: () => state,
  set(patch: Partial<SceneState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};

export function useSceneState<T>(select: (s: SceneState) => T): T {
  return useSyncExternalStore(
    sceneState.subscribe,
    () => select(state),
    () => select(state),
  );
}
