// Pembuat PDF satu halaman minimalis (tanpa dependensi) untuk fallback docgen
// mode dev/demo. Di produksi, pembuatan dokumen dari template Google Docs +
// penyisipan gambar TTD ditangani GAS (lihat src/gas/docgen.js).

function escapePdfText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Bangun PDF dari judul + daftar baris teks. Mengembalikan Buffer. */
export function simplePdf(title: string, lines: string[]): Buffer {
  const contentLines: string[] = [];
  contentLines.push("BT");
  contentLines.push("/F1 18 Tf");
  contentLines.push("50 790 Td");
  contentLines.push("22 TL");
  contentLines.push(`(${escapePdfText(title)}) Tj`);
  contentLines.push("/F1 11 Tf");
  contentLines.push("T*");
  contentLines.push("T*");
  for (const ln of lines) {
    contentLines.push(`(${escapePdfText(ln)}) Tj`);
    contentLines.push("T*");
  }
  contentLines.push("ET");
  const content = contentLines.join("\n");

  const objects: string[] = [];
  objects.push("<</Type/Catalog/Pages 2 0 R>>");
  objects.push("<</Type/Pages/Kids[3 0 R]/Count 1>>");
  objects.push("<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>");
  objects.push("<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>");
  objects.push(`<</Length ${Buffer.byteLength(content)}>>\nstream\n${content}\nendstream`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += String(off).padStart(10, "0") + " 00000 n \n";
  }
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "binary");
}
