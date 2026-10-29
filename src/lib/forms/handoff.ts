import { getCourse } from "@/content/courses";
import { getDestination } from "@/content/destinations";
import { mailHref, site, whatsappHref } from "@/content/site";
import { appointmentModes, appointmentTimes, topicLabel } from "./topics";

type EnquiryLike = { topic: string; destination?: string; course?: string; name: string; phone: string; email: string; message: string };
type AppointmentLike = {
  service: string;
  preferredDate: string;
  preferredTime: string;
  mode: string;
  name: string;
  phone: string;
  email: string;
  message?: string;
};

function destinationLabel(v?: string) {
  if (!v) return "";
  return getDestination(v)?.name ?? v;
}

export function enquiryText(e: EnquiryLike) {
  const details = [
    `Service: ${topicLabel(e.topic)}`,
    e.course ? `Course: ${getCourse(e.course)?.name ?? e.course}` : null,
    e.destination ? `Destination: ${destinationLabel(e.destination)}` : null,
    `Name: ${e.name}`,
    `Phone: ${e.phone}`,
    `Email: ${e.email}`,
  ].filter(Boolean);
  return ["Hello BS Travels, I would like to make an enquiry.", "", ...details, "", e.message].join("\n");
}

export function appointmentText(a: AppointmentLike) {
  const time = appointmentTimes.find((t) => t.id === a.preferredTime)?.label ?? a.preferredTime;
  const mode = appointmentModes.find((m) => m.id === a.mode)?.label ?? a.mode;
  return [
    "Hello BS Travels, I would like to request an appointment.",
    "",
    `Service: ${topicLabel(a.service)}`,
    `Preferred date: ${a.preferredDate}`,
    `Preferred time: ${time}`,
    `Meeting: ${mode}`,
    `Name: ${a.name}`,
    `Phone: ${a.phone}`,
    `Email: ${a.email}`,
    ...(a.message ? ["", a.message] : []),
    "",
    "I understand this is a request and the team will confirm the time.",
  ].join("\n");
}

export function handoffLinks(subject: string, text: string) {
  return {
    whatsapp: whatsappHref(text),
    email: mailHref(site.email.primary, subject, text),
  };
}
