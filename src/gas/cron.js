/**
 * LaporanTAD — Google Apps Script: tugas terjadwal (cron).
 *
 * 1. syncHolidays — tarik libur nasional dari sumber publik → tab `holidays`
 *    (trigger tahunan). FR-KAL-04.
 * 2. weeklyBackup — salin spreadsheet database ke folder arsip-backup/,
 *    menyimpan 8 salinan terbaru (trigger mingguan). FR-SYS-03 / T-701.
 *
 * Pasang trigger via setupTriggers() sekali setelah deploy.
 * Script Properties: SHEETS_DATABASE_ID, ROOT_FOLDER_ID.
 */

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("weeklyBackup").timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(2).create();
  ScriptApp.newTrigger("syncHolidays").timeBased().onMonthDay(1).atHour(3).create();
}

function syncHolidays() {
  var year = new Date().getFullYear();
  var ssId = PropertiesService.getScriptProperties().getProperty("SHEETS_DATABASE_ID");
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName("holidays");
  try {
    var res = UrlFetchApp.fetch("https://api-harilibur.vercel.app/api?year=" + year, {
      muteHttpExceptions: true,
    });
    var list = JSON.parse(res.getContentText());
    var existing = {};
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) existing[data[i][1]] = i + 1; // tanggal → baris

    list.forEach(function (h) {
      if (!h.is_national_holiday) return;
      var iso = String(h.holiday_date).slice(0, 10);
      if (existing[iso]) {
        sheet.getRange(existing[iso], 3).setValue(h.holiday_name);
      } else {
        sheet.appendRow([Utilities.getUuid(), iso, h.holiday_name, year, "api"]);
      }
    });
  } catch (err) {
    Logger.log("syncHolidays gagal: " + err);
  }
}

function weeklyBackup() {
  var ssId = PropertiesService.getScriptProperties().getProperty("SHEETS_DATABASE_ID");
  var rootId = PropertiesService.getScriptProperties().getProperty("ROOT_FOLDER_ID");
  var root = DriveApp.getFolderById(rootId);
  var it = root.getFoldersByName("arsip-backup");
  var folder = it.hasNext() ? it.next() : root.createFolder("arsip-backup");

  var stamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
  var src = DriveApp.getFileById(ssId);
  src.makeCopy("LaporanTAD-Backup-" + stamp, folder);

  // Simpan hanya 8 salinan terbaru.
  var backups = [];
  var files = folder.getFiles();
  while (files.hasNext()) backups.push(files.next());
  backups.sort(function (a, b) {
    return b.getDateCreated() - a.getDateCreated();
  });
  for (var i = 8; i < backups.length; i++) backups[i].setTrashed(true);
}
