import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../hooks/useReducedMotion.js";

/**
 * A small "View →" pill that trails the mouse over any element with
 * [data-cursor] (work cards). Desktop / fine pointers only. Animated with
 * requestAnimationFrame and only while it's moving. Purely visual.
 */
const OFFSET = 18; // px down-right of the pointer

export default function CursorPill() {
  const [enabled, setEnabled] = useState(false);
  const pillRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const pill = pillRef.current;
    const pos = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let target = null;

    const place = () => {
      pill.style.transform = `translate3d(${pos.x + OFFSET}px, ${pos.y + OFFSET}px, 0)`;
    };

    const tick = () => {
      const ease = prefersReducedMotion() ? 1 : 0.22;
      pos.x += (pos.tx - pos.x) * ease;
      pos.y += (pos.ty - pos.y) * ease;
      place();
      const settled = Math.abs(pos.tx - pos.x) < 0.1 && Math.abs(pos.ty - pos.y) < 0.1;
      raf = target || !settled ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (event) => {
      pos.tx = event.clientX;
      pos.ty = event.clientY;

      // Event delegation: works for cards rendered at any time.
      const hit = event.target instanceof Element ? event.target.closest("[data-cursor]") : null;
      if (hit !== target) {
        if (hit && !target) {
          // Appear right at the pointer instead of flying in from the corner.
          pos.x = pos.tx;
          pos.y = pos.ty;
          place();
        }
        target = hit;
        pill.textContent = hit?.dataset.cursor || "View →";
        pill.classList.toggle("is-visible", Boolean(hit));
      }
      if (target && !raf) raf = requestAnimationFrame(tick);
    };

    const onLeaveWindow = () => {
      target = null;
      pill.classList.remove("is-visible");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={pillRef} className="cursor-pill" aria-hidden="true" />;
}
