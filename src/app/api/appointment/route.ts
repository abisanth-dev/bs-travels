import { deliver } from "@/lib/forms/deliver";
import { appointmentText } from "@/lib/forms/handoff";
import { json, readSubmission } from "@/lib/forms/route-helpers";
import { appointmentSchema } from "@/lib/forms/schemas";
import { topicLabel } from "@/lib/forms/topics";

export async function POST(req: Request) {
  const result = await readSubmission(req, appointmentSchema);
  if ("response" in result) return result.response;
  const { website, startedAt, consent, ...data } = result.data;
  void website, void startedAt, void consent; // checked already, not forwarded
  const sent = await deliver("appointment", {
    subject: `Appointment request: ${topicLabel(data.service)} on ${data.preferredDate} (${data.name})`,
    text: appointmentText(data),
    replyTo: data.email,
    data: { ...data, status: "requested, not confirmed" },
  });
  if (!sent.ok) return json({ ok: false, reason: sent.reason }, sent.reason === "not_configured" ? 503 : 502);
  return json({ ok: true }, 200);
}
