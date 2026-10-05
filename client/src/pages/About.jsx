import Seo from "../components/Seo.jsx";
import Reveal from "../components/Reveal.jsx";
import BackToTop from "../components/BackToTop.jsx";
import TransitionLink from "../components/TransitionLink.jsx";
import { LinkedInLink } from "../components/LinkedInIcon.jsx";
import { useSite } from "../context/SiteContext.jsx";
import { usePageReady } from "../hooks/usePageReady.js";
import { imageUrl } from "../lib/images.js";

const PROCESS = [
  { step: "Discover", text: "I ask a lot of questions about your audience, your goals and what makes you different." },
  { step: "Concept", text: "Moodboards and rough sketches until one idea clearly feels like you." },
  { step: "Design", text: "Typography first, then colour, layout and every tiny detail, refined with your feedback." },
  { step: "Deliver", text: "Print-ready, screen-ready files plus simple guidelines so it all stays consistent." },
];

export default function About() {
  usePageReady(true); // site data has a built-in fallback
  const { site } = useSite();

  return (
    <article>
      <Seo
        title="about"
        description="About Krina Suthar: a graphic designer in Ahmedabad with 1.5 years across UI/UX and graphic design, creating brand identities, packaging, print, illustration and motion."
      />

      <header className="page-head">
        <p className="eyebrow">
          {site.role} · {site.location} · {site.experience} in design
        </p>
        <h1 className="page-title">About</h1>
        <p className="lede">
          I&apos;m Krina, and I make things look the way they feel: brands, packaging and visuals people
          actually remember.
        </p>
      </header>

      <div className="bio">
        <div className="prose">
          <p>
            It started with sketchbooks: margins full of hand-drawn logos for brands that didn&apos;t
            exist yet. Then came late nights in Photoshop, remaking posters I loved just to figure out
            how they worked. Somewhere between those experiments and my first real client, a local café
            that needed a menu, I realised design wasn&apos;t a hobby anymore. It was how I liked to
            think.
          </p>
          <p>
            Today I design brand identities, packaging, social creatives, print and motion. I start
            with the concept, because a pretty layout without an idea is just decoration. I lead with
            typography, sweat the small details (kerning counts!), and bring my UI/UX experience into
            everything, so visuals don&apos;t just look good, they work on the screens and shelves where
            people actually meet them.
          </p>
          <p>
            I love working with <strong>startups</strong> finding their look, <strong>local brands</strong>{" "}
            ready to level up, <strong>creators</strong> who want a signature style, and{" "}
            <strong>agencies</strong> that need an extra pair of careful hands. If you care about the
            details as much as I do, we&apos;ll get along.
          </p>
        </div>

        <Reveal as="figure" className="bio__portrait">
          <img
            src={imageUrl("portrait.svg")}
            alt={`Placeholder portrait of ${site.name} at a desk`}
            width="640"
            height="800"
            loading="lazy"
            decoding="async"
          />
          <figcaption>Sketchbook, stylus, too many swatches. Home base.</figcaption>
        </Reveal>
      </div>

      <div className="section skill-columns">
        <section aria-labelledby="services-title">
          <Reveal as="h2" className="section-title" id="services-title">
            What I do
          </Reveal>
          <Reveal as="ul" className="text-list">
            {site.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="tools-title">
          <Reveal as="h2" className="section-title" id="tools-title">
            Tools I use
          </Reveal>
          <Reveal as="ul" className="text-list">
            {site.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </Reveal>
        </section>
      </div>

      <section className="section" aria-labelledby="process-title">
        <Reveal as="h2" className="section-title" id="process-title">
          My process
        </Reveal>
        <Reveal as="ol" className="process">
          {PROCESS.map((item) => (
            <li key={item.step}>
              <h3>{item.step}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="section" aria-labelledby="together-title">
        <Reveal as="h2" className="section-title" id="together-title">
          Let&apos;s work together
        </Reveal>
        <p className="section-intro">
          Got a brand to build, a launch to design for, or a wild idea? I&apos;d love to hear about it.
        </p>
        <div className="actions">
          <TransitionLink className="button button--big" to="/contact">
            Get in touch <span aria-hidden="true">→</span>
          </TransitionLink>
          <LinkedInLink label="Connect on LinkedIn" />
        </div>
      </section>

      <BackToTop />
    </article>
  );
}
