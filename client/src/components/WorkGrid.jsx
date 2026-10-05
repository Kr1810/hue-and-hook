import WorkCard from "./WorkCard.jsx";
import Reveal from "./Reveal.jsx";
import styles from "./WorkGrid.module.css";

/**
 * "Selected collaborations": the first card is full width, then rows of two
 * alternate wide/narrow and narrow/wide. A leftover last card goes full width.
 */
export default function WorkGrid({ items }) {
  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <Reveal key={item.slug} className={styles.cell}>
          <WorkCard item={item} eager={index === 0} />
        </Reveal>
      ))}
    </div>
  );
}
