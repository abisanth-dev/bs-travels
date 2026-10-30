import { services } from "@/content/services";

/** Everything a visitor can enquire about: the seven services plus courses and general questions. */
export const enquiryTopics = [
  ...services.map((s) => ({ id: s.slug, label: s.name, asksDestination: s.asksDestination })),
  { id: "language-course", label: "Language Course", asksDestination: false },
  { id: "general", label: "Something else", asksDestination: true },
] as const;

export type EnquiryTopicId = (typeof enquiryTopics)[number]["id"];

export const topicIds = enquiryTopics.map((t) => t.id) as [EnquiryTopicId, ...EnquiryTopicId[]];

export function topicLabel(id: string) {
  return enquiryTopics.find((t) => t.id === id)?.label ?? id;
}

export const appointmentTimes = [
  { id: "morning", label: "Morning (9 AM to 12 PM)" },
  { id: "afternoon", label: "Afternoon (12 PM to 5 PM)" },
  { id: "any", label: "Any time that suits the team" },
] as const;

export const appointmentModes = [
  { id: "office", label: "In person at our Jaffna office" },
  { id: "phone", label: "Phone call" },
] as const;
