"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { site, telHref } from "@/content/site";

export type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string }
  | { status: "handoff"; reason: "not_configured" | "fallback" };

/** Opening WhatsApp or email hands the message over; nothing is sent until the visitor sends it there. */
export function HandoffPanel({
  links,
  title,
  intro,
  autoFocus = true,
}: {
  links: { whatsapp: string; email: string };
  title: string;
  intro: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <div ref={ref} tabIndex={-1} className="rounded-3xl border border-gold/50 bg-navy-2 p-6 outline-none sm:p-8">
      <p className="eyebrow">Not sent yet</p>
      <h3 className="font-display mt-3 text-2xl sm:text-3xl">{title}</h3>
      <p className="mt-3 leading-relaxed text-ivory-dim">{intro}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
          <Icon name="whatsapp" size={18} /> Open in WhatsApp
        </a>
        <a href={links.email} className={buttonClass("secondary")}>
          <Icon name="mail" size={18} /> Open in email
        </a>
      </div>
      <p className="mt-5 text-sm text-ivory-faint">
        Your message is only sent once you press send in WhatsApp or your email app. You can also call us on{" "}
        <a href={telHref()} className="text-ivory underline underline-offset-4">
          {site.phone.display}
        </a>
        .
      </p>
    </div>
  );
}

export function SuccessPanel({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-3xl border border-ok/40 bg-navy-2 p-6 outline-none sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ok/15 text-ok">
        <Icon name="check" size={22} strokeWidth={2} />
      </span>
      <h3 className="font-display mt-4 text-2xl sm:text-3xl">{title}</h3>
      <div className="mt-3 leading-relaxed text-ivory-dim">{children}</div>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-danger/50 bg-danger/10 p-4 text-sm leading-relaxed text-ivory">
      <Icon name="info" size={18} className="mt-0.5 shrink-0 text-danger" />
      <p>{message}</p>
    </div>
  );
}

export function errorMessage(reason: string | undefined) {
  switch (reason) {
    case "rate_limited":
      return "We have received several requests from you in a short time. Please wait a few minutes, or contact us on WhatsApp instead.";
    case "spam":
      return "That was very quick. Please check your details and try sending again.";
    case "upstream":
      return "We could not send your request just now. Nothing was received. Please try again, or use WhatsApp or email below.";
    default:
      return "Something went wrong and your request was not sent. Please try again, or use WhatsApp or email below.";
  }
}

type PostResult = { ok: true } | { ok: false; reason: string; errors?: Record<string, string> };

export async function postForm(url: string, body: unknown): Promise<PostResult> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => null)) as PostResult | null;
    // Success only when the server confirms the backend accepted it.
    if (res.ok && data && data.ok === true) return { ok: true };
    return data && data.ok === false ? data : { ok: false, reason: "unknown" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
