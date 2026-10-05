import { LINKEDIN_URL } from "../config/contact.js";
import styles from "./LinkedInIcon.module.css";

/** LinkedIn "in" logo, 24×24, inherits the text color. Decorative by default. */
export default function LinkedInIcon({ size = 24, title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

/**
 * The site's only social link. Opens Krina's LinkedIn profile in a new tab.
 * `label` shows visible text next to the icon (e.g. on the Contact page).
 */
export function LinkedInLink({ label, className = "" }) {
  return (
    <a
      className={`${styles.link} ${className}`}
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? undefined : "Krina Suthar on LinkedIn"}
    >
      <LinkedInIcon />
      {label && <span>{label}</span>}
    </a>
  );
}
