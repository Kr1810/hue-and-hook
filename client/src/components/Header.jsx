import { useLocation } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import SplitName from "./SplitName.jsx";
import Marquee from "./Marquee.jsx";
import { useSite } from "../context/SiteContext.jsx";
import styles from "./Header.module.css";
import TransitionLink from "./TransitionLink.jsx";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/work", label: "Work" },
  { to: "/experience", label: "Experience" },
  { to: "/contact", label: "Contact" },
];

/**
 * Home: a small kicker + the giant animated name (the page's only <h1>).
 * Elsewhere: the name is a link home, and each page supplies its own <h1>.
 */
export default function Header() {
  const { site } = useSite();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <header className={`${styles.header}${isHome ? ` ${styles.headerHome}` : ""}`}>
      {/* Home: the ticker sits at the very top of the page, full width. */}
      {isHome && (
        <Marquee
          className={styles.topMarquee}
          items={["Brand identity", "UI/UX", "Packaging", "Social creatives", "Posters", "Motion"]}
          label="Brand identity, UI/UX, packaging, social creatives, posters and motion."
        />
      )}

      <div className={styles.bar}>
        {isHome ? (
          <p className={styles.kicker}>
            {site.location}
          </p>
        ) : (
          <TransitionLink className={styles.name} to="/">
            {site.name}
          </TransitionLink>
        )}
        <ThemeSwitcher />
      </div>

      {isHome && (
        <>
          <p className={`status-pill ${styles.status}`}>
            <span className="status-pill__dot" aria-hidden="true" />
            {site.status}
          </p>
          <SplitName text={site.name} className={`${styles.display} ${styles.displayAfterStatus}`} />
          <p className={styles.role}>{site.role}</p>
        </>
      )}

      <nav className={styles.nav} aria-label="Main">
        <ul>
          {NAV.map((item) => (
            <li key={item.to}>
              <TransitionLink nav end={item.end} className={`link-underline ${styles.navLink}`} to={item.to}>
                {item.label}
              </TransitionLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
