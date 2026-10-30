export type Faq = {
  id: string;
  question: string;
  answer: string;
  topic: "general" | "visas" | "travel" | "documents";
};

/**
 * Questions are taken from the existing FAQ page. Answers are rewritten
 * from the supplied content without adding new commitments.
 */
export const faqs: Faq[] = [
  {
    id: "services",
    topic: "general",
    question: "What services does BS Travels offer?",
    answer:
      "We offer visa consultancy, air ticketing, immigration support, sworn translation, tour packages, visa extension support and an international courier service. We also offer Spanish, Dutch, French and IELTS language courses.",
  },
  {
    id: "how-to-start",
    topic: "general",
    question: "How can I use your services?",
    answer:
      "Contact our team by phone, WhatsApp or email, send an enquiry through this website, or visit our office in Jaffna. We will talk through what you need, explain the process and give you a quote.",
  },
  {
    id: "visa-consultancy",
    topic: "visas",
    question: "What does the Visa Consultancy service involve?",
    answer:
      "We help you prepare your visa application. That includes organising your paperwork, preparing for an interview where one is needed, and explaining the visa types and requirements that apply to your trip.",
  },
  {
    id: "visa-timing",
    topic: "visas",
    question: "How long does the visa process take?",
    answer:
      "It depends on the type of visa and the country you are applying to, and the final decision always rests with the relevant authorities. We work as efficiently as we can on our side and keep you informed along the way.",
  },
  {
    id: "immigration",
    topic: "visas",
    question: "What does the Immigration Service include?",
    answer:
      "We support applications for work permits, permanent residency and citizenship abroad, helping you understand the process and prepare your documents.",
  },
  {
    id: "air-ticketing",
    topic: "travel",
    question: "How does the Air Ticketing service work?",
    answer:
      "Tell us where and when you want to travel. We look for suitable routes and fares, make the booking for you, and help with changes or cancellations later if your plans change.",
  },
  {
    id: "tours",
    topic: "travel",
    question: "What are your tour packages?",
    answer:
      "Our tour packages are planned itineraries that can include accommodation, sightseeing and activities, in a range of styles and budgets. Each one is planned with you, so contact us with your destination and dates.",
  },
  {
    id: "courier",
    topic: "documents",
    question: "What is the International Courier Service?",
    answer:
      "It is our service for sending documents and packages overseas, with the focus on safe, on-time delivery.",
  },
  {
    id: "translation",
    topic: "documents",
    question: "What is the Sworn Translation service?",
    answer:
      "We translate official documents between Tamil or Sinhala and English. Each translation is certified by a sworn translator so that it can be used for official purposes.",
  },
  {
    id: "translators-certified",
    topic: "documents",
    question: "Are your translators certified?",
    answer:
      "Yes. Our translators are certified and experienced with official documents in Tamil, Sinhala and English.",
  },
];

export function getFaqs(ids: string[]) {
  return ids.map((id) => faqs.find((f) => f.id === id)).filter((f): f is Faq => Boolean(f));
}
