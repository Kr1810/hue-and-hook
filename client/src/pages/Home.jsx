import Seo from "../components/Seo.jsx";
import Marquee from "../components/Marquee.jsx";
import TransitionLink from "../components/TransitionLink.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { useSite } from "../context/SiteContext.jsx";
import { usePageReady } from "../hooks/usePageReady.js";
import { joinEmail, joinPhone, LINKEDIN_URL } from "../config/contact.js";

/**
 * Deliberately sparse: the giant name, role line and nav live in the
 * header, and the shader is the hero.
 */
export default function Home() {
  usePageReady(true); // no data to wait for
  const { site, loading } = useSite();

  // JSON-LD Person schema (injected at runtime, like the contact details).
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    email: `mailto:${joinEmail()}`,
    telephone: joinPhone().replace(/\s+/g, ""),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    sameAs: [LINKEDIN_URL],
    ...(site.siteUrl ? { url: site.siteUrl } : {}),
  };

  return (
    <>
      <Seo
        title="home"
        description="Krina Suthar is a graphic designer in Ahmedabad designing brand identities, packaging, social creatives and UI visuals. Available for freelance and full-time roles."
        jsonLd={person}
      />

      <div className="hero">
        <p className="hero__tagline">{site.tagline}</p>

        <p className="status-pill">
          <span className="status-pill__dot" aria-hidden="true" />
          {site.status}
        </p>

        <div className="actions">
          <TransitionLink className="button button--big" to="/work">
            See my work <span aria-hidden="true">→</span>
          </TransitionLink>
          <TransitionLink className="button button--big button--ghost" to="/contact">
            Let&apos;s work together
          </TransitionLink>
        </div>
      </div>

      <Marquee
        items={["Brand identity", "UI/UX", "Packaging", "Social creatives", "Posters", "Motion"]}
        label="Brand identity, UI/UX, packaging, social creatives, posters and motion."
      />

      <p className="currently">
        <span className="currently__label">Currently:</span>
        {site.currently ? (
          <span className="currently__text">{site.currently}</span>
        ) : loading ? (
          <Skeleton width="min(22rem, 70vw)" height="1.4rem" />
        ) : (
          <span className="currently__text">sketching something new ✏️</span>
        )}
      </p>
    </>
  );
}
