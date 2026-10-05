import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageTransition } from "../context/PageTransitionContext.jsx";

/**
 * Tell the TV loader this page can be revealed. Call it in every page:
 *   usePageReady(!loading)  // after useFetch has loaded or errored
 *   usePageReady(true)      // pages with no data
 * Lazy routes count automatically: a page can't signal while its chunk (and
 * so its Suspense fallback) is still loading, because it isn't mounted yet.
 * The signal is tied to this page's pathname, so the old page can't release
 * the loader for the new one.
 */
export function usePageReady(isReady = true) {
  const { markReady } = usePageTransition();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isReady) markReady(pathname);
  }, [isReady, pathname, markReady]);
}
