/**
 * Server-side delivery for enquiries and appointment requests.
 *
 * Configure ONE provider with environment variables (never NEXT_PUBLIC_):
 *   FORM_PROVIDER=resend   RESEND_API_KEY, FORM_TO_EMAIL, FORM_FROM_EMAIL
 *   FORM_PROVIDER=webhook  FORM_WEBHOOK_URL, optional FORM_WEBHOOK_TOKEN
 *
 * With no provider configured, submissions are refused with
 * "not_configured" and the site offers a WhatsApp or email handoff instead.
 * Personal data is never logged.
 */
type DeliveryResult = { ok: true } | { ok: false; reason: "not_configured" | "upstream" };

export type SubmissionKind = "enquiry" | "appointment";

export function submissionProvider(): "resend" | "webhook" | null {
  const p = process.env.FORM_PROVIDER?.toLowerCase();
  if (p === "resend" && process.env.RESEND_API_KEY && process.env.FORM_TO_EMAIL && process.env.FORM_FROM_EMAIL) return "resend";
  if (p === "webhook" && process.env.FORM_WEBHOOK_URL) return "webhook";
  return null;
}

export function isSubmissionConfigured() {
  return submissionProvider() !== null;
}

export async function deliver(
  kind: SubmissionKind,
  message: { subject: string; text: string; replyTo: string; data: Record<string, unknown> },
): Promise<DeliveryResult> {
  const provider = submissionProvider();
  if (!provider) return { ok: false, reason: "not_configured" };
  try {
    if (provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.FORM_FROM_EMAIL,
          to: process.env.FORM_TO_EMAIL!.split(",").map((s) => s.trim()),
          reply_to: message.replyTo,
          subject: message.subject,
          text: message.text,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        console.error(`[forms] ${kind}: email provider responded ${res.status}`);
        return { ok: false, reason: "upstream" };
      }
      return { ok: true };
    }
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.FORM_WEBHOOK_TOKEN) headers.Authorization = `Bearer ${process.env.FORM_WEBHOOK_TOKEN}`;
    const res = await fetch(process.env.FORM_WEBHOOK_URL!, {
      method: "POST",
      headers,
      body: JSON.stringify({ kind, submittedAt: new Date().toISOString(), subject: message.subject, text: message.text, data: message.data }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[forms] ${kind}: webhook responded ${res.status}`);
      return { ok: false, reason: "upstream" };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[forms] ${kind}: delivery failed (${err instanceof Error ? err.name : "unknown error"})`);
    return { ok: false, reason: "upstream" };
  }
}

/** Best-effort per-instance rate limit. Serverless instances do not share it. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}
