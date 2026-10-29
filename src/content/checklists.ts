/**
 * Document checklists from BS Travels' existing reference material.
 * These are company reference lists, not verified current government
 * requirements. Countries with no supplied items show a contact prompt.
 */
export type ChecklistGroup = {
  id: string;
  title: string;
  description?: string;
  items: string[];
};

export type ChecklistVariant = {
  id: string;
  title: string;
  description?: string;
  groups: ChecklistGroup[];
};

export type Checklist = {
  slug: string;
  /** Destination slug in content/destinations.ts */
  destination: string;
  title: string;
  /** Empty when the business has not supplied a list yet. */
  variants: ChecklistVariant[];
  /** Visa types named in the source material without document lists. */
  typesWithoutDocuments?: { title: string; types: string[] }[];
};

const commonApplicant = [
  "Valid passport",
  "Birth and marriage certificates",
  "Letter of good standing and proof of residence",
  "Bank balance confirmation and 3 months of statements",
  "Employment documents: leave approval, 3 months of payslips, EPF/ETF records, pension letter",
  "Property deed or rental agreement",
  "Birth certificates of children and spouse, current status and proof",
];

export const checklists: Checklist[] = [
  {
    slug: "canada",
    destination: "canada",
    title: "Canada Visitor Visa",
    variants: [
      {
        id: "visitor",
        title: "Visitor visa",
        groups: [
          { id: "applicant", title: "Applicant", items: commonApplicant },
          {
            id: "sponsor",
            title: "Sponsor",
            description: "If someone in Canada is inviting or supporting you.",
            items: [
              "Letter of invitation",
              "Passport and ID copy",
              "Birth and marriage certificates",
              "House deeds or agreement",
              "Bank statements for the last 3 months",
              "Salary slips for the last 3 months",
              "Employment confirmation",
              "Proof of the event",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "united-kingdom",
    destination: "united-kingdom",
    title: "UK Tourist Visa",
    variants: [
      {
        id: "tourist",
        title: "Tourist visa",
        groups: [
          { id: "applicant", title: "Applicant", items: commonApplicant },
          {
            id: "sponsor",
            title: "Sponsor",
            description: "If someone in the UK is supporting your visit.",
            items: [
              "Sponsor letter",
              "Passport and ID copy",
              "Birth and marriage certificates",
              "House deeds or agreement",
              "Bank statements for the last 3 months",
              "Salary slips for the last 3 months",
              "Work letter",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "india",
    destination: "india",
    title: "Indian Visa",
    variants: [
      {
        id: "general",
        title: "General documents",
        groups: [
          {
            id: "applicant",
            title: "Applicant",
            items: [
              "Valid passport",
              "Two 2x2 photos with a white background",
              "Copy of birth certificate",
              "Copy of NIC",
              "Updated personal bank passbook with a minimum balance of LKR 100,000",
            ],
          },
        ],
      },
    ],
    typesWithoutDocuments: [
      { title: "Sticker visa", types: ["3-month visa", "6-month double-entry visa", "Medical visa"] },
      { title: "E-visa", types: ["1-month single entry", "1-year multiple entry"] },
    ],
  },
  {
    slug: "thailand",
    destination: "thailand",
    title: "Thailand Visa",
    variants: [
      {
        id: "tourist",
        title: "Tourist visa",
        description: "3-month single entry or 6-month multiple entry.",
        groups: [
          {
            id: "applicant",
            title: "Applicant",
            items: [
              "Valid passport",
              "Two passport-size photos with a white background",
              "Employment leave approval confirmation",
              "Financial statements",
              "Hotel reservation",
            ],
          },
        ],
      },
      {
        id: "business",
        title: "Business visa",
        groups: [
          {
            id: "applicant",
            title: "Applicant",
            items: [
              "Valid passport",
              "Two passport-size photos with a white background",
              "Business invitation from Thailand",
              "Business or company registration certificate",
              "Financial statements",
              "Hotel reservation",
            ],
          },
        ],
      },
    ],
  },
  { slug: "malaysia", destination: "malaysia", title: "Malaysia Visa", variants: [] },
  { slug: "dubai-uae", destination: "dubai-uae", title: "Dubai, UAE Visa", variants: [] },
  { slug: "qatar", destination: "qatar", title: "Qatar Visa", variants: [] },
  { slug: "china", destination: "china", title: "China Visa", variants: [] },
  { slug: "japan", destination: "japan", title: "Japan Visa", variants: [] },
  { slug: "vietnam", destination: "vietnam", title: "Vietnam Visa", variants: [] },
  { slug: "nepal", destination: "nepal", title: "Nepal Visa", variants: [] },
  { slug: "indonesia", destination: "indonesia", title: "Indonesia Visa", variants: [] },
];

export const checklistNotice =
  "This list comes from BS Travels' own reference material to help you prepare. It is not an official government checklist. Requirements change and depend on your circumstances, so please confirm the current requirements with our team before you apply.";

export function getChecklist(slug: string) {
  return checklists.find((c) => c.slug === slug);
}

export function checklistItemCount(c: Checklist) {
  return c.variants.reduce((n, v) => n + v.groups.reduce((m, g) => m + g.items.length, 0), 0);
}
