"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/components/home/sceneState";
import { services } from "@/content/services";
import { BoardingPass, Documents, Parcel, Passport, StampObject, Suitcase } from "../TravelObjects";
import { CameraObject } from "../ObjectsExtra";
import { CHOREO, damp, enterAmount, exitAmount } from "../choreo";
import { usePointer, useSectionProgress } from "./common";

type Prop = { el: () => React.JSX.Element; scale: number; tilt: [number, number, number]; key: string };

/** Each service's object, scaled to roughly the same footprint. */
const PROPS: Record<string, Prop> = {
  "visa-consultancy": { el: Passport, scale: 1.0, tilt: [0.08, -0.45, 0.1], key: "#ffe1b8" },
  "air-ticketing": { el: BoardingPass, scale: 0.85, tilt: [-0.15, -0.35, 0.12], key: "#ffd6a6" },
  "immigration-support": { el: Suitcase, scale: 0.95, tilt: [0.05, -0.6, 0.04], key: "#ffe7c4" },
  "sworn-translation": { el: Documents, scale: 1.0, tilt: [0.1, -0.3, -0.05], key: "#f3ecdf" },
  "tour-packages": { el: CameraObject, scale: 0.95, tilt: [0.18, -0.55, 0.02], key: "#ffd9a0" },
  "visa-extension": { el: StampObject, scale: 0.95, tilt: [0.2, -0.4, 0.15], key: "#f6e0bf" },
  "international-courier": { el: Parcel, scale: 1.05, tilt: [0.35, -0.65, 0.05], key: "#f1d2a8" },
};

const WIDE = {
  cam: new THREE.Vector3(0, 0.5, 13),
  look: new THREE.Vector3(2.2, 0, 0),
  focus: new THREE.Vector3(3.6, 0.1, 2.4),
  rest: [
    new THREE.Vector3(7.2, 2.7, -4.5),
    new THREE.Vector3(1.4, -2.9, -3.2),
    new THREE.Vector3(8.4, -2.2, -3),
    new THREE.Vector3(4.2, 3.4, -6.5),
    new THREE.Vector3(6.2, -3.6, -7.5),
    new THREE.Vector3(10.5, 0.6, -8),
  ],
};
const TALL = {
  cam: new THREE.Vector3(0, 0.2, 11),
  look: new THREE.Vector3(0, 0, 0),
  focus: new THREE.Vector3(0, -0.1, 2),
  rest: [
    new THREE.Vector3(-2.6, 2.4, -3.5),
    new THREE.Vector3(2.7, 2.2, -3.2),
    new THREE.Vector3(-2.9, -2.4, -3),
    new THREE.Vector3(2.8, -2.5, -3.6),
    new THREE.Vector3(0, 3.6, -7),
    new THREE.Vector3(0, -3.8, -7),
  ],
};

/**
 * Services: the travel objects composed at different depths around the
 * service content. The selected service's object comes forward into a key
 * light; the others settle back into the dark.
 */
export function ServicesScene() {
  const progress = useSectionProgress("services");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width < 1000;
  const L = tall ? TALL : WIDE;
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const key = useRef<THREE.SpotLight>(null);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const inner = useRef<(THREE.Group | null)[]>([]);
  const slugs = useMemo(() => services.map((s) => s.slug).filter((s) => PROPS[s]), []);
  const look = useMemo(() => L.look.clone(), [L]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const keyColor = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    const active = sceneState.get().service;
    let restIndex = 0;
    slugs.forEach((slug, i) => {
      const g = groups.current[i];
      const n = inner.current[i];
      if (!g || !n) return;
      const focused = slug === active;
      const target = focused ? L.focus : L.rest[restIndex++ % L.rest.length];
      // arrive from below in a staggered wave, leave upwards
      const lag = Math.min(1, enter * (1.25 + i * 0.05) - i * 0.04);
      tmp.copy(target);
      tmp.y += (1 - Math.max(0, lag)) * -9 + exit * (7 + i * 0.6);
      tmp.z += (1 - Math.max(0, lag)) * -4;
      g.position.x = damp(g.position.x, tmp.x, CHOREO.pose, delta);
      g.position.y = damp(g.position.y, tmp.y, CHOREO.pose, delta);
      g.position.z = damp(g.position.z, tmp.z, CHOREO.pose, delta);
      const s = PROPS[slug].scale * (focused ? 1.05 : 0.55);
      g.scale.setScalar(damp(g.scale.x, s, CHOREO.pose, delta));
      // focused object turns gently towards the pointer; the rest drift
      const tilt = PROPS[slug].tilt;
      n.rotation.x = damp(n.rotation.x, tilt[0] + (focused ? pointer.current.y * 0.15 : Math.sin(t * 0.3 + i) * 0.2), 3, delta);
      n.rotation.y = damp(n.rotation.y, tilt[1] + (focused ? pointer.current.x * 0.35 + Math.sin(t * 0.4) * 0.15 : t * 0.05 + i), 3, delta);
      n.rotation.z = tilt[2];
      n.position.y = Math.sin(t * 0.8 + i * 1.3) * (focused ? 0.08 : 0.15);
    });
    const c = cam.current;
    if (c) {
      // reframe slightly towards the focused object, plus pointer parallax
      look.lerpVectors(L.look, L.focus, 0.18);
      c.position.x = damp(c.position.x, L.cam.x + pointer.current.x * 0.6, CHOREO.reframe, delta);
      c.position.y = damp(c.position.y, L.cam.y - pointer.current.y * 0.4, CHOREO.reframe, delta);
      c.position.z = damp(c.position.z, L.cam.z + (1 - enter) * 3 - exit * 2, CHOREO.reframe, delta);
      c.lookAt(look);
    }
    if (key.current) {
      keyColor.set(PROPS[active]?.key ?? "#ffe1b8");
      key.current.color.lerp(keyColor, Math.min(1, delta * 3));
      key.current.target.position.copy(L.focus);
      key.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={L.cam.toArray()} fov={tall ? 42 : 30} near={0.1} far={80} />
      <fog attach="fog" args={["#0a1326", 12, 24]} />
      <ambientLight intensity={0.25} />
      <spotLight ref={key} position={[L.focus.x + 2, L.focus.y + 6, L.focus.z + 6]} angle={0.45} penumbra={0.9} intensity={160} decay={2} color="#ffe1b8" />
      <directionalLight position={[-6, 2, 4]} intensity={0.45} color="#8fb0ff" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.6} color="#ffd9aa" position={[4, 5, 6]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#8fb0ff" position={[-8, 2, 2]} scale={[6, 8, 1]} />
      </Environment>
      {slugs.map((slug, i) => {
        const El = PROPS[slug].el;
        return (
          <group key={slug} ref={(el) => void (groups.current[i] = el)} position={[L.focus.x, -10, -6]}>
            <group ref={(el) => void (inner.current[i] = el)}>
              <El />
            </group>
          </group>
        );
      })}
    </>
  );
}
