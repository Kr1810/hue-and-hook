import { useLocation } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import SplitName from "./SplitName.jsx";
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
    <header className={styles.header}>
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
          <SplitName text={site.name} className={styles.display} />
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
