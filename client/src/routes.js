import { matchPath } from "react-router-dom";

/** Every real route. Anything else renders the 404 page. */
export const ROUTE_PATTERNS = ["/", "/about", "/work", "/work/:slug", "/experience", "/contact"];

export const isKnownRoute = (pathname) =>
  ROUTE_PATTERNS.some((pattern) => matchPath({ path: pattern, end: true }, pathname));

/** The shader is at full strength on Home and the 404 page, 25% elsewhere. */
export const isFullShaderRoute = (pathname) => pathname === "/" || !isKnownRoute(pathname);
