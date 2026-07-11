# Google Apps Script — LaporanTAD

Skrip di sini di-*versikan* di repo (ARSITEKTUR §8 poin 5) — tidak ada skrip
"misterius" yang hanya ada di editor GAS. Deploy dengan [clasp](https://github.com/google/clasp).

## Isi

| Berkas | Fungsi |
|--------|--------|
| `docgen.js` | Web App docgen: template Google Docs → PDF + sisip TTD (dipanggil `/api/generate`) |
| `cron.js` | `syncHolidays` (tahunan) & `weeklyBackup` (mingguan) |

## Setup

1. `npm i -g @google/clasp && clasp login`
2. `clasp create --type standalone --title "LaporanTAD-GAS" --rootDir src/gas`
3. Di editor GAS → **Project Settings → Script Properties**, isi:
   - `SHARED_SECRET` — sama dengan `GAS_SHARED_SECRET` di Vercel
   - `ROOT_FOLDER_ID` — ID folder `LaporanTAD/` di Drive
   - `SHEETS_DATABASE_ID` — ID spreadsheet database
4. `clasp push`
5. **Deploy → New deployment → Web app** (Execute as: *Me*, Access: *Anyone*).
   Salin URL ke `GAS_WEBAPP_URL` di Vercel.
6. Jalankan `setupTriggers()` sekali untuk memasang trigger cron.

## Uji

`GET {GAS_WEBAPP_URL}?secret=...&action=ping` → `{ "ok": true }`.
