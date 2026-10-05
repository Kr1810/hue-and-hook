import { forwardRef } from "react";
import { Link, NavLink, createPath, useLocation } from "react-router-dom";
import { usePageTransition } from "../context/PageTransitionContext.jsx";

/**
 * Drop-in replacement for <Link>/<NavLink> (pass `nav` for NavLink behaviour)
 * that routes through the TV loader. Left-clicks to another page run the
 * transition; everything else falls through to normal browser behaviour:
 * modifier/middle clicks, target="_blank", external URLs, hash links on the
 * current page and links to the current path.
 */
const TransitionLink = forwardRef(function TransitionLink({ to, nav = false, onClick, target, ...rest }, ref) {
  const { navigateWithTransition } = usePageTransition();
  const location = useLocation();
  const Component = nav ? NavLink : Link;

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (target && target !== "_self") return;

    const href = typeof to === "string" ? to : createPath(to);
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === location.pathname) return; // same page (incl. #hash): let Router handle it

    event.preventDefault();
    navigateWithTransition(`${url.pathname}${url.search}${url.hash}`);
  };

  return <Component ref={ref} to={to} target={target} {...rest} onClick={handleClick} />;
});

export default TransitionLink;
