/**
 * TV-static page-transition loader settings. Every timing and noise knob
 * lives here.
 */
import { isKnownRoute } from "../routes.js";

export const LOADER = {
  // Timeline (ms)
  flashMs: 40, // white "channel switch" frame at the start of ENTER
  enterMs: 180, // CRT warm-up: scaleY(0.005) → 1
  minHoldMs: 700, // full static, at least this long
  maxHoldMs: 4000, // hard cap: the loader can never get stuck
  exitMs: 300, // CRT power-off: 150ms → line, 100ms → dot, 50ms fade
  exitIntensity: 1.8, // brightness spike during EXIT (u_intensity > 1)

  // prefers-reduced-motion: one static frame, opacity fade only
  reduced: { fadeMs: 200, minHoldMs: 300, intensity: 0.45 },

  // Render targets (CSS scales them up with image-rendering: pixelated)
  width: 320,
  height: 180,
  fallbackWidth: 160,
  fallbackHeight: 90,

  // Signal noise (fragment shader + Canvas 2D fallback)
  noise: {
    static: 0.35, // per-pixel grain mix
    streaks: 0.16, // per-scanline brightness smear
    jitterChance: 0.08, // share of frames with a shifted slice
    jitterAmount: 0.02, // max sideways shift, fraction of width
    scanlines: 0.12,
    aberrationPx: 1.5, // red +x, blue −x
    vignette: 0.4, // edges ~40% darker
    flicker: 0.04, // ±4% global brightness
    saturation: 0.85,
    rollPeriod: 2.5, // seconds per rolling-band cycle
    fps: 24, // time is stepped like analog video
  },

  // Optional hiss (Web Audio, off by default)
  audio: { gain: 0.04, bandpassHz: 3200, q: 0.8 },
  audioStorageKey: "static-fx",
};

/** One channel per route. Sub-routes inherit their section's channel. */
export const CHANNELS = [
  { path: "/", channel: "CH 01 HOME", name: "Home" },
  { path: "/about", channel: "CH 02 ABOUT", name: "About" },
  { path: "/work", channel: "CH 03 WORK", name: "Work" },
  { path: "/experience", channel: "CH 04 EXPERIENCE", name: "Experience" },
  { path: "/contact", channel: "CH 05 CONTACT", name: "Contact" },
  { path: "/imprint", channel: "CH 06 IMPRINT", name: "Imprint" },
];

export const NOT_FOUND_CHANNEL = { path: null, channel: "CH 00 404", name: "Page not found" };

export function channelFor(pathname) {
  if (!isKnownRoute(pathname)) return NOT_FOUND_CHANNEL;
  return (
    CHANNELS.find((c) => c.path === pathname) ??
    CHANNELS.find((c) => c.path !== "/" && pathname.startsWith(`${c.path}/`)) ??
    NOT_FOUND_CHANNEL
  );
}
