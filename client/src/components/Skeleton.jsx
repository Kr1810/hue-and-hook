/**
 * Loading placeholders. Purely visual (aria-hidden); a polite live region
 * tells screen-reader users that content is loading.
 */
export function Skeleton({ width = "100%", height = "1rem", style, className = "" }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonLines({ lines = 3 }) {
  return (
    <div className="skeleton-stack">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "60%" : "100%"} />
      ))}
    </div>
  );
}

/** Generic block grid, e.g. work cards or products. */
export function SkeletonGrid({ count = 4, ratio = "16 / 10", min = "17rem" }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-m)",
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}), 1fr))`,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-stack">
          <Skeleton height="auto" style={{ aspectRatio: ratio }} />
          <Skeleton width="40%" />
          <Skeleton width="80%" height="1.6rem" />
        </div>
      ))}
    </div>
  );
}

/** Full-page fallback while a lazy route chunk loads. */
export function PageSkeleton() {
  return (
    <div className="page-head" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="skeleton-stack" style={{ maxWidth: "48rem" }}>
        <Skeleton width="10rem" />
        <Skeleton width="70%" height="clamp(3rem, 10vw, 7rem)" />
        <Skeleton width="55%" height="1.4rem" style={{ marginTop: "1.5rem" }} />
        <Skeleton width="45%" height="1.4rem" />
      </div>
    </div>
  );
}

/** Wrap any skeleton with an announcement for assistive tech. */
export function Loading({ label = "Loading…", children }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
