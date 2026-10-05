import Seo from "../components/Seo.jsx";
import TransitionLink from "../components/TransitionLink.jsx";
import { usePageReady } from "../hooks/usePageReady.js";

/** Catch-all route. The shader runs at full strength here (see routes.js). */
export default function NotFound() {
  usePageReady(true); // no data to wait for
  return (
    <section className="lost">
      <Seo title="page not found" description="This page doesn't exist (anymore)." noindex />
      <p className="lost__code" aria-hidden="true">
        404
      </p>
      <h1 className="page-title page-title--long">This page didn&apos;t make the final cut.</h1>
      <p className="lede">
        It was probably version 7 of 12, and we all know the good one was version 3. Let&apos;s get you
        back to the approved designs.
      </p>
      <div className="actions">
        <TransitionLink className="button" to="/">
          Take me home <span aria-hidden="true">→</span>
        </TransitionLink>
        <TransitionLink className="button button--ghost" to="/work">
          See the work
        </TransitionLink>
      </div>
    </section>
  );
}
