import { useId, useState } from "react";

/**
 * Accessible disclosure accordion (WAI-ARIA pattern): each question is a
 * <button aria-expanded aria-controls> inside a heading, and its answer is a
 * labelled region. Several items can be open at once.
 */
export default function Accordion({ items, headingLevel = 3 }) {
  const baseId = useId();
  const [open, setOpen] = useState(() => new Set());
  const Heading = `h${headingLevel}`;

  const toggle = (index) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = open.has(index);
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;
        return (
          <div className="accordion__item" key={item.question}>
            <Heading className="accordion__heading">
              <button
                type="button"
                id={buttonId}
                className="accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                <span>{item.question}</span>
                <span className="accordion__icon" aria-hidden="true">+</span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="accordion__panel"
              hidden={!isOpen}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
