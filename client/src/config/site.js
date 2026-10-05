/**
 * Fallback site config, used until /api/site responds (and if it fails).
 * The source of truth is server/data/site.json. Change things there and
 * keep this in sync so the first paint shows the right name and role.
 *
 * Email and phone are deliberately NOT here: they're assembled at runtime
 * from parts in config/contact.js (light scraping protection).
 */
export const siteFallback = {
  name: "Krina Suthar",
  role: "Graphic designer",
  tagline: "I design brand identities, packaging and visuals that make people stop scrolling and start remembering.",
  description:
    "Krina Suthar is a graphic designer in Ahmedabad, India, creating brand identities, packaging, social creatives, print, illustration, UI visuals and motion graphics.",
  location: "Ahmedabad, Gujarat, India",
  status: "Available for freelance & full-time roles",
  experience: "1.5 years",
  linkedin: "https://www.linkedin.com/in/krina-suthar-510537226",
  currently: "",
  services: [],
  tools: [],
  siteUrl: "",
};

/** Theme ids must match the [data-theme] blocks in styles/global.css. */
export const THEMES = [
  { id: "electric", label: "Electric" },
  { id: "ultraviolet", label: "Ultraviolet" },
  { id: "hotpink", label: "Hot pink" },
  { id: "ink", label: "Ink" },
];

export const DEFAULT_THEME = "electric";
