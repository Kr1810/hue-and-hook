import { useEffect, useRef } from "react";
import Seo from "../components/Seo.jsx";
import Reveal from "../components/Reveal.jsx";
import BackToTop from "../components/BackToTop.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { Loading, Skeleton } from "../components/Skeleton.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { usePageReady } from "../hooks/usePageReady.js";
import { prefersReducedMotion } from "../hooks/useReducedMotion.js";
import styles from "./Experience.module.css";

/**
 * Zig-zag timeline: a centred line, cards alternating right/left (newest on
 * the right), date labels sitting on the line. A darker fill grows down the
 * line as you scroll. Single column with the line on the left below 900px.
 */

/** Scroll-progress fill: scaleY from 0 → 1 as the timeline passes the viewport middle. */
function useLineProgress(lineRef, fillRef, enabled) {
  useEffect(() => {
    const line = lineRef.current;
    const fill = fillRef.current;
    if (!enabled || !line || !fill) return undefined;

    if (prefersReducedMotion()) {
      fill.style.transform = "scaleY(1)";
      return undefined;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = line.getBoundingClientRect();
      const anchor = window.innerHeight * 0.6; // "reading position"
      const progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
      fill.style.transform = `scaleY(${progress})`;
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [lineRef, fillRef, enabled]);
}

function TimelineSkeleton() {
  return (
    <Loading label="Loading experience…">
      <div className="skeleton-stack" style={{ maxWidth: "40rem", marginLeft: "auto", gap: "1rem" }}>
        <Skeleton width="10rem" />
        <Skeleton height="18rem" style={{ borderRadius: 28 }} />
      </div>
    </Loading>
  );
}

export default function Experience() {
  const { data, error, loading, reload } = useFetch("/experience");
  usePageReady(!loading); // reveal once data has loaded or errored
  const lineRef = useRef(null);
  const fillRef = useRef(null);
  useLineProgress(lineRef, fillRef, Boolean(data));

  return (
    <article>
      <Seo
        title="experience"
        description="Krina Suthar's experience: UI/UX & Graphic Designer Lead at Techlusion and UI/UX & Graphic Designer intern at Codage Habitation, Ahmedabad. 1.5 years across UI/UX and graphic design."
      />

      <header className="page-head">
        <p className="eyebrow">1.5 years · Jan 2025 – Aug 2026 · UI/UX & graphic design</p>
        <h1 className="page-title">Experience</h1>
        <p className="lede">
          Where I&apos;ve worked, what I shipped, and the tools I picked up along the way.
        </p>
      </header>

      {loading && <TimelineSkeleton />}
      {error && <ErrorState title="Experience didn't load." error={error} onRetry={reload} />}

      {data && (
        <div className={styles.timeline}>
          <div className={styles.line} ref={lineRef} aria-hidden="true">
            <span className={styles.fill} ref={fillRef} />
          </div>

          <ol className={styles.entries}>
            {data.experience.map((job, index) => {
              const side = index % 2 === 0 ? "right" : "left";
              const dates = `${job.start} — ${job.end}`;
              return (
                <li key={`${job.company}-${job.start}`} className={`${styles.entry} ${styles[side]}`}>
                  {/* Wrapper is positioned on the line; the inner span only fades in
                      (framer-motion would otherwise overwrite the centring transform). */}
                  <p className={styles.date}>
                    <Reveal as="span" className={styles.dateText} from={{}}>
                      <span className="sr-only">{dates}</span>
                      <span aria-hidden="true">
                        {job.start} —{" "}
                        <br />
                        {job.end}
                      </span>
                    </Reveal>
                  </p>

                  <Reveal className={styles.cardWrap} from={{ x: side === "right" ? 40 : -40 }}>
                    <article className={styles.card} aria-label={`${job.title} at ${job.company}, ${dates}`}>
                      <h2 className={styles.title}>
                        {job.title}
                        <span className={styles.type}> · {job.type}</span>
                      </h2>
                      <p className={styles.meta}>
                        {job.company} · {job.location} · {job.workMode}
                      </p>
                      <ul className={styles.highlights}>
                        {job.highlights.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <ul className={styles.tags} aria-label="Skills">
                        {job.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {data && (
        <section className="section" aria-labelledby="education-title">
          <Reveal as="h2" className="section-title" id="education-title">
            Education
          </Reveal>
          <ul className={styles.education}>
            {data.education.map((item) => (
              <Reveal as="li" key={`${item.degree}-${item.year}`} className={styles.eduItem}>
                <p className={styles.eduDegree}>{item.degree}</p>
                <p className={styles.eduMeta}>
                  {item.institute} · {item.year}
                </p>
              </Reveal>
            ))}
          </ul>
          <div className="actions">
            <a className="button button--big" href="/Krina_Suthar_AI_UIUX_Designer.pdf" download>
              Download résumé <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>
      )}

      <BackToTop />
    </article>
  );
}
