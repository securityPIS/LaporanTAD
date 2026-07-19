/**
 * LaporanTAD — Google Apps Script: pembuatan dokumen (docgen).
 *
 * Web App yang dipanggil Next.js (`/api/generate`) dengan shared secret.
 * Tugas: copy template Google Docs → replace placeholder {{...}} → sisipkan
 * gambar TTD pada {{ttd}} → export PDF (tanpa proteksi) → simpan ke Drive →
 * balas file_id. Ini satu-satunya tempat GAS menjalankan logika (ARSITEKTUR §3).
 *
 * Deploy: `clasp push && clasp deploy`. Simpan URL & secret ke env Vercel.
 * Script Properties yang diperlukan: SHARED_SECRET, ROOT_FOLDER_ID.
 */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== getSecret()) {
      return json({ error: "unauthorized" });
    }
    if (body.action === "generate") {
      return json(generateDoc(body));
    }
    return json({ error: "unknown action" });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function doGet(e) {
  var params = e.parameter || {};
  if (params.secret !== getSecret()) return json({ error: "unauthorized" });
  if (params.action === "ping") return json({ ok: true, ts: new Date().toISOString() });
  return json({ ok: true });
}

function getSecret() {
  return PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
}

function generateDoc(payload) {
  var template = DriveApp.getFileById(payload.gdoc_id);
  var copy = template.makeCopy(payload.output_name.replace(/\.pdf$/, ""));
  var doc = DocumentApp.openById(copy.getId());
  var bodyEl = doc.getBody();

  // Ganti placeholder teks {{key}}.
  var ph = payload.placeholders || {};
  Object.keys(ph).forEach(function (key) {
    bodyEl.replaceText("\\{\\{" + key + "\\}\\}", String(ph[key] == null ? "" : ph[key]));
  });

  // Baris tabel berulang {{@key}} (mis. daftar lembur pada SPKL).
  fillRepeatingRows(bodyEl, payload.rows);

  // Sisipkan gambar TTD pada {{ttd}}.
  var ttdBlob = resolveTtdBlob(payload);
  if (ttdBlob) {
    var found = bodyEl.findText("\\{\\{ttd\\}\\}");
    if (found) {
      var el = found.getElement();
      var parent = el.getParent();
      el.asText().setText("");
      var img = parent.asParagraph().appendInlineImage(ttdBlob);
      img.setWidth(160).setHeight(60);
    }
  }

  doc.saveAndClose();

  // Export PDF ke folder tujuan.
  var pdf = DriveApp.getFileById(copy.getId()).getAs("application/pdf");
  pdf.setName(payload.output_name);
  var folder = ensureFolderPath(payload.output_folder);
  var saved = folder.createFile(pdf);
  DriveApp.getFileById(copy.getId()).setTrashed(true); // buang salinan Docs

  return {
    file_id: saved.getId(),
    name: saved.getName(),
    mime: "application/pdf",
    size: saved.getSize(),
  };
}

/**
 * Gandakan baris tabel penanda untuk tiap item `rows`.
 * Baris template = baris tabel pertama yang memuat placeholder {{@field}}.
 * Untuk tiap objek di `rows`, baris disalin & {{@key}} diganti nilainya;
 * baris template asli dihapus setelah semua salinan tersisip.
 */
function fillRepeatingRows(bodyEl, rows) {
  if (!rows || !rows.length) return;
  var tables = bodyEl.getTables();
  for (var t = 0; t < tables.length; t++) {
    var table = tables[t];
    var tplIndex = -1;
    for (var r = 0; r < table.getNumRows(); r++) {
      if (/\{\{@\w+\}\}/.test(table.getRow(r).getText())) {
        tplIndex = r;
        break;
      }
    }
    if (tplIndex === -1) continue;

    var tplRow = table.getRow(tplIndex);
    for (var i = 0; i < rows.length; i++) {
      var copy = tplRow.copy();
      var data = rows[i] || {};
      Object.keys(data).forEach(function (key) {
        copy.replaceText("\\{\\{@" + key + "\\}\\}", String(data[key] == null ? "" : data[key]));
      });
      table.insertTableRow(tplIndex + i, copy);
    }
    table.removeRow(tplIndex + rows.length); // buang baris template
    return; // cukup tabel pertama yang cocok
  }
}

function resolveTtdBlob(payload) {
  if (payload.ttd_file_id) {
    return DriveApp.getFileById(payload.ttd_file_id).getBlob();
  }
  if (payload.ttd_data_url) {
    var m = String(payload.ttd_data_url).match(/^data:(image\/\w+);base64,(.+)$/);
    if (m) {
      var bytes = Utilities.base64Decode(m[2]);
      return Utilities.newBlob(bytes, m[1], "ttd.png");
    }
  }
  return null;
}

function ensureFolderPath(path) {
  var rootId = PropertiesService.getScriptProperties().getProperty("ROOT_FOLDER_ID");
  var folder = DriveApp.getFolderById(rootId);
  path.split("/").filter(Boolean).forEach(function (seg) {
    var it = folder.getFoldersByName(seg);
    folder = it.hasNext() ? it.next() : folder.createFolder(seg);
  });
  return folder;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
