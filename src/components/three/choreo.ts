import * as THREE from "three";

/**
 * Central timing for the homepage film. Every scene reads its section's
 * scroll progress (0 as the section's top meets the bottom of the viewport,
 * 1 as its bottom leaves the top) and shapes entrances and exits from these
 * shared values, so sections hand over at the same rhythm.
 */
export const CHOREO = {
  /** Progress at which a scene has fully arrived. */
  enterEnd: 0.38,
  /** Progress at which a scene starts to leave. */
  exitStart: 0.68,
  /** Damping rate for camera reframing after a selection. */
  reframe: 3.2,
  /** Damping rate for objects moving to a new pose. */
  pose: 4,
  /** How far (radians) the pointer may swing a scene camera. */
  pointerSwing: 0.12,
  /** Seconds for a destination or course transition. */
  swap: 0.9,
};

/** 0..1 arrival amount, eased. */
export function enterAmount(p: number) {
  return THREE.MathUtils.smootherstep(p, 0.02, CHOREO.enterEnd);
}

/** 0..1 departure amount, eased. */
export function exitAmount(p: number) {
  return THREE.MathUtils.smootherstep(p, CHOREO.exitStart, 0.98);
}

export const damp = THREE.MathUtils.damp;
