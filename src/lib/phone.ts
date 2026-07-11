// Normalisasi no. telepon Indonesia ke format "62…" + tautan wa.me.

export function normalizePhone(raw: string): string {
  let s = (raw ?? "").replace(/[^\d+]/g, "");
  s = s.replace(/^\+/, "");
  if (s.startsWith("0")) s = "62" + s.slice(1);
  else if (s.startsWith("8")) s = "62" + s;
  else if (!s.startsWith("62") && s.length > 0) s = "62" + s.replace(/^62/, "");
  return s;
}

export function waLink(phone: string): string {
  return `https://wa.me/${normalizePhone(phone)}`;
}
