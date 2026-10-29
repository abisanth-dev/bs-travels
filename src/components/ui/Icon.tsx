import type { SVGProps } from "react";

/**
 * Line icons drawn for BS Travels on a 24px grid with a 1.5 stroke.
 * Decorative by default; pass `title` to expose one to assistive tech.
 */
const paths = {
  passport: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M8.8 10h6.4M12 6.8c1 1 1.4 2 1.4 3.2s-.4 2.2-1.4 3.2c-1-1-1.4-2-1.4-3.2s.4-2.2 1.4-3.2M9 16.5h6" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1a2 2 0 0 1 0-4 2 2 0 0 1 0-4V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z" />
      <path d="M15 6v12" strokeDasharray="1.5 2" />
      <path d="m6.5 12.5 3-1.5 2 .5-1.5-2 1-.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </>
  ),
  translate: (
    <>
      <path d="M4 5h9M8.5 3v2M6 5c.6 3 2.6 5.4 5 6.5M11 5c-.6 3-2.8 5.6-6 7" />
      <path d="m12 21 4-9 4 9M13.4 18h5.2" />
    </>
  ),
  map: (
    <>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </>
  ),
  stamp: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 2.5v3M16 2.5v3" />
      <path d="m9 14.5 2 2 4-4.5" />
    </>
  ),
  parcel: (
    <>
      <path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9z" />
      <path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9M7.8 5.3l8.5 4.5" />
    </>
  ),
  luggage: (
    <>
      <rect x="6" y="7" width="12" height="13" rx="2" />
      <path d="M9.5 7V4.5h5V7M10 11v5M14 11v5M8.5 20v1.5M15.5 20v1.5" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M8.5 12.5h7M8.5 16h5" />
    </>
  ),
  phone: (
    <path d="M5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 7.7 7.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.7 2 2 0 0 1 5 3.5" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20.5 5.3 16A8.5 8.5 0 1 1 8.4 19z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 0 1-2.4-2.4l.9-1-1-2z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  plane: (
    <path d="M21 4.5c-.6-.6-1.8-.5-2.6.3L15 8.2 6.4 6 4.7 7.7l7 3.7-3.1 3.1-2.5-.4-1.3 1.3 3.2 1.6 1.6 3.2 1.3-1.3-.4-2.5 3.1-3.1 3.7 7 1.7-1.7-2.2-8.6 3.4-3.4c.8-.8.9-2 .3-2.6" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3" />
    </>
  ),
  "arrow-right": <path d="M4 12h16m-6-6 6 6-6 6" />,
  "arrow-up-right": <path d="M7 17 17 7M8 7h9v9" />,
  "arrow-left": <path d="M20 12H4m6-6-6 6 6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  print: (
    <>
      <path d="M7 9V3.5h10V9M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" rx="1" />
    </>
  ),
  reset: <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />,
  facebook: <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a20 20 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4V10.5H8.8v3h2.6V21" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5v.5" />
    </>
  ),
  sparkle: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7" />,
} as const;

export type IconName = keyof typeof paths;

type Props = SVGProps<SVGSVGElement> & { name: IconName; title?: string; size?: number };

export function Icon({ name, title, size = 20, strokeWidth = 1.5, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
