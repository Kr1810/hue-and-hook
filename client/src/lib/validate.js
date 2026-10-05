/**
 * Client-side checks that mirror the server's zod schema
 * (server/src/validation/schemas.js), so people get instant feedback. The
 * server stays the source of truth: its field errors show the same way.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const stripTags = (value) => String(value ?? "").replace(/<[^>]*>?/g, "").trim();

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

export function validateEmail(email) {
  const value = String(email ?? "").trim();
  if (!value) return "Please enter your email address.";
  if (!EMAIL.test(value) || value.length > 254) return "Please enter a valid email address.";
  return null;
}

export function validateContact({ name, email, projectType, budget, timeline, message }) {
  const errors = {};
  const n = stripTags(name);
  if (!n) errors.name = "Please add your name.";
  else if (n.length > 80) errors.name = "Keep it under 80 characters.";
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!PROJECT_TYPES.includes(projectType)) errors.projectType = "Pick a project type.";
  if (!BUDGETS.includes(budget)) errors.budget = "Pick a budget range.";
  if (stripTags(timeline).length > 80) errors.timeline = "Keep the timeline under 80 characters.";
  const m = stripTags(message);
  if (m.length < 10) errors.message = "Tell me a little more (at least 10 characters).";
  else if (m.length > 2000) errors.message = "Messages can be up to 2,000 characters.";
  return errors;
}

/** Turn the API's { field: [messages] } into { field: "first message" }. */
export function fieldErrorsFrom(details) {
  if (!details) return {};
  return Object.fromEntries(Object.entries(details).map(([key, list]) => [key, list?.[0]]));
}

/** Focus the first invalid control so keyboard/screen-reader users land on it. */
export function focusFirstError(form) {
  requestAnimationFrame(() => form?.querySelector('[aria-invalid="true"]')?.focus());
}
