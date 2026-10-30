import { NextResponse } from "next/server";
import type { z } from "zod";
import { fieldErrors, MIN_FILL_MS } from "./schemas";
import { rateLimited } from "./deliver";

export type ApiResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; errors: Record<string, string> }
  | { ok: false; reason: "not_configured" | "upstream" | "rate_limited" | "spam" | "bad_request" };

export function json(body: ApiResult, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Parses, rate-limits and validates a form post. Returns data or a ready response. */
export async function readSubmission<S extends z.ZodTypeAny>(req: Request, schema: S): Promise<{ data: z.output<S> } | { response: NextResponse }> {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > 20_000) return { response: json({ ok: false, reason: "bad_request" }, 413) };
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return { response: json({ ok: false, reason: "rate_limited" }, 429) };
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: json({ ok: false, reason: "bad_request" }, 400) };
  }
  const raw = body as { website?: unknown; startedAt?: unknown };
  if (typeof raw?.website === "string" && raw.website.length > 0) return { response: json({ ok: false, reason: "spam" }, 400) };
  if (typeof raw?.startedAt === "number" && Date.now() - raw.startedAt < MIN_FILL_MS) {
    return { response: json({ ok: false, reason: "spam" }, 400) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { response: json({ ok: false, reason: "invalid", errors: fieldErrors(parsed.error) }, 422) };
  return { data: parsed.data };
}
