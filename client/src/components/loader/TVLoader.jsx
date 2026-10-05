import { useEffect, useRef } from "react";
import { usePageTransition } from "../../context/PageTransitionContext.jsx";
import { useSite } from "../../context/SiteContext.jsx";
import { LOADER } from "../../config/loader.js";
import { createTVRenderer } from "./createTVRenderer.js";
import { startStatic, stopStatic } from "./staticAudio.js";
import styles from "./TVLoader.module.css";

/**
 * Full-screen "TV static colour bars" transition. Rendered once at the app
 * root; the phase comes from PageTransitionContext:
 *   enter  → white flash + CRT warm-up (CSS), static starts
 *   hold   → full static, new page mounts underneath
 *   exit   → brightness spike + CRT power-off: line → dot → fade
 *   idle   → hidden, render loop stopped (canvas + context kept for reuse)
 */
export default function TVLoader() {
  const { phase, channel, name, seed, reduced, soundOn } = usePageTransition();
  const { site } = useSite();
  const hostRef = useRef(null);
  const rendererRef = useRef(null);

  // One renderer (one WebGL context) for the whole session.
  useEffect(() => {
    const renderer = createTVRenderer(hostRef.current, LOADER, { canvasClass: styles.canvas });
    rendererRef.current = renderer;
    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  // Drive the renderer from the phase; only animate while visible.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (phase === "idle") {
      renderer.stop();
      return;
    }
    renderer.setSeed(seed);
    renderer.setIntensity(reduced ? LOADER.reduced.intensity : phase === "exit" ? LOADER.exitIntensity : 1);
    renderer.start({ reduced });
  }, [phase, seed, reduced]);

  // Optional hiss while visible (never with reduced motion).
  useEffect(() => {
    if (soundOn && !reduced && phase !== "idle") startStatic();
    else stopStatic();
  }, [soundOn, reduced, phase]);
  useEffect(() => stopStatic, []);

  const timing = {
    "--flash-ms": `${LOADER.flashMs}ms`,
    "--enter-ms": `${LOADER.enterMs}ms`,
    "--exit-ms": `${LOADER.exitMs}ms`,
    "--fade-ms": `${LOADER.reduced.fadeMs}ms`,
  };

  return (
    <>
      <div
        className={`${styles.loader}${reduced ? ` ${styles.reduced}` : ""}`}
        data-phase={phase}
        style={timing}
      >
        <div className={styles.screen}>
          <div ref={hostRef} className={styles.host} aria-hidden="true" />
          <div className={styles.osd} aria-hidden="true">
            <p className={styles.channel}>
              {channel}
              <span className={styles.cursor}>▮</span>
            </p>
            <p className={styles.noSignal}>{site.name} · No signal</p>
          </div>
          <div className={styles.flash} />
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {phase !== "idle" ? `Loading ${name} page` : ""}
      </p>
    </>
  );
}
