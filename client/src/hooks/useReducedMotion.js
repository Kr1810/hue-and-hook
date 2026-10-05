import { useSyncExternalStore } from "react";

/**
 * true when the user asked the OS for reduced motion. Updates live if they
 * change the setting while the page is open.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Non-hook version for event handlers and effects. */
export const prefersReducedMotion = getSnapshot;
