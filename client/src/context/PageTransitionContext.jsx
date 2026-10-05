import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LOADER, channelFor } from "../config/loader.js";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { readStaticEnabled, saveStaticEnabled } from "../components/loader/staticAudio.js";

/**
 * Page-transition state machine for the TV loader.
 *
 *   idle ──navigateWithTransition──▶ enter ─(screen covered: navigate)─▶ hold
 *   hold ─(min hold passed AND page ready, or 4s cap)─▶ exit ──▶ idle
 *
 * - Links: ENTER plays over the old page; navigate() only runs once the
 *   screen is fully covered, so the old page never swaps visibly.
 * - Back/forward or any navigation that bypassed us: a hard cut straight
 *   to HOLD, applied in a layout effect so it covers the new page before paint.
 * - Readiness is keyed by pathname: a page calls markReady(itsPathname), so
 *   a late signal from the old page can never release the loader early.
 * - Scrolling happens while covered; after EXIT focus moves to the new <h1>.
 * - First load runs the same sequence for the landing route.
 */
const PageTransitionContext = createContext(null);

function timingFor(reduced) {
  return reduced
    ? { enter: LOADER.reduced.fadeMs, minHold: LOADER.reduced.minHoldMs, exit: LOADER.reduced.fadeMs }
    : { enter: LOADER.enterMs, minHold: LOADER.minHoldMs, exit: LOADER.exitMs };
}

/** Put the new page in place while covered. Returns a hash target, if any. */
function settleScroll() {
  const { hash } = window.location;
  if (hash) {
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) {
      el.scrollIntoView({ behavior: "instant", block: "start" });
      return el;
    }
  }
  window.scrollTo({ top: 0, behavior: "instant" });
  return null;
}

/** Move focus to the new page's heading (or the hash target) for screen readers. */
function focusNewPage(target) {
  const el = target || document.querySelector("main h1") || document.querySelector("h1");
  if (!el) return;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

export function PageTransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();

  const [state, setState] = useState(() => ({
    phase: "enter",
    seed: Math.random(),
    ...channelFor(location.pathname),
  }));
  const [soundOn, setSoundOnState] = useState(readStaticEnabled);

  // Mutable machine state (timers fire outside React's render cycle).
  const phaseRef = useRef("enter");
  const timers = useRef({});
  const targetRef = useRef(location.pathname);
  const readyRef = useRef(null);
  const minDoneRef = useRef(false);
  const internalNavRef = useRef(null);
  const lastPathRef = useRef(location.pathname);
  const firstLoadRef = useRef(true);
  const navigateRef = useRef(navigate);
  const reducedRef = useRef(reduced);
  navigateRef.current = navigate;
  reducedRef.current = reduced;

  // The machine is built once; it only touches refs + the state setter.
  const machine = useRef(null);
  if (!machine.current) {
    const setPhase = (phase, extra) => {
      phaseRef.current = phase;
      setState((s) => ({ ...s, ...extra, phase }));
    };
    const clear = () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
    const exit = () => {
      if (phaseRef.current !== "hold") return;
      clearTimeout(timers.current.min);
      clearTimeout(timers.current.max);
      const target = settleScroll();
      setPhase("exit");
      timers.current.exit = setTimeout(() => {
        setPhase("idle");
        if (!firstLoadRef.current) focusNewPage(target);
        firstLoadRef.current = false;
      }, timingFor(reducedRef.current).exit);
    };
    const maybeExit = () => {
      if (phaseRef.current === "hold" && minDoneRef.current && readyRef.current === targetRef.current) exit();
    };
    const beginHold = () => {
      window.scrollTo({ top: 0, behavior: "instant" }); // covered: never a visible jump
      timers.current.min = setTimeout(() => {
        minDoneRef.current = true;
        maybeExit();
      }, timingFor(reducedRef.current).minHold);
      timers.current.max = setTimeout(exit, LOADER.maxHoldMs);
      maybeExit();
    };
    /** kind: "first" | "link" | "cut" */
    const start = (kind, pathname, to) => {
      clear();
      targetRef.current = pathname;
      readyRef.current = null;
      minDoneRef.current = false;
      const extra = { ...channelFor(pathname), seed: Math.random() };

      if (kind === "cut") {
        setPhase("hold", extra);
        beginHold();
        return;
      }
      setPhase("enter", extra);
      timers.current.enter = setTimeout(() => {
        if (to) {
          internalNavRef.current = pathname;
          navigateRef.current(to);
        }
        setPhase("hold");
        beginHold();
      }, timingFor(reducedRef.current).enter);
    };

    machine.current = { start, clear, maybeExit };
  }

  // First load: same sequence, landing route's channel.
  useEffect(() => {
    machine.current.start("first", window.location.pathname);
    return machine.current.clear; // StrictMode remount restarts cleanly
  }, []);

  // Scroll positions are managed here, not by the browser's restoration.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // Back/forward or navigation that bypassed navigateWithTransition → hard cut.
  useLayoutEffect(() => {
    const { pathname } = location;
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;
    if (internalNavRef.current === pathname) {
      internalNavRef.current = null;
      return;
    }
    machine.current.start("cut", pathname);
  }, [location]);

  const navigateWithTransition = useCallback((to) => {
    if (phaseRef.current !== "idle") return false; // ignore clicks mid-transition
    const url = new URL(to, window.location.href);
    if (url.pathname === window.location.pathname) {
      navigateRef.current(to);
      return true;
    }
    machine.current.start("link", url.pathname, `${url.pathname}${url.search}${url.hash}`);
    return true;
  }, []);

  const markReady = useCallback((pathname) => {
    readyRef.current = pathname;
    machine.current.maybeExit();
  }, []);

  const setSoundOn = useCallback((on) => {
    saveStaticEnabled(on);
    setSoundOnState(on);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      reduced,
      active: state.phase !== "idle",
      navigateWithTransition,
      markReady,
      soundOn,
      setSoundOn,
    }),
    [state, reduced, navigateWithTransition, markReady, soundOn, setSoundOn]
  );

  return <PageTransitionContext.Provider value={value}>{children}</PageTransitionContext.Provider>;
}

const NOOP = {
  phase: "idle",
  active: false,
  navigateWithTransition: () => false,
  markReady: () => {},
  soundOn: false,
  setSoundOn: () => {},
};

export function usePageTransition() {
  return useContext(PageTransitionContext) ?? NOOP;
}
