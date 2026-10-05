import { useLocation } from "react-router-dom";
import SkipLink from "./SkipLink.jsx";
import ShaderBackground from "./ShaderBackground.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import CursorPill from "./CursorPill.jsx";
import { isFullShaderRoute } from "../routes.js";
import { usePageTransition } from "../context/PageTransitionContext.jsx";

/** App shell: skip link, shader, header, <main>, footer, cursor pill. */
export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { active } = usePageTransition();

  return (
    <>
      <SkipLink />
      <ShaderBackground full={isFullShaderRoute(pathname)} />
      <div className="wrap" id="top" tabIndex={-1}>
        <Header />
        <main id="main" tabIndex={-1} aria-busy={active}>
          {children}
        </main>
        <Footer />
      </div>
      <CursorPill />
    </>
  );
}
