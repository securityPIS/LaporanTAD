# LaporanTAD — Administrasi Pekerja TAD

Aplikasi web untuk administrasi pekerja Tenaga Alih Daya (TAD): pencatatan
lembur (termasuk 3 jenis lembur shift), cuti berkuota, perjalanan dinas, data
pekerja terpusat, kalender bersama, distribusi & pembuatan dokumen bertanda
tangan digital — dengan autentikasi Google dan gerbang persetujuan admin.

Dibangun sesuai [BRD](docs/BRD.md) · [PRD](docs/PRD.md) ·
[Arsitektur](docs/ARSITEKTUR.md) · [Tasks](docs/TASKS.md).

## Tumpukan Teknologi

| Lapisan | Teknologi |
|---------|-----------|
| Frontend + API | Next.js 15 (App Router, TypeScript) + Tailwind |
| Autentikasi | Auth.js (NextAuth v5) — Google Provider |
| Basis data | Google Spreadsheet (via Sheets API) — *repository pattern* |
| Penyimpanan berkas | Google Drive (via Drive API) |
| Docgen & cron | Google Apps Script (`src/gas/`) |
| Validasi | Zod (skema bersama client & server) |

**Prinsip:** Vercel = otak, Google = gudang, GAS = kurir. Seluruh logika bisnis
& otorisasi di Next.js; Sheets/Drive murni penyimpanan.

## Mode Jalan

Aplikasi berpindah mode **otomatis** berdasarkan environment variable:

- **Dev/demo** (tanpa kredensial Google) — data in-memory + berkas lokal
  `.data/`, login memakai pemilih akun contoh. Langsung jalan tanpa setup:
  ```bash
  npm install && npm run dev   # buka http://localhost:3000
  ```
- **Produksi** (kredensial terisi, lihat [`.env.example`](.env.example)) —
  Google Sheets + Drive + OAuth + GAS. Panduan di [docs/RUNBOOK.md](docs/RUNBOOK.md).

Berkat *repository pattern* (`src/repositories/`) & driver data yang dapat
diganti (`src/lib/db/`), migrasi ke Postgres/Supabase cukup menambah satu driver
tanpa mengubah UI, route, atau skema Zod.

## Struktur

```
src/
├── app/               # halaman (auth, pekerja, admin) + route handlers /api
├── components/         # ui, forms, layout, shared, admin
├── lib/                # auth, db (driver Sheets/memory), storage, cache,
│                       #   period-lock, overtime-rules, audit, settings, gas…
├── repositories/       # akses data per-entitas (users, overtime, leaves, …)
├── schemas/            # Zod (client & server)
└── gas/                # source Apps Script (docgen, cron) — deploy via clasp
scripts/seed.ts         # isi data awal
tests/                  # unit test perhitungan jam & hari cuti
```

## Perintah

```bash
npm run dev     # server pengembangan
npm run build   # build produksi
npm run seed    # isi data awal ke backend terkonfigurasi
npm test        # unit test
```

## Status Implementasi

Seluruh fase [TASKS.md](docs/TASKS.md) (0–7) terimplementasi: fondasi data,
auth & onboarding, lembur (3 jenis shift + batas 4/12/18 jam), kalender & libur,
cuti berkuota & dinas, dokumen + generate bertanda tangan (GAS), panel admin
(verifikasi, master data, kunci periode, ekspor XLSX/CSV, log audit), serta
backup mingguan & runbook. Cek kesehatan koneksi di `/health`.
