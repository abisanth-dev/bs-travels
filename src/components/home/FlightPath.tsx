"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The luminous flight path that links the homepage sections. It picks up
 * where the 3D aircraft leaves the hero, runs down the page gutters, crosses
 * only in the spacing between sections and lands on the final horizon.
 * Drawn on large screens only; the content never depends on it.
 */
type Node = { selector: string; x: number; y: number };

const NODES: Node[] = [
  { selector: "[data-flight='hero']", x: 0.8, y: 0.86 },
  { selector: "#services", x: 0.965, y: 0.08 },
  { selector: "#services", x: 0.975, y: 0.7 },
  { selector: "#destinations-globe", x: 0.985, y: 0.18 },
  { selector: "#destinations-globe", x: 0.975, y: 0.85 },
  { selector: "[data-flight='about']", x: 0.03, y: 0.2 },
  { selector: "[data-flight='about']", x: 0.025, y: 0.9 },
  { selector: "[data-flight='explore']", x: 0.97, y: 0.12 },
  { selector: "[data-flight='explore']", x: 0.975, y: 0.92 },
  { selector: "[data-flight='courses']", x: 0.03, y: 0.3 },
  { selector: "[data-flight='prepare']", x: 0.975, y: 0.2 },
  { selector: "[data-flight='prepare']", x: 0.97, y: 0.9 },
  { selector: "[data-flight='final']", x: 0.72, y: 0.3 },
  { selector: "[data-flight-node='landing']", x: 0.5, y: 0.5 },
];

function toPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    d += ` C ${p1.x + (p2.x - p0.x) * t} ${p1.y + (p2.y - p0.y) * t}, ${p2.x - (p3.x - p1.x) * t} ${p2.y - (p3.y - p1.y) * t}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function FlightPath() {
  const host = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glyph = useRef<SVGGElement>(null);
  const [geom, setGeom] = useState<{ w: number; h: number; d: string } | null>(null);

  // Measure section positions and build the path.
  useEffect(() => {
    const el = host.current;
    const wrapper = el?.parentElement;
    if (!el || !wrapper) return;
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (window.innerWidth < 1024) {
          setGeom(null);
          return;
        }
        const base = wrapper.getBoundingClientRect();
        const w = wrapper.clientWidth;
        const pts = NODES.flatMap((n) => {
          const target = wrapper.querySelector<HTMLElement>(n.selector);
          if (!target) return [];
          const r = target.getBoundingClientRect();
          const isPoint = r.width < 4;
          return [
            {
              x: isPoint ? r.left - base.left : w * n.x,
              y: r.top - base.top + (isPoint ? 0 : r.height * n.y),
            },
          ];
        });
        setGeom({ w, h: wrapper.scrollHeight, d: toPath(pts) });
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Draw the path and fly the glyph so its tip stays just below mid-screen.
  useEffect(() => {
    const path = pathRef.current;
    const g = glyph.current;
    const wrapper = host.current?.parentElement;
    if (!geom || !path || !g || !wrapper) return;
    const total = path.getTotalLength();
    const samples: { len: number; y: number }[] = [];
    let maxY = -Infinity;
    for (let len = 0; len <= total; len += 8) {
      const p = path.getPointAtLength(len);
      maxY = Math.max(maxY, p.y);
      samples.push({ len, y: maxY });
    }
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total}`;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const top = wrapper.getBoundingClientRect().top + window.scrollY;
      const targetY = reduce ? Infinity : window.scrollY - top + window.innerHeight * 0.62;
      let lo = 0;
      let hi = samples.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].y < targetY) lo = mid + 1;
        else hi = mid;
      }
      const len = samples[lo]?.len ?? total;
      path.style.strokeDashoffset = `${total - len}`;
      const p = path.getPointAtLength(len);
      const q = path.getPointAtLength(Math.min(total, len + 2));
      const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
      const landing = Math.max(0, (len - (total - 500)) / 500);
      const scale = 1 - landing * 0.55;
      g.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle}) scale(${scale})`);
      g.style.opacity = len < 40 ? "0" : `${1 - landing * 0.85}`;
    };
    update();
    const st = ScrollTrigger.create({ trigger: wrapper, start: "top top", end: "bottom bottom", onUpdate: update });
    window.addEventListener("resize", update);
    return () => {
      st.kill();
      window.removeEventListener("resize", update);
    };
  }, [geom]);

  return (
    <div ref={host} className="pointer-events-none absolute inset-0 z-20 hidden lg:block" aria-hidden>
      {geom ? (
        <svg width={geom.w} height={geom.h} viewBox={`0 0 ${geom.w} ${geom.h}`} className="absolute left-0 top-0 overflow-visible">
          <defs>
            <linearGradient id="fp-fade" x1="0" y1="0" x2="0" y2={geom.h} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#e3b467" stopOpacity="0" />
              <stop offset={Math.min(0.12, 900 / geom.h)} stopColor="#e3b467" stopOpacity="0.75" />
              <stop offset="0.92" stopColor="#f2b57a" stopOpacity="0.8" />
              <stop offset="1" stopColor="#ffd8a8" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path d={geom.d} fill="none" stroke="rgb(244 238 226 / 0.08)" strokeWidth="1" strokeDasharray="2 7" />
          <path ref={pathRef} d={geom.d} fill="none" stroke="url(#fp-fade)" strokeWidth="1.6" strokeLinecap="round" className="flight-path-glow" />
          <g ref={glyph} style={{ opacity: 0 }}>
            <circle r="14" fill="rgb(227 180 103 / 0.12)" />
            <path
              d="M9 0 L-3 -2 L-7 -9 L-9.5 -9 L-6.5 -1.8 L-11 -1.4 L-13 -4.5 L-14.5 -4.5 L-13 0 L-14.5 4.5 L-13 4.5 L-11 1.4 L-6.5 1.8 L-9.5 9 L-7 9 L-3 2 Z"
              fill="#f4eee2"
            />
          </g>
        </svg>
      ) : null}
    </div>
  );
}
