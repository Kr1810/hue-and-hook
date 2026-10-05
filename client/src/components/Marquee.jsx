import styles from "./Marquee.module.css";

/**
 * Infinite ticker, pure CSS: two identical groups slide -50% and loop.
 * Pauses on hover; stops for reduced motion. Screen readers get one clean
 * sentence instead of the repeated visual track.
 */
export default function Marquee({ items, label, repeat = 4, className = "" }) {
  const group = Array.from({ length: repeat }, (_, r) =>
    items.flatMap((item, i) => [
      <span key={`${r}-${i}`}>{item}</span>,
      <span key={`${r}-${i}-dot`}>·</span>,
    ])
  );

  return (
    <div className={`${styles.marquee} ${className}`}>
      <p className="sr-only">{label ?? items.join(", ")}</p>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.group}>{group}</div>
        <div className={styles.group}>{group}</div>
      </div>
    </div>
  );
}
