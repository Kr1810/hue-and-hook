import Seo from "../components/Seo.jsx";
import Reveal from "../components/Reveal.jsx";
import ContactForm from "../components/ContactForm.jsx";
import CopyButton from "../components/CopyButton.jsx";
import LinkedInIcon from "../components/LinkedInIcon.jsx";
import { useSite } from "../context/SiteContext.jsx";
import { usePageReady } from "../hooks/usePageReady.js";
import { useProtectedContact } from "../hooks/useProtectedContact.js";
import { LINKEDIN_URL } from "../config/contact.js";

/** One big, clickable contact row (email / phone) with a Copy button. */
function ContactRow({ kind, label }) {
  const { value, href } = useProtectedContact(kind);
  return (
    <li className="contact-row">
      <span className="contact-row__label">{label}</span>
      <a className="contact-row__value link-underline" href={href}>
        {value ?? `${label.toLowerCase()} loading…`}
      </a>
      <CopyButton className="contact-row__copy" value={value} label={label.toLowerCase()} />
    </li>
  );
}

export default function Contact() {
  usePageReady(true); // no data to wait for
  const { site } = useSite();

  return (
    <article>
      <Seo
        title="contact"
        description="Contact Krina Suthar, graphic designer in Ahmedabad: email, phone and LinkedIn, or send a project inquiry for brand identity, UI/UX, packaging, print or motion work."
      />

      <header className="page-head">
        <p className="eyebrow">{site.status}</p>
        <h1 className="page-title page-title--long">Let&apos;s make something beautiful</h1>
        <p className="lede">Have a brand, a launch, or a wild idea? Tell me about it.</p>
      </header>

      <ul className="contact-rows">
        <ContactRow kind="email" label="Email" />
        <ContactRow kind="phone" label="Phone" />
        <li className="contact-row">
          <span className="contact-row__label">LinkedIn</span>
          <a
            className="contact-row__value contact-row__social link-underline"
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Krina Suthar on LinkedIn (opens in a new tab)"
          >
            <LinkedInIcon /> krina-suthar
          </a>
          <span aria-hidden="true" className="contact-row__arrow">↗</span>
        </li>
      </ul>

      <p className="section-intro section-note">Based in Ahmedabad, working worldwide.</p>

      <section className="section" aria-labelledby="form-title">
        <Reveal as="h2" className="section-title" id="form-title">
          Start a project
        </Reveal>
        <p className="section-intro">
          A few details help me reply with real ideas instead of more questions.
        </p>
        <ContactForm />
      </section>
    </article>
  );
}
