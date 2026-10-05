import { useSite } from "../context/SiteContext.jsx";
import styles from "./Footer.module.css";
import TransitionLink from "./TransitionLink.jsx";
import { LinkedInLink } from "./LinkedInIcon.jsx";
import { usePageTransition } from "../context/PageTransitionContext.jsx";

export default function Footer() {
  const { site } = useSite();
  const { soundOn, setSoundOn } = usePageTransition();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <nav aria-label="Footer">
        <ul className={styles.links}>
          <li><TransitionLink className="link-underline" to="/imprint">Imprint</TransitionLink></li>
          <li><TransitionLink className="link-underline" to="/contact">Contact</TransitionLink></li>
          <li><LinkedInLink /></li>
          <li>
            {/* Optional TV hiss during page transitions. Off by default. */}
            <button
              type="button"
              className={styles.sound}
              aria-pressed={soundOn}
              onClick={() => setSoundOn(!soundOn)}
            >
              <span aria-hidden="true">{soundOn ? "🔊" : "🔈"}</span> Static FX
            </button>
          </li>
        </ul>
      </nav>
      <p className={styles.legal}>
        All rights reserved. By {site.name} © {year}. Made with ♥, React &amp; Node.js.
      </p>
    </footer>
  );
}
