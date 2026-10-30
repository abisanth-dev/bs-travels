"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { origin } from "@/content/destinations";
import { arcPoints, facingRotation, latLngToXYZ } from "@/lib/geo";
import { LandDots, arcFragment, arcVertex, atmoFragment, atmoVertex, makePlaneGeometry } from "./GlobeScene";
import { Glow, Specks } from "./ObjectScenes";
import { Floating, ObjectLights, serviceObject } from "./TravelObjects";

type Pointer = React.MutableRefObject<{ x: number; y: number }>;

/** A small globe that turns to show the route from Jaffna to one destination. */
function RouteGlobe({ lat, lng, pointer, high }: { lat: number; lng: number; pointer: Pointer; high: boolean }) {
  const globe = useRef<THREE.Group>(null);
  const plane = useRef<THREE.Mesh>(null);
  const { curve, tube, mat, dest } = useMemo(() => {
    const pts = arcPoints(origin, { lat, lng }, 96, 1).map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color("#e3b467") },
        uOpacity: { value: 1.6 },
        uTime: { value: 0 },
        uReveal: { value: 0 },
        uOffset: { value: 0 },
      },
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
    });
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.007, 6, false), mat);
    return { curve, tube, mat, dest: new THREE.Vector3(...latLngToXYZ(lat, lng, 1.01)) };
  }, [lat, lng]);
  const home = useMemo(() => {
    const midLat = (lat + origin.lat) / 2;
    let midLng = (lng + origin.lng) / 2;
    if (Math.abs(lng - origin.lng) > 180) midLng += 180;
    return facingRotation(midLat, midLng);
  }, [lat, lng]);
  // long routes arc higher above the globe, so step the camera back to keep them in frame
  const camZ = useMemo(() => {
    const a = new THREE.Vector3(...latLngToXYZ(origin.lat, origin.lng, 1));
    const b = new THREE.Vector3(...latLngToXYZ(lat, lng, 1));
    return 3.3 + a.angleTo(b) * 0.75;
  }, [lat, lng]);
  const jaffna = useMemo(() => new THREE.Vector3(...latLngToXYZ(origin.lat, origin.lng, 1.01)), []);
  const planeGeo = useMemo(makePlaneGeometry, []);
  const atmo = useMemo(() => ({ uColor: { value: new THREE.Color("#7fa6e6") } }), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const m = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const reveal = Math.min(1, t / 1.8);
    mat.uniforms.uReveal.value = reveal;
    mat.uniforms.uTime.value = t;
    const g = globe.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, home.y + Math.sin(t * 0.15) * 0.12 + pointer.current.x * 0.15, 2, delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, home.x + pointer.current.y * 0.08, 2, delta);
    }
    const p = plane.current;
    if (p) {
      const u = Math.min(reveal, (t * 0.12) % 1);
      curve.getPointAt(u, tmp);
      curve.getPointAt(Math.min(1, u + 0.01), ahead);
      m.lookAt(ahead, tmp, tmp.clone().normalize());
      p.position.copy(tmp);
      p.quaternion.setFromRotationMatrix(m);
      p.rotateY(-Math.PI / 2);
      p.rotateX(Math.PI / 2);
      p.visible = reveal > 0.98;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, camZ]} fov={40} />
      <Specks count={high ? 160 : 80} spread={[9, 7, 2]} size={0.02} />
      <group ref={globe}>
        <mesh>
          <sphereGeometry args={[1, 48, 32]} />
          <meshBasicMaterial color="#0c1a33" />
        </mesh>
        <LandDots stride={high ? 1 : 2} />
        <primitive object={tube} />
        <mesh position={jaffna}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#f4eee2" />
        </mesh>
        <mesh position={dest}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshBasicMaterial color="#e3b467" toneMapped={false} />
        </mesh>
        <mesh ref={plane} geometry={planeGeo} scale={1.8}>
          <meshBasicMaterial color="#fff2d6" side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh scale={1.16}>
        <sphereGeometry args={[1, 48, 32]} />
        <shaderMaterial side={THREE.BackSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={atmo} vertexShader={atmoVertex} fragmentShader={atmoFragment} />
      </mesh>
    </>
  );
}

/** The service's travel object, floating in soft studio light. */
function ServiceObject({ slug, pointer }: { slug: string; pointer: Pointer }) {
  const El = serviceObject[slug];
  if (!El) return null;
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={32} />
      <ObjectLights />
      <Glow size={6} opacity={0.3} />
      <Floating pointer={pointer} phase={slug.length}>
        <group rotation={[0.12, -0.45, 0.08]} scale={slug === "tour-packages" || slug === "visa-extension" ? 2.1 : 1.6}>
          <El />
        </group>
      </Floating>
      <Specks count={50} spread={[8, 6, 3]} />
    </>
  );
}

export type MiniSceneSpec = { type: "service"; slug: string } | { type: "route"; lat: number; lng: number };

export default function MiniCanvas({ spec, active, high, pointer, onReady }: { spec: MiniSceneSpec; active: boolean; high: boolean; pointer: Pointer; onReady: () => void }) {
  return (
    <Canvas
      aria-hidden
      frameloop={active ? "always" : "never"}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: high, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        setTimeout(onReady, 200);
      }}
      style={{ pointerEvents: "none" }}
    >
      {spec.type === "route" ? <RouteGlobe lat={spec.lat} lng={spec.lng} pointer={pointer} high={high} /> : <ServiceObject slug={spec.slug} pointer={pointer} />}
    </Canvas>
  );
}
