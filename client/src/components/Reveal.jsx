import { m } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion.js";

/**
 * Fades children in and up 24px the first time they scroll into view.
 * `from` overrides the start offset, e.g. from={{ x: 40 }} slides in from the right.
 * `as` picks the element ("div", "section", "li", ...). With reduced motion
 * it renders a plain element with no animation at all.
 */
export default function Reveal({ as = "div", delay = 0, from = { y: 24 }, children, ...rest }) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Tag = as;
    return <Tag {...rest}>{children}</Tag>;
  }

  const MotionTag = m[as] ?? m.div;
  return (
    <MotionTag
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
