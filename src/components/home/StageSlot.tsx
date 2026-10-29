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
