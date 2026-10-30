"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/components/home/sceneState";
import { origin } from "@/content/destinations";
import { arcFragment, arcVertex } from "../GlobeScene";
import { damp, enterAmount, exitAmount } from "../choreo";
import { Anchor, usePointer, useSectionProgress } from "./common";

// Must match scripts/generate-geo-art.py
const BBOX = { lng0: 79.45, lat0: 5.75, lng1: 82.05, lat1: 10.05 };
const K = 2; // world units per degree of latitude
const COS = Math.cos(THREE.MathUtils.degToRad(8));
const W = (BBOX.lng1 - BBOX.lng0) * K * COS;
const H = (BBOX.lat1 - BBOX.lat0) * K;
const C = { lng: (BBOX.lng0 + BBOX.lng1) / 2, lat: (BBOX.lat0 + BBOX.lat1) / 2 };

export function lankaXZ(lat: number, lng: number): [number, number] {
  return [(lng - C.lng) * K * COS, -(lat - C.lat) * K];
}

const oceanVertex = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const oceanFragment = /* glsl */ `
  uniform sampler2D uShallow; uniform vec4 uBox; uniform float uTime; uniform vec3 uSun;
  varying vec2 vWorld;
  void main() {
    vec2 uv = vec2((vWorld.x - uBox.x) / uBox.z, 1.0 - (vWorld.y - uBox.y) / uBox.w);
    float shallow = 0.0;
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) shallow = texture2D(uShallow, uv).r;
    vec3 deep = vec3(0.02, 0.07, 0.16);
    vec3 shelf = vec3(0.06, 0.32, 0.42);
    vec3 col = mix(deep, shelf, smoothstep(0.02, 0.9, shallow));
    // slow swell lines catching the low sun
    float w = sin(vWorld.x * 3.1 + vWorld.y * 1.3 + uTime * 0.6) * sin(vWorld.y * 5.7 - uTime * 0.45);
    float glint = pow(max(w, 0.0), 24.0) * 0.12;
    float dist = length(vWorld);
    col += uSun * glint * smoothstep(18.0, 4.0, dist);
    // surf line hugging the coast
    float surf = smoothstep(0.55, 0.75, shallow) * (0.5 + 0.5 * sin(uTime * 1.4 + shallow * 30.0));
    col += vec3(0.5, 0.6, 0.6) * surf * 0.12;
    col = mix(col, vec3(0.04, 0.07, 0.15), smoothstep(10.0, 22.0, dist));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * About: Sri Lanka in relief on a calm ocean, from Natural Earth coastline
 * data. Jaffna carries a marker the visitor can open, and a route lifts off
 * from it towards the wider world as the section scrolls.
 */
export function IslandScene() {
  const progress = useSectionProgress("about");
  const pointer = usePointer();
  const { size } = useThree();
  const tall = size.width / size.height < 1;
  const [color, height, shallow] = useTexture([
    "/images/scenes/lanka-color.webp",
    "/images/scenes/lanka-height.png",
    "/images/scenes/lanka-shallow.png",
  ]);
  color.colorSpace = THREE.SRGBColorSpace;
  color.anisotropy = 8;
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const pin = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [jx, jz] = lankaXZ(origin.lat, origin.lng);
  const jaffna = useMemo(() => new THREE.Vector3(jx, 0.12, jz), [jx, jz]);
  const look = useMemo(() => new THREE.Vector3(), []);
  const oceanUniforms = useMemo(
    () => ({
      uShallow: { value: shallow },
      uBox: { value: new THREE.Vector4(-W / 2, -H / 2, W, H) },
      uTime: { value: 0 },
      uSun: { value: new THREE.Color("#ffc58a") },
    }),
    [shallow],
  );
  const route = useMemo(() => {
    // lift off from Jaffna and head out over the sea to the north-west
    const pts = [
      new THREE.Vector3(jx, 0.15, jz),
      new THREE.Vector3(jx - 0.6, 1.4, jz - 1.2),
      new THREE.Vector3(jx - 2.2, 2.6, jz - 3.6),
      new THREE.Vector3(jx - 5.5, 3.2, jz - 8),
      new THREE.Vector3(jx - 10, 3.4, jz - 14),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color("#e3b467") },
        uOpacity: { value: 1.4 },
        uTime: { value: 0 },
        uReveal: { value: 0 },
        uOffset: { value: 0 },
      },
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
    });
    return { mesh: new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.03, 8, false), mat), mat };
  }, [jx, jz]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = progress.current;
    const enter = enterAmount(p);
    const exit = exitAmount(p);
    const open = sceneState.get().jaffnaOpen;
    oceanUniforms.uTime.value = t;
    route.mat.uniforms.uTime.value = t;
    route.mat.uniforms.uReveal.value = THREE.MathUtils.clamp((p - 0.25) / 0.4, 0, 1);
    if (ring.current) {
      const k = (t * 0.7) % 1;
      ring.current.scale.setScalar(1 + k * 4);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - k);
    }
    if (pin.current) pin.current.scale.setScalar(damp(pin.current.scale.x, open ? 1.4 : 1, 5, delta));
    const c = cam.current;
    if (c) {
      // descend from high above, settle in a three-quarter view, then follow the route out
      const base = tall ? new THREE.Vector3(1.4, 11, 10) : new THREE.Vector3(5.5, 5.8, 9.5);
      const zoom = open ? 0.55 : 1;
      const tx = THREE.MathUtils.lerp(jx, base.x, zoom) + pointer.current.x * 0.8 - exit * 3;
      const ty = (open ? 4 : base.y) + (1 - enter) * 9 - pointer.current.y * 0.5;
      const tz = THREE.MathUtils.lerp(jz + 4, base.z, zoom) - exit * 6;
      c.position.x = damp(c.position.x, tx, 2.5, delta);
      c.position.y = damp(c.position.y, ty, 2.5, delta);
      c.position.z = damp(c.position.z, tz, 2.5, delta);
      const lx = open ? jx : tall ? 0 : 0.6;
      const lz = open ? jz : tall ? -0.6 : -0.8;
      look.x = damp(look.x, lx - exit * 4, 2.5, delta);
      look.y = 0;
      look.z = damp(look.z, lz - exit * 7, 2.5, delta);
      c.lookAt(look);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[6, 18, 9]} fov={tall ? 46 : 34} near={0.1} far={120} />
      <fog attach="fog" args={["#0a1326", 16, 34]} />
      <hemisphereLight args={["#bcd0ff", "#0a1326", 0.55]} />
      <directionalLight position={[-8, 5, 2]} intensity={2.6} color="#ffd2a0" />
      <directionalLight position={[6, 6, 6]} intensity={0.5} color="#9fb8ff" />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[80, 80]} />
        <shaderMaterial uniforms={oceanUniforms} vertexShader={oceanVertex} fragmentShader={oceanFragment} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <planeGeometry args={[W, H, 200, 330]} />
        <meshStandardMaterial map={color} displacementMap={height} displacementScale={0.9} alphaTest={0.5} roughness={0.9} />
      </mesh>
      <primitive object={route.mesh} />
      <group ref={pin} position={jaffna}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
          <meshBasicMaterial color="#e3b467" />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#f6d08e" toneMapped={false} />
        </mesh>
        <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.08, 0.1, 40]} />
          <meshBasicMaterial color="#e3b467" transparent depthWrite={false} />
        </mesh>
        <group position={[0, 0.72, 0]}>
          <Anchor name="jaffna" />
        </group>
      </group>
    </>
  );
}
