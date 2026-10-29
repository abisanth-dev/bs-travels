"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { checklistNotice, type Checklist } from "@/content/checklists";

const PREF_KEY = "bst-checklist-remember";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: progress simply is not kept */
  }
}

export function ChecklistView({ checklist }: { checklist: Checklist }) {
  const uid = useId();
  const storeKey = `bst-checklist-${checklist.slug}`;
  const [variantId, setVariantId] = useState(checklist.variants[0]?.id ?? "");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [remember, setRemember] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const pref = read<boolean>(PREF_KEY, false);
    setRemember(pref);
    if (pref) setChecked(read<Record<string, boolean>>(storeKey, {}));
    setLoaded(true);
  }, [storeKey]);

  useEffect(() => {
    if (!loaded) return;
    write(PREF_KEY, remember);
    write(storeKey, remember ? checked : null);
  }, [checked, remember, loaded, storeKey]);

  const variant = checklist.variants.find((v) => v.id === variantId) ?? checklist.variants[0];
  const keys = useMemo(
    () => (variant ? variant.groups.flatMap((g) => g.items.map((_, i) => `${variant.id}.${g.id}.${i}`)) : []),
    [variant],
  );
  const done = keys.filter((k) => checked[k]).length;
  const pct = keys.length ? Math.round((done / keys.length) * 100) : 0;

  if (!variant) return null;

  return (
    <div className="print-plain">
      <div className="print-only mb-6">
        <p style={{ fontSize: 12 }}>BS Travels (Private) Limited · #338, Navalar Road, Jaffna · +94 77 4481 790</p>
        <h1 style={{ fontSize: 26, marginTop: 8 }}>{checklist.title}</h1>
        <p style={{ fontSize: 12, marginTop: 8 }}>{checklistNotice}</p>
      </div>

      {checklist.variants.length > 1 ? (
        <div role="group" aria-label="Visa type" className="no-print mb-8 flex flex-wrap gap-2">
          {checklist.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={v.id === variant.id}
              onClick={() => setVariantId(v.id)}
              className={`min-h-11 rounded-full border px-5 text-sm ${
                v.id === variant.id ? "border-gold bg-gold text-night" : "border-line-strong text-ivory-dim hover:text-ivory"
              }`}
            >
              {v.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="no-print sticky top-[calc(var(--header-h)+0.5rem)] z-20 rounded-2xl border border-line-strong bg-navy/95 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p id={`${uid}-progress-label`} className="text-sm">
            <span className="font-display text-2xl text-ivory">{done}</span>
            <span className="text-ivory-dim"> of {keys.length} ready</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => window.print()} className={buttonClass("secondary", "min-h-11 px-4")}>
              <Icon name="print" size={18} /> Print
            </button>
            <button
              type="button"
              onClick={() => setChecked((c) => Object.fromEntries(Object.entries(c).filter(([k]) => !k.startsWith(`${variant.id}.`))))}
              disabled={done === 0}
              className={buttonClass("secondary", "min-h-11 px-4")}
            >
              <Icon name="reset" size={18} /> Reset
            </button>
          </div>
        </div>
        <div
          role="progressbar"
          aria-labelledby={`${uid}-progress-label`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-ivory-dim">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-5 w-5 accent-[var(--color-gold)]" />
          Remember my progress on this device
        </label>
      </div>

      {variant.description ? <p className="mt-8 text-ivory-dim">{variant.description}</p> : null}

      <div className="mt-8 space-y-12">
        {variant.groups.map((g) => (
          <fieldset key={g.id}>
            <legend className="font-display text-3xl">{g.title}</legend>
            {g.description ? <p className="mt-2 text-ivory-dim">{g.description}</p> : null}
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {g.items.map((item, i) => {
                const key = `${variant.id}.${g.id}.${i}`;
                const id = `${uid}-${key}`;
                return (
                  <li key={key}>
                    <label htmlFor={id} className="flex min-h-14 cursor-pointer items-start gap-4 py-4">
                      <input
                        id={id}
                        type="checkbox"
                        checked={Boolean(checked[key])}
                        onChange={(e) => setChecked((c) => ({ ...c, [key]: e.target.checked }))}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-gold)]"
                      />
                      <span className={`text-lg leading-snug ${checked[key] ? "text-ivory-faint line-through decoration-gold/60" : ""}`}>{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
