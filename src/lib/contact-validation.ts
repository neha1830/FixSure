/** Shared phone / email checks for forms + APIs (India mobile + WhatsApp). */

/** HTML pattern: 10-digit mobile (6–9…) or optional +91 / 91 prefix. */
export const PHONE_INPUT_PATTERN =
  "^(\\+91[\\s-]?|91[\\s-]?)?[6-9]\\d{9}$";

export const EMAIL_INPUT_PATTERN =
  "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$";

export const PHONE_INPUT_TITLE =
  "Enter a valid 10-digit Indian mobile (starts with 6–9), optional +91";

export const EMAIL_INPUT_TITLE = "Enter a valid email address";

export function digitsOnly(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

/** True for 10-digit Indian mobile, or 91/ +91 prefixed forms. */
export function isValidPhone(phone: string): boolean {
  const d = digitsOnly(phone);
  if (d.length === 10 && /^[6-9]\d{9}$/.test(d)) return true;
  if (d.length === 12 && /^91[6-9]\d{9}$/.test(d)) return true;
  return false;
}

/** Normalize to 10-digit local mobile when possible. */
export function normalizePhoneDigits(phone: string): string {
  const d = digitsOnly(phone);
  if (d.length === 12 && d.startsWith("91")) return d.slice(2);
  return d;
}

export function isValidEmail(email: string): boolean {
  const v = String(email || "").trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function phoneValidationError(phone: string): string | null {
  if (!String(phone || "").trim()) return "Phone number is required.";
  if (!isValidPhone(phone)) {
    return "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
  }
  return null;
}

export function optionalPhoneValidationError(
  phone: string | null | undefined
): string | null {
  if (!phone || !String(phone).trim()) return null;
  if (!isValidPhone(phone)) {
    return "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
  }
  return null;
}

export function emailValidationError(email: string): string | null {
  if (!String(email || "").trim()) return "Email is required.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  return null;
}

export function optionalEmailValidationError(
  email: string | null | undefined
): string | null {
  if (!email || !String(email).trim()) return null;
  if (!isValidEmail(email)) return "Enter a valid email address.";
  return null;
}

/** Next free name: "Rahul Sharma" → "Rahul Sharma1", "Rahul Sharma2", … */
export function suggestUniqueName(
  baseName: string,
  existingNames: string[]
): string {
  const base = baseName.trim().replace(/\s+/g, " ");
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  let i = 1;
  while (taken.has(`${base}${i}`.toLowerCase())) i += 1;
  return `${base}${i}`;
}
