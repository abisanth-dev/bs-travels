import { deliver } from "@/lib/forms/deliver";
import { enquiryText } from "@/lib/forms/handoff";
import { json, readSubmission } from "@/lib/forms/route-helpers";
import { enquirySchema } from "@/lib/forms/schemas";
import { topicLabel } from "@/lib/forms/topics";

export async function POST(req: Request) {
  const result = await readSubmission(req, enquirySchema);
  if ("response" in result) return result.response;
  const { website, startedAt, consent, ...data } = result.data;
  void website, void startedAt, void consent; // checked already, not forwarded
  const sent = await deliver("enquiry", {
    subject: `Website enquiry: ${topicLabel(data.topic)} (${data.name})`,
    text: enquiryText(data),
    replyTo: data.email,
    data,
  });
  if (!sent.ok) return json({ ok: false, reason: sent.reason }, sent.reason === "not_configured" ? 503 : 502);
  return json({ ok: true }, 200);
}
