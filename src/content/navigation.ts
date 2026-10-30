export type NavLink = { href: string; label: string };

export const primaryNav: NavLink[] = [
  { href: "/services", label: "Services" },
  { href: "/destinations", label: "Destinations" },
  { href: "/courses", label: "Courses" },
  { href: "/checklists", label: "Checklists" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const secondaryNav: NavLink[] = [
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/careers", label: "Careers" },
  { href: "/appointment", label: "Request an Appointment" },
];
