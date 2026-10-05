import { useParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import Reveal from "../components/Reveal.jsx";
import Markdown from "../components/Markdown.jsx";
import BackToTop from "../components/BackToTop.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { Loading, Skeleton, SkeletonLines } from "../components/Skeleton.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { imageUrl } from "../lib/images.js";
import TransitionLink from "../components/TransitionLink.jsx";
import { usePageReady } from "../hooks/usePageReady.js";

function CaseSkeleton() {
  return (
    <Loading label="Loading case study…">
      <div className="page-head skeleton-stack" style={{ maxWidth: "48rem" }}>
        <Skeleton width="12rem" />
        <Skeleton width="80%" height="clamp(2.5rem, 7vw, 5rem)" />
        <Skeleton width="60%" height="1.4rem" style={{ marginTop: "1rem" }} />
      </div>
      <Skeleton height="auto" style={{ aspectRatio: "16 / 10", marginBottom: "3rem" }} />
      <div className="prose">
        <SkeletonLines lines={5} />
      </div>
    </Loading>
  );
}

function CaseNotFound() {
  return (
    <>
      <Seo title="case study not found" noindex />
      <header className="page-head">
        <p className="eyebrow">
          <TransitionLink to="/work">Work</TransitionLink> / 404
        </p>
        <h1 className="page-title page-title--long">That case study doesn&apos;t exist (yet).</h1>
        <p className="lede">Maybe it was renamed, or maybe it&apos;s still on the drawing board.</p>
        <div className="actions">
          <TransitionLink className="button" to="/work">
            See all work <span aria-hidden="true">→</span>
          </TransitionLink>
        </div>
      </header>
    </>
  );
}

export default function CaseStudy() {
  const { slug } = useParams();
  const { data, error, loading, reload } = useFetch(`/work/${encodeURIComponent(slug)}`);
  usePageReady(!loading); // reveal once data has loaded or errored

  if (loading) return <CaseSkeleton />;
  if (error?.status === 404) return <CaseNotFound />;
  if (error) return <ErrorState title="This case study didn't load." error={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <article>
      <Seo title={data.title.toLowerCase()} description={data.summary} type="article" />

      <header className="page-head">
        <p className="eyebrow">
          <TransitionLink to="/work">Work</TransitionLink> <span aria-hidden="true">/</span> {data.category}
        </p>
        <h1 className="page-title page-title--long">{data.title}</h1>
        <p className="lede">{data.summary}</p>

        <dl className="case-meta">
          <div>
            <dt>Client</dt>
            <dd>{data.client}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{data.category}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{data.role}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{data.year}</dd>
          </div>
          <div>
            <dt>Tools</dt>
            <dd>{Array.isArray(data.tools) ? data.tools.join(", ") : data.tools}</dd>
          </div>
        </dl>
        <figure className="case-cover">
          <img
            src={imageUrl(data.cover)}
            alt={data.coverAlt || ""}
            width="1600"
            height="1000"
            fetchpriority="high"
            decoding="async"
          />
        </figure>
      </header>

      {data.colors?.length > 0 && (
        <section className="palette" aria-label="Colour palette">
          <h2 className="palette__title">Palette</h2>
          <ul className="palette__swatches">
            {data.colors.map((hex) => (
              <li key={hex}>
                <span className="palette__chip" style={{ background: hex }} aria-hidden="true" />
                <code>{hex}</code>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Overview, Challenge, Concept, Design process and Final outcome come from the Markdown body. */}
      <Markdown>{data.body}</Markdown>

      <section className="section" aria-labelledby="results-title">
        <Reveal as="h2" className="section-title" id="results-title">
          Results
        </Reveal>
        <Reveal as="ul" className="result-list">
          {data.results?.map((result) => (
            <li key={result}>{result}</li>
          ))}
        </Reveal>
      </section>
      <Reveal as="section" className="section prose" aria-labelledby="learnings-title">
        <h2 id="learnings-title" className="section-title">
          What I learned
        </h2>
        <ol>
          {data.learnings?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </Reveal>

      <nav className="pager" aria-label="More case studies">
        {data.prev ? (
          <TransitionLink className="pager__link pager__link--prev" to={`/work/${data.prev.slug}`} rel="prev">
            <span className="pager__label">
              <span aria-hidden="true">←</span> Newer
            </span>
            <span className="pager__title">{data.prev.title}</span>
          </TransitionLink>
        ) : (
          <span />
        )}
        {data.next && (
          <TransitionLink className="pager__link pager__link--next" to={`/work/${data.next.slug}`} rel="next">
            <span className="pager__label">
              Older <span aria-hidden="true">→</span>
            </span>
            <span className="pager__title">{data.next.title}</span>
          </TransitionLink>
        )}
      </nav>

      <BackToTop />
    </article>
  );
}
