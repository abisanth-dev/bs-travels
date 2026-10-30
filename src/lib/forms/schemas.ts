import { z } from "zod";
import { appointmentModes, appointmentTimes, topicIds } from "./topics";

const name = z.string().trim().min(2, "Please enter your name.").max(80, "Please keep your name under 80 characters.");
const phone = z
  .string()
  .trim()
  .min(7, "Please enter a phone number we can call.")
  .max(25, "That phone number looks too long.")
  .regex(/^[+()\d\s-]+$/, "Use digits, spaces and + ( ) - only.");
const email = z.string().trim().max(120).email("Please enter a valid email address.");
const consent = z.literal(true, { error: "Please confirm you agree so we can contact you." });

/** Spam signals checked on the server: a hidden field and a minimum fill time. */
const antiSpam = {
  website: z.string().max(0).optional().default(""),
  startedAt: z.number().int().positive(),
};

export const enquirySchema = z.object({
  topic: z.enum(topicIds, { error: "Please choose what you need help with." }),
  destination: z.string().trim().max(80).optional().default(""),
  course: z.string().trim().max(40).optional().default(""),
  name,
  phone,
  email,
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(2000, "Please keep your message under 2000 characters."),
  consent,
  ...antiSpam,
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const appointmentSchema = z
  .object({
    service: z.enum(topicIds, { error: "Please choose a service." }),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
    preferredTime: z.enum(appointmentTimes.map((t) => t.id) as [string, ...string[]], { error: "Please choose a time." }),
    mode: z.enum(appointmentModes.map((m) => m.id) as [string, ...string[]], { error: "Please choose how to meet." }),
    name,
    phone,
    email,
    message: z.string().trim().max(2000, "Please keep your message under 2000 characters.").optional().default(""),
    consent,
    ...antiSpam,
  })
  .superRefine((v, ctx) => {
    const date = new Date(`${v.preferredDate}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Please choose a valid date." });
      return;
    }
    const today = new Date();
    const tomorrow = isoDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1)));
    if (v.preferredDate < tomorrow) {
      ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Please choose a date from tomorrow onwards." });
    }
    if (date.getUTCDay() === 0) {
      ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Our office is closed on Sundays. Please choose another day." });
    }
  });

export type AppointmentInput = z.input<typeof appointmentSchema>;
export type Appointment = z.output<typeof appointmentSchema>;

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const MIN_FILL_MS = 3000;
