import ReactMarkdown from "react-markdown";
import TransitionLink from "./TransitionLink.jsx";

/**
 * Renders case-study bodies. Internal links ("/contact") use the router,
 * so they don't reload the page; external links open normally. Raw HTML in
 * Markdown is not rendered (react-markdown's safe default).
 */
function MarkdownLink({ href = "", children, node: _node, ...rest }) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <TransitionLink to={href} {...rest}>
        {children}
      </TransitionLink>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

const components = { a: MarkdownLink };

export default function Markdown({ children, className = "prose" }) {
  return (
    <div className={className}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
