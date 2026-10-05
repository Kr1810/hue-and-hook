import { prefersReducedMotion } from "../hooks/useReducedMotion.js";

/** "top ▲" link for the bottom of long pages. Smooth unless reduced motion. */
export default function BackToTop() {
  const toTop = (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    // Move keyboard focus back to the top as well.
    document.getElementById("top")?.focus({ preventScroll: true });
  };

  return (
    <p className="to-top-wrap">
      <a className="to-top link-underline" href="#top" onClick={toTop}>
        top <span aria-hidden="true">▲</span>
      </a>
    </p>
  );
}
