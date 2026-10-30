"use client";

import type { ReactNode } from "react";
import { useStage } from "./HomeExperience";

/**
 * A DOM region the shared canvas draws a scene into. While 3D is not
 * running (loading, reduced motion, no WebGL) it shows `idleClassName`
 * styling and any `fallback` content instead.
 */
export function StageSlot({
  name,
  className = "",
  idleClassName = "",
  liveClassName = "",
  children,
}: {
  name: string;
  className?: string;
  idleClassName?: string;
  liveClassName?: string;
  children?: ReactNode;
}) {
  const { slot, live } = useStage();
  const ref = slot(name);
  return (
    <div ref={(el) => void (ref.current = el)} className={`${className} ${live ? liveClassName : idleClassName}`}>
      {children}
    </div>
  );
}

/** Content that only shows when the 3D stage is not drawing. */
export function StaticOnly({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { live } = useStage();
  return <div className={`${className} transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}>{children}</div>;
}

/**
 * A scene slot with its still: a frame captured from the same 3D scene,
 * shown for reduced motion, weak devices and WebGL failure, and while the
 * canvas loads.
 */
export function SceneSlot({
  name,
  className = "",
  posterClassName = "object-cover",
  children,
}: {
  name: string;
  className?: string;
  posterClassName?: string;
  children?: ReactNode;
}) {
  return (
    <StageSlot name={name} className={className}>
      <StaticOnly className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/scenes/poster-${name}.webp`} alt="" loading="lazy" decoding="async" className={`h-full w-full ${posterClassName}`} />
      </StaticOnly>
      {children}
    </StageSlot>
  );
}
