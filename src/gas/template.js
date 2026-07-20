/**
 * LaporanTAD — Google Apps Script: pembuat template Deklarasi Dinas.
 *
 * Menyusun dokumen Google Docs "Deklarasi Dinas / Pengeluaran Dinas" secara
 * terprogram — meniru format dokumen contoh & mengikuti Ketentuan Dinas —
 * lengkap dengan placeholder {{...}} yang diisi docgen (lihat docgen.js).
 *
 * Cara pakai (sekali saja):
 *   1. `clasp push` (atau lewat CI deploy-gas) agar fungsi ini ada di editor.
 *   2. Di editor Apps Script, pilih fungsi `createDeklarasiTemplate` → Run.
 *      (Beri izin Drive/Docs saat diminta — sama seperti `authorize()`.)
 *   3. Salin ID/URL dokumen dari log Eksekusi.
 *   4. Daftarkan ID itu di panel Admin → Template (jenis: Deklarasi Dinas).
 *
 * Dokumen dibuat oleh akun yang menjalankan skrip (akun docgen juga), sehingga
 * pasti dapat diakses saat generate. Bila Script Property `ROOT_FOLDER_ID`
 * diset, template dipindah ke folder itu agar rapi.
 */

// Catatan kaki (Ketentuan Dinas) yang tampil di bawah rincian.
var DEKLARASI_NOTE = [
  "Transportasi dari/ke bandara/terminal/stasiun/pelabuhan Jabodetabek: Rp 150.000 (umum PP stasiun/terminal Rp 225.000).",
  "Transportasi dari/ke bandara/terminal/stasiun/pelabuhan Non-Jabodetabek: Rp 150.000.",
  "Uang Harian Rp 150.000/hari · Transport Lokal Rp 50.000/hari · Kendaraan Pribadi Rp 2.000/km (≤ 200 km, sekali jalan).",
  "Akomodasi ≤ Rp 600.000/malam (sesuai realisasi + invoice). Tiket Pesawat/Kereta/Whoosh: ekonomi/LCC + boarding pass.",
];

function createDeklarasiTemplate() {
  var doc = DocumentApp.create("Template — Deklarasi Dinas (LaporanTAD)");
  var body = doc.getBody();

  // Format halaman A4 + margin ramping agar tabel 6 kolom muat.
  body.setPageWidth(595).setPageHeight(842);
  body.setMarginTop(36).setMarginBottom(36).setMarginLeft(36).setMarginRight(36);

  // Bersihkan paragraf kosong bawaan.
  body.clear();

  var GRAY = "#3f3f3f";
  var LIGHT = "#efefef";
  var WHITE = "#ffffff";

  // ── Judul ────────────────────────────────────────────────────────────────
  var h1 = body.appendParagraph("PENGELUARAN DINAS");
  h1.setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  h1.editAsText().setBold(true).setFontSize(14);

  var h2 = body.appendParagraph("{{keperluan}}");
  h2.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  h2.editAsText().setBold(true).setFontSize(11);

  body.appendParagraph("").setFontSize(4);

  // ── Identitas perjalanan ─────────────────────────────────────────────────
  infoLine(body, "Dari", "{{dari}}");
  infoLine(body, "Tujuan", "{{tujuan}}");
  infoLine(body, "Mulai", "{{realisasi_mulai}}");
  infoLine(body, "Kembali", "{{realisasi_selesai}}");
  infoLine(body, "Durasi", "{{lama_hari}}");
  infoLine(body, "Nilai tukar Rupiah tanggal", "________________ :");

  body.appendParagraph("").setFontSize(4);

  // ── Rincian Pengeluaran ──────────────────────────────────────────────────
  sectionHeader(body, "Rincian Pengeluaran", GRAY, WHITE);

  var rincian = body.appendTable([
    ["No", "Keterangan", "Vol/Hari", "Nilai Rupiah", "Mata Uang Lain", "Jumlah (Rp)"],
    ["{{@no}}", "{{@komponen}}", "{{@vol}}", "{{@nilai}}", "{{@mata_uang}}", "{{@jumlah}}"],
    ["", "", "", "", "Total Pengeluaran", "{{total_biaya}}"],
    ["", "", "", "", "Balance", "{{total_biaya}}"],
  ]);
  setColWidths(rincian, [26, 181, 52, 90, 81, 93]);
  // Baris header: latar gelap, teks putih tebal, rata tengah.
  styleRow(rincian.getRow(0), { bold: true, color: WHITE, bg: GRAY, size: 9, align: DocumentApp.HorizontalAlignment.CENTER });
  // Baris data (template {{@}}): angka rata kanan.
  cellAlign(rincian.getRow(1).getCell(2), DocumentApp.HorizontalAlignment.CENTER);
  cellAlign(rincian.getRow(1).getCell(3), DocumentApp.HorizontalAlignment.RIGHT);
  cellAlign(rincian.getRow(1).getCell(5), DocumentApp.HorizontalAlignment.RIGHT);
  // Baris Total & Balance: label + nilai tebal, rata kanan.
  [2, 3].forEach(function (r) {
    var row = rincian.getRow(r);
    row.getCell(4).editAsText().setBold(true);
    cellAlign(row.getCell(4), DocumentApp.HorizontalAlignment.RIGHT);
    row.getCell(5).editAsText().setBold(true);
    cellAlign(row.getCell(5), DocumentApp.HorizontalAlignment.RIGHT);
    row.getCell(4).setBackgroundColor(LIGHT);
    row.getCell(5).setBackgroundColor(LIGHT);
  });
  setTableFontSize(rincian, 9);

  body.appendParagraph("").setFontSize(4);

  // ── Informasi Penerima ───────────────────────────────────────────────────
  sectionHeader(body, "Informasi Penerima", GRAY, WHITE);
  var penerima = body.appendTable([
    ["Atas Nama (Penerima) : {{nama}}", "Bank Penerima : ____________________"],
    ["NPWP : ____________________", "No. Rek Bank : ____________________"],
  ]);
  setColWidths(penerima, [261, 262]);
  setTableFontSize(penerima, 9.5);

  var catatan = body.appendParagraph("Catatan : {{catatan}}");
  catatan.editAsText().setFontSize(9.5);

  body.appendParagraph("").setFontSize(6);

  // ── Catatan ketentuan (Note) ─────────────────────────────────────────────
  var noteLbl = body.appendParagraph("Note :");
  noteLbl.editAsText().setBold(true).setFontSize(9);
  DEKLARASI_NOTE.forEach(function (line) {
    var p = body.appendListItem(line).setGlyphType(DocumentApp.GlyphType.BULLET);
    p.editAsText().setBold(false).setFontSize(8.5);
  });

  body.appendParagraph("").setFontSize(8);

  // ── Blok tanda tangan ────────────────────────────────────────────────────
  var diisi = body.appendParagraph("Diisi oleh Fungsi :");
  diisi.editAsText().setBold(true).setFontSize(9);
  body.appendParagraph("Tanggal diterima di keuangan : ____________________").editAsText().setFontSize(9);

  var ttd = body.appendTable([
    ["Pemohon", "Manager Fungsi", "PMSol"],
    ["{{ttd}}", "", ""],
    ["{{nama}}\n{{nopek}}", "", ""],
  ]);
  setColWidths(ttd, [174, 174, 175]);
  styleRow(ttd.getRow(0), { bold: true, size: 9.5, align: DocumentApp.HorizontalAlignment.CENTER });
  ttd.getRow(1).setMinimumHeight(64); // ruang tanda tangan (kotak manager dibiarkan kosong)
  // Baris nama: tebal & rata tengah. Kolom manager & PMSol sengaja kosong —
  // hanya kotaknya, tanpa input tanda tangan (diisi manual).
  var namaRow = ttd.getRow(2);
  [0, 1, 2].forEach(function (c) {
    namaRow.getCell(c).editAsText().setBold(true).setFontSize(9.5);
    cellAlign(namaRow.getCell(c), DocumentApp.HorizontalAlignment.CENTER);
  });
  cellAlign(ttd.getRow(1).getCell(0), DocumentApp.HorizontalAlignment.CENTER);

  // Buang paragraf kosong bawaan di awal dokumen (sisa dari body.clear()).
  if (
    body.getNumChildren() > 1 &&
    body.getChild(0).getType() === DocumentApp.ElementType.PARAGRAPH &&
    body.getChild(0).asParagraph().getText() === ""
  ) {
    body.removeChild(body.getChild(0));
  }

  doc.saveAndClose();

  // Pindahkan ke folder root bila diset.
  var rootId = PropertiesService.getScriptProperties().getProperty("ROOT_FOLDER_ID");
  if (rootId) {
    try {
      var file = DriveApp.getFileById(doc.getId());
      DriveApp.getFolderById(rootId).addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    } catch (e) {
      Logger.log("Info: gagal memindah ke ROOT_FOLDER_ID (" + e + ") — dokumen tetap di My Drive.");
    }
  }

  var url = doc.getUrl();
  Logger.log("✓ Template Deklarasi Dinas dibuat.");
  Logger.log("  ID  : " + doc.getId());
  Logger.log("  URL : " + url);
  Logger.log("  → Daftarkan ID ini di Admin → Template (jenis: Deklarasi Dinas).");
  return { id: doc.getId(), url: url };
}

// Baris "Label : nilai" dengan label tebal.
function infoLine(body, label, value) {
  var p = body.appendParagraph("");
  var t = p.editAsText();
  t.appendText(label);
  t.appendText("  : " + value);
  t.setBold(0, label.length - 1, true);
  t.setFontSize(9.5);
  p.setSpacingBefore(0).setSpacingAfter(1);
  return p;
}

// Judul bagian dengan latar gelap selebar halaman (satu sel tabel).
function sectionHeader(body, text, bg, fg) {
  var tbl = body.appendTable([[text]]);
  var cell = tbl.getRow(0).getCell(0);
  cell.setBackgroundColor(bg);
  var t = cell.editAsText();
  t.setBold(true).setForegroundColor(fg).setFontSize(9.5);
  cell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  return tbl;
}

function setColWidths(table, widths) {
  for (var i = 0; i < widths.length; i++) {
    try { table.setColumnWidth(i, widths[i]); } catch (e) { /* abaikan */ }
  }
}

function styleRow(row, opts) {
  for (var c = 0; c < row.getNumCells(); c++) {
    var cell = row.getCell(c);
    if (opts.bg) cell.setBackgroundColor(opts.bg);
    var t = cell.editAsText();
    if (opts.bold != null) t.setBold(opts.bold);
    if (opts.color) t.setForegroundColor(opts.color);
    if (opts.size) t.setFontSize(opts.size);
    if (opts.align) cell.getChild(0).asParagraph().setAlignment(opts.align);
  }
}

function cellAlign(cell, align) {
  cell.getChild(0).asParagraph().setAlignment(align);
}

function setTableFontSize(table, size) {
  for (var r = 0; r < table.getNumRows(); r++) {
    var row = table.getRow(r);
    for (var c = 0; c < row.getNumCells(); c++) {
      try { row.getCell(c).editAsText().setFontSize(size); } catch (e) { /* sel kosong */ }
    }
  }
}
