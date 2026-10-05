import { imageUrl } from "../lib/images.js";
import styles from "./WorkCard.module.css";
import TransitionLink from "./TransitionLink.jsx";

/**
 * Case-study card. The title link is stretched over the whole card, so the
 * card is one big click target while screen readers only hear the title.
 * data-cursor feeds the "View →" pill.
 */
export default function WorkCard({ item, eager = false }) {
  return (
    <article className={styles.card} data-cursor="View →">
      <div className={styles.media}>
        <img
          src={imageUrl(item.cover)}
          alt={item.coverAlt || ""}
          width="1600"
          height="1000"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
      <div className={styles.meta}>
        <p className={styles.type}>
          {item.category} <span aria-hidden="true">·</span> {item.year}
        </p>
        <h2 className={styles.title}>
          <TransitionLink to={`/work/${item.slug}`}>
            <span>{item.title}</span>
          </TransitionLink>
        </h2>
        {item.headline && (
          <p className={styles.client}>
            for {item.client} <span aria-hidden="true">—</span> <strong>{item.headline}</strong>
          </p>
        )}
      </div>
    </article>
  );
}
