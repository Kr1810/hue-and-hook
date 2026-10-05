import Seo from "../components/Seo.jsx";
import ProtectedContact from "../components/ProtectedContact.jsx";
import { useSite } from "../context/SiteContext.jsx";
import { usePageReady } from "../hooks/usePageReady.js";

/** Legal page. Replace the placeholder address/business lines before launch. */
export default function Imprint() {
  usePageReady(true); // no data to wait for
  const { site } = useSite();

  return (
    <article>
      <Seo title="imprint" description={`Imprint and legal information for ${site.name}, graphic designer in Ahmedabad, India.`} />

      <header className="page-head">
        <p className="eyebrow">The legal bit</p>
        <h1 className="page-title">Imprint</h1>
        <p className="lede">Address and business details below are placeholders. Replace them before going live.</p>
      </header>

      <div className="prose">
        <h2>Responsible for this website</h2>
        <p>
          {site.name}, {site.role}
          <br />
          [Street address]
          <br />
          Ahmedabad, Gujarat, India
        </p>
        <p>
          <strong>Email:</strong> <ProtectedContact kind="email" />
          <br />
          <strong>Phone:</strong> <ProtectedContact kind="phone" />
        </p>

        <h2>Business details</h2>
        <p>
          GSTIN / tax number: <em>to be added, if applicable</em>
        </p>

        <h2>Content liability</h2>
        <p>
          I put care into everything on this site, but I can&apos;t guarantee that it is complete,
          correct or up to date. Some case studies are concept or personal projects, and they&apos;re
          labelled as such.
        </p>

        <h2>Links to other websites</h2>
        <p>
          This site links to external websites, such as LinkedIn. I have no control over their content
          and accept no responsibility for it.
        </p>

        <h2>Copyright</h2>
        <p>
          Unless stated otherwise, all designs, text and images on this site are © {site.name}. Please
          ask before reusing anything. I&apos;m friendly, and I&apos;ll probably say yes.
        </p>

        <h2>Privacy</h2>
        <p>
          This site uses no tracking cookies or analytics. Your theme choice and the &ldquo;Static
          FX&rdquo; sound setting are saved in your browser&apos;s local storage and never leave your
          device. If you send a message through the contact form, it is stored on this site&apos;s
          server and used only to reply to you.
        </p>
      </div>
    </article>
  );
}
