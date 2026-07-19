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

## Deploy otomatis (CI) — `.github/workflows/deploy-gas.yml`

Setiap perubahan di `src/gas/**` pada `main` (atau via **Run workflow** manual)
akan `clasp push` + `clasp deploy`. Set secret repo di **Settings → Secrets and
variables → Actions**:

| Secret | Isi |
|--------|-----|
| `CLASPRC_JSON` | isi berkas `~/.clasprc.json` dari mesin yang sudah `clasp login` (mengandung *refresh token* — perlakukan seperti kata sandi) |
| `GAS_SCRIPT_ID` | `scriptId` proyek Apps Script (lihat `.clasp.json` lokal atau URL editor GAS) |
| `GAS_DEPLOYMENT_ID` | *(opsional)* ID deployment Web App yang sudah ada, agar **URL tidak berubah**. Lihat dengan `clasp deployments`. Bila kosong, dibuat deployment baru & URL-nya tampil di log — salin ke `GAS_WEBAPP_URL` di Vercel |

Catatan: versi clasp di CI dipin `@google/clasp@3.3.0` — buat `CLASPRC_JSON`
dengan clasp v3 (format `tokens.default`) agar cocok. Aktifkan **Apps Script API**
di https://script.google.com/home/usersettings. Manifest `appsscript.json` sudah
diversikan di `src/gas/`; workflow tetap punya *fallback* mengambilnya dari proyek
remote bila suatu saat hilang.
