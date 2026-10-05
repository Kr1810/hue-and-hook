# Krina Suthar: graphic designer portfolio

A type-first portfolio for Krina Suthar, a graphic designer in Ahmedabad. It has a huge animated name, a raw-WebGL liquid shader behind everything, four switchable color themes, a TV-static page transition, and a small Express API for content and the contact form.

- **client/** is React 18 + Vite, with React Router 6, framer-motion, react-helmet-async, react-markdown and plain CSS (a global stylesheet + CSS Modules).
- **server/** is Node 20+ and Express 5, with helmet, CORS, rate limiting, zod validation, and JSON + Markdown files as storage.

Pages: **Home · About · Work (+ case studies) · Experience · Contact**, plus Imprint and a 404.

## Quick start

```bash
npm install          # installs both workspaces
cp .env.example .env # optional, every value has a default
npm run dev          # API on :5000 + Vite on :5173 → open http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs the Express API (`node --watch`) and Vite together. Vite proxies `/api` to `:5000`. |
| `npm run build` | Builds the client into `client/dist`. |
| `npm start` | Runs Express in production mode, serving the API and `client/dist` with an SPA fallback. Unknown URLs get the 404 page with a real `404` status. |
| `npm run lint` | Runs ESLint on both workspaces. |

## Make it yours

### Identity, services, tools → `server/data/site.json`

This holds the name, role ("Graphic designer"), tagline, location, availability status, experience, email, phone, LinkedIn URL, "currently" line, services and tools. It's served at `GET /api/site` and drives the header, page titles (`"work - Krina Suthar [Graphic designer]"`), Open Graph tags and the About page.

`client/src/config/site.js` holds a **fallback** copy that's shown before the API answers, so keep `name`, `role` and `tagline` in sync.

### Contact details → `client/src/config/contact.js`

The email and phone are stored **in parts** and joined in the browser after the page mounts (light protection against scrapers). If you change them, update:

1. `EMAIL_PARTS` / `PHONE_PARTS` in `client/src/config/contact.js`,
2. the plain-text `<noscript>` fallback in `client/index.html`,
3. `email` / `phone` in `server/data/site.json`.

LinkedIn is the only social link: `LINKEDIN_URL` in the same file, rendered by `components/LinkedInIcon.jsx`.

### Experience & education → `server/data/experience.json`

Served at `GET /api/experience` as `{ experience, education }`. Each job has `title, type, company, location, workMode, start, end, highlights[], tags[]`, listed newest first. The timeline alternates right/left automatically. The education entry contains **placeholders**, so replace the bracketed values.

### Résumé PDF → `client/public/Krina_Suthar_AI_UIUX_Designer.pdf`

The "Download résumé" button on the Experience page links to `/Krina_Suthar_AI_UIUX_Designer.pdf`. To update the résumé, replace that file. If you change the file name, also update the link in `client/src/pages/Experience.jsx`. Then rebuild: Vite copies everything in `client/public/` to the site root.

### Case studies → `server/data/work/*.md`

These are Markdown files with front matter: `title, client, category, year, date (used for ordering), role, tools[], cover, coverAlt, colors[] (palette hex values), summary, results[], learnings[]`. The body uses the sections **Overview, Challenge, Concept, Design process, Final outcome**; Results and What I learned are rendered from front matter. Covers live in `client/src/assets/img/` and are referenced by file name. They're SVG placeholders for now, so replace them with real project images.

### Colors → `client/src/styles/global.css`

Section **2. Themes** defines each theme's `--bg`, `--fg`, `--accent` and the rest. The shader reads them automatically. The Experience timeline cards intentionally keep a fixed cream style in every theme.

### Transition loader channels → `client/src/config/loader.js`

`CH 01 HOME`, `CH 02 ABOUT`, `CH 03 WORK`, `CH 04 EXPERIENCE`, `CH 05 CONTACT`, `CH 06 IMPRINT`, `CH 00 404`. Timings and noise settings live there too.

## API

All routes return JSON. Errors always look like `{ "error": { "message", "details?" } }`, and stack traces are never sent in production.

| Method | Route | Notes |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/site` | Site config + `siteUrl` |
| GET | `/api/work`, `/api/work/:slug` | List / full case study with `prev` & `next` |
| GET | `/api/experience` | `{ experience: [...], education: [...] }` |
| POST | `/api/contact` | `{ name, email, projectType, budget, timeline?, message }`, appended to `data/inquiries.json`. Limit: 10 per 15 min per IP. |

`projectType` is one of: Brand identity, UI/UX, Packaging, Social media, Print, Illustration, Motion, Other. `budget` is one of: < ₹25k, ₹25k–75k, ₹75k–1.5L, ₹1.5L+. The client and server validate the same rules (`client/src/lib/validate.js` ↔ `server/src/validation/schemas.js`).

The form has a hidden honeypot field (`website`). Inquiries are stored and logged; see the `TODO(email)` in `server/src/routes/contact.js` to add email notifications.

## How the fancy bits work

- **Shader** (`components/ShaderBackground.jsx` + `components/shaders/`): raw WebGL rendering domain-warped fbm noise in a Web Worker (OffscreenCanvas), at full strength on Home and the 404 page, and 25% elsewhere. It pauses while the TV loader is visible.
- **TV loader** (`components/loader/`, `context/PageTransitionContext.jsx`): a test pattern with static plays on first load and every route change. Links go through `<TransitionLink>`, and each page calls `usePageReady()` so the static holds until its data has loaded.
- **Experience timeline** (`pages/Experience.jsx` + `.module.css`): a centred line with a scroll-progress fill (rAF-throttled scroll listener → `scaleY`) and alternating cards. Below 900px it becomes a single column with the line on the left.
- **Reduced motion** turns off reveals, the marquee, the status-pill pulse, the letter animation and the shader animation. The loader becomes a simple fade.

## Deploying

```bash
npm ci && npm run build && npm start
```

Set `SITE_URL` to your real domain (it's used for canonical URLs and Open Graph). Behind a proxy, also set `TRUST_PROXY=1`. `server/data/inquiries.json` must be writable and persistent. The production server sends a strict Content-Security-Policy and hashes the inline script in `client/dist/index.html` at startup, so rebuild and restart after editing it.
