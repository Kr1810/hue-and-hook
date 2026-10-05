import { useTheme } from "../context/ThemeContext.jsx";
import styles from "./ThemeSwitcher.module.css";

/**
 * Four round swatches. Each is a real <button> with aria-pressed, and a
 * visually hidden live region announces the change to screen readers.
 */
export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const active = themes.find((t) => t.id === theme) ?? themes[0];

  return (
    <div className={styles.switcher} role="group" aria-label="Color theme">
      {themes.map((t) => (
        <button
          key={t.id}
          type="button"
          className={styles.swatch}
          data-swatch={t.id}
          aria-label={`${t.label} theme`}
          aria-pressed={t.id === theme}
          onClick={() => setTheme(t.id)}
        >
          <span className={styles.dot} aria-hidden="true" />
        </button>
      ))}
      <p className="sr-only" aria-live="polite">
        Current theme color is {active.label}.
      </p>
    </div>
  );
}
