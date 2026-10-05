import { useEffect, useState } from "react";
import { joinEmail, joinPhone, phoneHref } from "../config/contact.js";

/**
 * Email or phone, assembled from parts after mount (light scraping
 * protection). Returns { value, href }, both null until mounted.
 */
export function useProtectedContact(kind) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(kind === "email" ? joinEmail() : joinPhone());
  }, [kind]);
  const href = value ? (kind === "email" ? `mailto:${value}` : phoneHref()) : undefined;
  return { value, href };
}
