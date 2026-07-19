// Lampiran boleh lebih dari satu berkas. Untuk tetap ramah Sheets (1 sel =
// 1 nilai), beberapa file_id disimpan sebagai satu string dipisah koma.
// Kompatibel mundur: nilai lama berisi satu id tunggal tetap valid.

export function splitIds(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinIds(ids: string[]): string {
  return ids.filter(Boolean).join(",");
}
