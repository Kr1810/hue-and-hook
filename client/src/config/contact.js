/**
 * Contact details, split into parts so the full email address and phone
 * number never appear as plain strings in the HTML or the JS bundle's
 * string table. <ProtectedContact> joins them in the browser after mount.
 * index.html keeps a <noscript> plain-text fallback so they stay reachable.
 *
 * To change them, edit the parts below (and the noscript text in index.html).
 */
export const EMAIL_PARTS = ["121krinas", "gmail", "com"]; // user, domain, tld
export const PHONE_PARTS = ["+91", "96879", "09729"]; // country, first half, second half

export const LINKEDIN_URL = "https://www.linkedin.com/in/krina-suthar-510537226";

export const joinEmail = () => `${EMAIL_PARTS[0]}@${EMAIL_PARTS[1]}.${EMAIL_PARTS[2]}`;
export const joinPhone = () => PHONE_PARTS.join(" ");
export const phoneHref = () => `tel:${PHONE_PARTS.join("").replace(/\s+/g, "")}`;
