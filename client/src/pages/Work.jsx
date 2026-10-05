import Seo from "../components/Seo.jsx";
import WorkGrid from "../components/WorkGrid.jsx";
import Reveal from "../components/Reveal.jsx";
import BackToTop from "../components/BackToTop.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { Loading, SkeletonGrid } from "../components/Skeleton.jsx";
import { useFetch } from "../hooks/useFetch.js";
import TransitionLink from "../components/TransitionLink.jsx";
import { usePageReady } from "../hooks/usePageReady.js";

export default function Work() {
  const { data, error, loading, reload } = useFetch("/work");
  usePageReady(!loading); // reveal once data has loaded or errored

  return (
    <>
      <Seo
        title="work"
        description="Selected design work by Krina Suthar: brand identity, packaging, social media creatives, event posters, UI visuals, editorial layout, motion graphics and typography."
      />

      <header className="page-head">
        <p className="eyebrow">Selected projects, 2025 – now</p>
        <h1 className="page-title">Work</h1>
        <p className="lede">
          Eight projects I&apos;m proud of: identities, packaging, posters, screens and a few
          letterforms that refused to behave. Each one comes with the thinking behind it.
        </p>
      </header>

      {loading && (
        <Loading label="Loading case studies…">
          <SkeletonGrid count={3} min="22rem" />
        </Loading>
      )}
      {error && <ErrorState title="The work didn't load." error={error} onRetry={reload} />}
      {data && <WorkGrid items={data} />}

      <Reveal as="aside" className="callout" aria-label="Work with me">
        <p className="callout__title">Your project next?</p>
        <p>
          I take on a small number of projects at a time so each one gets proper attention. Tell me
          what you&apos;re building and I&apos;ll come back with ideas, not just a quote.
        </p>
        <p>
          <TransitionLink className="button" to="/contact">
            Start a conversation <span aria-hidden="true">→</span>
          </TransitionLink>
        </p>
      </Reveal>

      <BackToTop />
    </>
  );
}
