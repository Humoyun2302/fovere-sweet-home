/** Uzbekistan mobile: +998 XX XXX XX XX */
export const PHONE_PLACEHOLDER = "+998 90 123 45 67";

/** Formats input as +998 XX XXX XX XX while typing. */
export function formatPhone(raw: string) {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  let digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  if (!digits.startsWith("998") && digits.length <= 9) {
    digits = "998" + digits.replace(/^0+/, "");
  }
  const d = digits.slice(0, 12);
  const a = d.slice(0, 3);
  const b = d.slice(3, 5);
  const c = d.slice(5, 8);
  const e = d.slice(8, 10);
  const f = d.slice(10, 12);
  return ["+" + a, b, c, e, f].filter(Boolean).join(" ").trim();
}

/** True when the number is a complete Uzbek mobile (+998 + 9 digits). */
export function isValidPhone(p: string) {
  const digits = p.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("998");
}

export const PHONE_INVALID_MESSAGE =
  "Telefon raqam noto'g'ri. Masalan: +998 90 123 45 67";
