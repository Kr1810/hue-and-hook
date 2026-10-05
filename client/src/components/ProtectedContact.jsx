import { useProtectedContact } from "../hooks/useProtectedContact.js";

/**
 * Email / phone link assembled in the browser after mount, so scrapers that
 * read raw HTML never see the full address. Before mount (and for no-JS
 * visitors, who get the <noscript> text in index.html) a neutral label shows.
 *
 *   <ProtectedContact kind="email" />  → mailto:121krinas@…
 *   <ProtectedContact kind="phone" />  → tel:+91…
 */
export default function ProtectedContact({ kind, className, children }) {
  const { value, href } = useProtectedContact(kind);
  const fallback = kind === "email" ? "email address" : "phone number";
  return (
    <a className={className} href={href}>
      {children ?? value ?? fallback}
    </a>
  );
}
