/**
 * zod schemas for write endpoints. Strings are trimmed and stripped of HTML
 * before length checks, so "<b></b>" can't sneak past "min 1".
 *
 * Forms carry a honeypot field called "website". Real people never see it;
 * bots fill it. Routes check `isSpam()` and quietly pretend success.
 */
import { z } from "zod";

/** Remove tags + control characters, collapse runs of spaces. */
export function sanitize(value) {
  return String(value)
    .replace(/<[^>]*>?/g, "")
    // eslint-disable-next-line no-control-regex -- deliberately stripping control chars
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

const cleanString = () => z.string({ invalid_type_error: "Must be text." }).transform(sanitize);

const honeypot = z.string().optional().default("");

// Keep in sync with client/src/lib/validate.js
export const PROJECT_TYPES = [
  "Brand identity",
  "UI/UX",
  "Packaging",
  "Social media",
  "Print",
  "Illustration",
  "Motion",
  "Other",
];

export const BUDGETS = ["< ₹25k", "₹25k–75k", "₹75k–1.5L", "₹1.5L+"];

export const contactSchema = z.object({
  name: cleanString().pipe(
    z.string().min(1, "Please add your name.").max(80, "Keep it under 80 characters.")
  ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "That email looks too long.")
    .email("Please enter a valid email address."),
  projectType: z.enum(PROJECT_TYPES, { errorMap: () => ({ message: "Pick a project type." }) }),
  budget: z.enum(BUDGETS, { errorMap: () => ({ message: "Pick a budget range." }) }),
  timeline: cleanString()
    .pipe(z.string().max(80, "Keep the timeline under 80 characters."))
    .optional()
    .default(""),
  message: cleanString().pipe(
    z
      .string()
      .min(10, "Tell me a little more (at least 10 characters).")
      .max(2000, "Messages can be up to 2,000 characters.")
  ),
  website: honeypot,
});

export const isSpam = (data) => Boolean(data.website);
