import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { LazyMotion, MotionConfig } from "framer-motion";
import Layout from "./components/Layout.jsx";
import TVLoader from "./components/loader/TVLoader.jsx";
import { PageSkeleton } from "./components/Skeleton.jsx";
import { PageTransitionProvider } from "./context/PageTransitionContext.jsx";
import { useScrollToTop } from "./hooks/useScrollToTop.js";

// Every page is its own chunk.
const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Work = lazy(() => import("./pages/Work.jsx"));
const CaseStudy = lazy(() => import("./pages/CaseStudy.jsx"));
const Experience = lazy(() => import("./pages/Experience.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Imprint = lazy(() => import("./pages/Imprint.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Animation features arrive in their own chunk after first render.
const loadMotionFeatures = () => import("./lib/motionFeatures.js").then((mod) => mod.default);

function AppRoutes() {
  const location = useLocation();
  useScrollToTop(); // same-page #hash links; route changes are handled by the loader

  // Keyed by pathname so each page gets a fresh Suspense boundary.
  return (
    <div key={location.pathname} className="route">
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <PageTransitionProvider>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <Layout>
            <AppRoutes />
          </Layout>
        </MotionConfig>
      </LazyMotion>
      {/* The TV static loader: one instance, one WebGL context, every route change. */}
      <TVLoader />
    </PageTransitionProvider>
  );
}
