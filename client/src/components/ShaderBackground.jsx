import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { usePageTransition } from "../context/PageTransitionContext.jsx";
import { prefersReducedMotion, useReducedMotion } from "../hooks/useReducedMotion.js";
import { createRenderer, DPR_CAP } from "./shaders/renderer.js";

/**
 * Full-viewport WebGL background (raw WebGL, no Three.js).
 *
 * - Starts after the page has loaded and the main thread is idle, so it never
 *   competes with first render.
 * - Renders in a Web Worker via OffscreenCanvas when supported (compiling
 *   and drawing stay off the main thread); otherwise on the main thread.
 * - Colors come from the theme's CSS variables and lerp over 600ms.
 * - Pointer (eased), scroll, resize (ResizeObserver), tab visibility and
 *   reduced-motion changes are forwarded to the renderer.
 * - No WebGL → CSS radial-gradient fallback (.is-fallback in global.css).
 *
 * The canvas is created inside the effect, so React StrictMode's double
 * mount never tries to transfer the same canvas twice.
 */

function hexToRgb(value) {
  let hex = String(value).trim().replace(/^#/, "");
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  const int = parseInt(hex, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

function readColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    a: hexToRgb(styles.getPropertyValue("--bg")) || [0.12, 0.24, 1],
    b: hexToRgb(styles.getPropertyValue("--accent")) || [1, 0.88, 0.3],
  };
}

const readScroll = () => window.scrollY / Math.max(1, window.innerHeight);

export default function ShaderBackground({ full = false }) {
  const hostRef = useRef(null);
  const sendRef = useRef(null); // (type, value) => void, once running
  const [status, setStatus] = useState("idle"); // idle | ready | fallback
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  // Paused while the TV loader covers the screen (saves GPU).
  const { active: loaderActive } = usePageTransition();
  const loaderActiveRef = useRef(loaderActive);
  loaderActiveRef.current = loaderActive;

  useEffect(() => {
    const host = hostRef.current;
    let cancelled = false;
    const cleanups = [];

    const readSize = () => ({
      width: host.clientWidth || window.innerWidth,
      height: host.clientHeight || window.innerHeight,
      dpr: Math.min(window.devicePixelRatio || 1, DPR_CAP),
    });

    const markReady = () => !cancelled && setStatus("ready");
    const markFallback = () => !cancelled && setStatus("fallback");

    function start() {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      host.appendChild(canvas);
      cleanups.push(() => canvas.remove());

      const state = {
        ...readSize(),
        colors: readColors(),
        reduced: prefersReducedMotion(),
        hidden: document.hidden || loaderActiveRef.current,
        mouse: { x: 0.72, y: 0.62 },
        scroll: readScroll(),
      };

      /* ---- renderer: worker first, main thread as a fallback ---- */
      let send = null;
      if (typeof canvas.transferControlToOffscreen === "function" && typeof Worker === "function") {
        try {
          const worker = new Worker(new URL("./shaders/shader.worker.js", import.meta.url), {
            type: "module",
          });
          const offscreen = canvas.transferControlToOffscreen();
          worker.addEventListener("message", ({ data }) => {
            if (data.type === "ready") markReady();
            if (data.type === "fail") {
              markFallback();
              worker.terminate();
            }
          });
          worker.addEventListener("error", () => {
            markFallback();
            worker.terminate();
          });
          worker.postMessage({ type: "init", canvas: offscreen, state }, [offscreen]);
          send = (type, value) => worker.postMessage({ type, value });
          cleanups.push(() => worker.terminate());
        } catch {
          send = null;
        }
      }

      if (!send) {
        const renderer = createRenderer(canvas, state, { onReady: markReady, onFail: markFallback });
        if (!renderer) {
          markFallback();
          return;
        }
        send = (type, value) => renderer[type](value);
        cleanups.push(() => renderer.destroy());
      }
      sendRef.current = send;

      /* ---- inputs ---- */
      let pointer = null;
      let pointerQueued = false;
      const onPointer = (event) => {
        pointer = [event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight];
        if (pointerQueued) return;
        pointerQueued = true;
        requestAnimationFrame(() => {
          pointerQueued = false;
          send("mouse", pointer);
        });
      };
      const onScroll = () => send("scroll", readScroll());
      const onVisibility = () => send("hidden", document.hidden || loaderActiveRef.current);
      const resizeObserver = new ResizeObserver(() => send("size", readSize()));

      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      resizeObserver.observe(host);

      cleanups.push(() => {
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibility);
        resizeObserver.disconnect();
      });
    }

    /* ---- defer until loaded + idle ---- */
    let idleHandle = null;
    const schedule = () => {
      idleHandle =
        "requestIdleCallback" in window
          ? { id: window.requestIdleCallback(start, { timeout: 1500 }), idle: true }
          : { id: window.setTimeout(start, 200), idle: false };
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleHandle?.idle) window.cancelIdleCallback(idleHandle.id);
      else if (idleHandle) window.clearTimeout(idleHandle.id);
      cleanups.forEach((fn) => fn());
      sendRef.current = null;
    };
  }, []);

  // Theme changed → lerp to the new palette. (ThemeContext updates the
  // data-theme attribute before rendering, so the CSS variables are current.)
  useEffect(() => {
    sendRef.current?.("colors", readColors());
  }, [theme]);

  useEffect(() => {
    sendRef.current?.("reduced", reduced);
  }, [reduced]);

  useEffect(() => {
    sendRef.current?.("hidden", document.hidden || loaderActive);
  }, [loaderActive]);

  const className = ["shader", status === "ready" && "is-ready", status === "fallback" && "is-fallback"]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ "--shader-opacity": full ? 1 : 0.25 }}
      aria-hidden="true"
    />
  );
}
