import { useSite } from "../context/SiteContext.jsx";
import styles from "./Footer.module.css";
import TransitionLink from "./TransitionLink.jsx";
import { LINKEDIN_URL } from "../config/contact.js";

export default function Footer() {
  const { site } = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <nav aria-label="Footer">
        <ul className={styles.links}>
          <li><TransitionLink className="link-underline" to="/contact">Contact</TransitionLink></li>
          <li>
            <a className="link-underline" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
        </ul>
      </nav>
      <p className={styles.legal}>
        All rights reserved. By {site.name} © {year}. Made with ♥.
      </p>
    </footer>
  );
}
