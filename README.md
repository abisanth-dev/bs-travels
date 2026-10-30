# BS Travels website

The website for BS Travels (Private) Limited, #338 Navalar Road, Jaffna, Sri Lanka.

Built with Next.js (App Router, TypeScript), Tailwind CSS 4, React Three Fiber + Drei, and GSAP ScrollTrigger.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` and fill in what you need. Without any form provider the site still works: enquiries and appointment requests are handed off to WhatsApp or email, prefilled, and clearly labelled as not yet sent.

## Forms

`/enquire`, `/contact` and `/appointment` post to `/api/enquiry` and `/api/appointment`. The server validates with zod, checks a honeypot field, a minimum fill time and a per-instance rate limit, then delivers through one provider:

| `FORM_PROVIDER` | Required variables |
|---|---|
| `resend` | `RESEND_API_KEY`, `FORM_TO_EMAIL`, `FORM_FROM_EMAIL` (a sender on a domain verified in Resend) |
| `webhook` | `FORM_WEBHOOK_URL`, optional `FORM_WEBHOOK_TOKEN` (sent as a Bearer token) |

The browser only shows a success message when the provider accepted the data. With no provider the API answers `503 not_configured` and the UI offers the handoff. Personal data is never logged. Static pages read the configuration at build time, so redeploy after changing these variables.

Appointment requests are requests only. Nothing in the site confirms a time.

## Content

All content is typed and lives in `src/content/` (business settings, services, destinations, courses, checklists, FAQs, articles, navigation), ready to be swapped for a CMS later.

- **Logo:** set `site.brand.logo` in `src/content/site.ts` once the original file is in `public/brand/`. A text wordmark is used until then.
- **Palette:** accent colours in `src/app/globals.css` are provisional until the logo can be inspected.
- **Director portrait:** set `site.managingDirector.portrait` only with a genuine photo.
- **Images:** destination, article and about images in `public/images/` are generated placeholders (`node scripts/art/render.cjs`). Replace any file with a licensed photo of the same name, or set `image` on a destination.
- **Hero poster:** `public/images/hero/poster.jpg` is a still of the 3D scene, shown while 3D loads and to visitors who get no 3D.
- **Globe:** `public/globe/land-points.json` and `public/images/globe/static.png` come from `scripts/generate-land-points.py` and `scripts/generate-static-globe.py`.
- **Articles:** the two 2023 posts have status `archive-review`. They show an archive notice, are `noindex`, and stay out of the sitemap until set to `published`.

## 3D and motion

The homepage is twelve sections, each with its own scene, drawn by one lazily loaded WebGL canvas (`src/components/three/Stage.tsx`) into each section's DOM slot with Drei `View`. A scene mounts only when its section is within about a screen of the viewport and unmounts (freeing GPU memory) once far away; the canvas stops drawing when nothing is on screen or the tab is hidden.

- Scenes: `src/components/three/scenes/` plus `HeroScene`, `GlobeScene` and `FinaleScene`.
- Shared timing (entrances, exits, reframing, swaps): `src/components/three/choreo.ts`.
- HTML controls drive scenes through `src/components/home/sceneState.ts`; all text, forms and buttons stay in HTML.
- GSAP ScrollTrigger is the only scroll system; it writes each section's progress for the scenes.

Visitors with reduced motion, data saver or no WebGL see stills captured from each scene (`public/images/scenes/poster-*.webp`, regenerate with `scripts/capture-scene-posters.cjs`); phones and modest hardware get lighter scenes. Force a tier with `?3d=off`, `?3d=low` or `?3d=high`. Asset sources are listed in `ASSETS.md`.

## Old URLs

`next.config.ts` maps the old WordPress URLs with 301 redirects, including `/appionment/` to `/appointment`. Theme demo pages (portfolio, case studies, shop, shortcode) are not carried over and return 404.
