import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useSite } from "../context/SiteContext.jsx";

/**
 * Per-page <title>, description, canonical, Open Graph and Twitter tags.
 * Title format: "work - Krina Suthar [Graphic designer]".
 */
export default function Seo({ title, description, type = "website", image = "/og-image.png", noindex = false, jsonLd }) {
  const { site } = useSite();
  const { pathname } = useLocation();

  const brand = `${site.name} [${site.role}]`;
  const fullTitle = `${title} - ${brand}`;
  const desc = description || site.description;
  const origin = site.siteUrl || window.location.origin;
  const canonical = `${origin}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`;
  const imageUrl = image.startsWith("http") ? image : `${origin}${image}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={canonical} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={brand} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured data (a data block, not executed, so the CSP allows it). */}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
