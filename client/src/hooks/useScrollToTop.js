import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "./useReducedMotion.js";

/**
 * Same-page #hash navigation (e.g. the About page's "Let's work together"
 * button → #contact): smooth-scroll to the target and focus it.
 *
 * Route changes are handled by the TV loader (PageTransitionContext): it
 * scrolls to the top (or to a hash target) while the screen is covered and
 * focuses the new page's <h1> afterwards.
 */
export function useScrollToTop() {
  const { pathname, hash } = useLocation();
  const previous = useRef({ pathname, hash });

  useEffect(() => {
    const prev = previous.current;
    previous.current = { pathname, hash };
    if (prev.pathname !== pathname || !hash || hash === prev.hash) return;

    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    // "instant", not "auto": auto would inherit html { scroll-behavior: smooth }.
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth", block: "start" });
    if (el.hasAttribute("tabindex")) el.focus({ preventScroll: true });
  }, [pathname, hash]);
}
