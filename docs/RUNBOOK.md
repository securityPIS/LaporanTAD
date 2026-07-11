# Runbook Operasional — LaporanTAD

Dokumen terkait: [BRD.md](BRD.md) · [PRD.md](PRD.md) · [ARSITEKTUR.md](ARSITEKTUR.md) · [TASKS.md](TASKS.md)

Panduan operasional untuk admin & pengelola teknis. Aplikasi berjalan dalam
dua mode:

- **Mode dev/demo** — tanpa kredensial Google. Data disimpan in-memory + berkas
  di `.data/` lokal, login memakai pemilih akun contoh. Cocok untuk uji cepat.
- **Mode produksi** — dengan kredensial Google. Data di Google Spreadsheet,
  berkas di Google Drive, login via Google OAuth, dokumen digenerate oleh GAS.

Peralihan mode **otomatis** berdasarkan keberadaan environment variable
(lihat [`.env.example`](../.env.example)).

---

## 1. Menyiapkan Produksi (dari nol)

Ikuti [TASKS.md](TASKS.md) Fase 0. Ringkas:

1. **Google Cloud** — buat project, aktifkan Sheets API + Drive API, buat
   OAuth consent screen (external) + OAuth Client (redirect `https://<domain>/api/auth/callback/google`
   dan `http://localhost:3000/api/auth/callback/google`).
2. **Service account** — buat + unduh key JSON. Catat email service account.
3. **Spreadsheet** — buat spreadsheet, tambah 14 tab sesuai [ARSITEKTUR §6].
   Bagikan (Editor) ke email service account. Catat ID spreadsheet.
4. **Folder Drive** — buat folder `LaporanTAD/`, bagikan ke service account,
   catat ID folder.
5. **Vercel** — hubungkan repo, set semua env (`.env.example`), deploy `main`.
6. **Seed** — jalankan `npm run seed` (dengan env produksi terisi) untuk mengisi
   perusahaan, master opsi, jenis cuti, settings, dan libur nasional awal.
7. **GAS** — deploy `src/gas/` (lihat [src/gas/README.md](../src/gas/README.md)),
   set `GAS_WEBAPP_URL` & `GAS_SHARED_SECRET` di Vercel.
8. Buka `/health` → harus menampilkan **Sheets OK · Drive OK · GAS OK**.

---

## 2. Tugas Rutin Admin

### Menambah admin
Set `ADMIN_EMAILS` (dipisah koma) di env Vercel **atau** ubah `role` pekerja
menjadi `admin` di **Panel Admin → Master Pekerja**. Perubahan `ADMIN_EMAILS`
butuh redeploy; perubahan via panel langsung berlaku (cache 60 dtk).

### Verifikasi pendaftar
**Panel Admin → Verifikasi**. Setujui → status `active`; Tolak → wajib alasan,
status `rejected`. Pendaftar mengetahui hasil saat login berikutnya (tanpa email).

### Kunci / buka periode
**Panel Admin → Kunci Periode**. Bulan terkunci menolak semua tambah/ubah/hapus
catatan bertanggal pada bulan itu — **termasuk oleh admin**. Untuk koreksi,
buka kunci dulu, perbaiki, lalu kunci kembali. Semua aksi tercatat di Log Audit.

### Ekspor rekap
**Panel Admin → Ekspor** atau tombol Ekspor di tiap halaman rekap. Pilih
jenis (lembur/cuti/dinas), bulan, perusahaan → unduh XLSX atau CSV.

### Sinkron libur nasional
**Panel Admin → Libur Nasional → Sinkron dari sumber publik**. Di produksi,
GAS juga menyinkron otomatis setiap awal tahun. Libur dapat ditambah/koreksi
manual.

### Atur kuota cuti
Default global: `settings.default_kuota_cuti` (Panel Admin → via API settings).
Per pekerja: **Master Pekerja → tombol Kuota**. Saldo hangus tiap pergantian
tahun kalender (tidak di-carry-over).

---

## 3. Pemeliharaan Teknis

### Backup & restore
- **Backup**: GAS `weeklyBackup` menyalin spreadsheet ke `arsip-backup/` tiap
  Senin (menyimpan 8 salinan terbaru).
- **Restore**: salin file backup dari `arsip-backup/`, jadikan spreadsheet
  utama, perbarui `SHEETS_DATABASE_ID` bila ID berubah.

### Rotasi secret
1. `AUTH_SECRET` — buat baru (`openssl rand -base64 32`), set di Vercel, redeploy
   (semua sesi ter-logout).
2. `GAS_SHARED_SECRET` — ubah di Script Properties GAS **dan** env Vercel
   bersamaan agar tidak downtime.
3. Service account key — buat key baru, ganti `GOOGLE_SA_PRIVATE_KEY`, hapus
   key lama setelah verifikasi.

### Batas jam lembur
Nilai `batas_lembur_hari_kerja` (4), `batas_lembur_libur` (12),
`batas_lembur_mingguan` (18) ada di tab `settings` — ubah tanpa deploy ulang.
KJK dikecualikan dari batas hari kerja.

---

## 4. Diagnosa Masalah

| Gejala | Kemungkinan sebab | Tindakan |
|--------|-------------------|----------|
| `/health` Sheets GAGAL | Service account belum dibagikan / ID salah | Cek sharing spreadsheet & `SHEETS_DATABASE_ID` |
| Login berputar ke /register terus | Email login ≠ email di tab `users` | Samakan email, atau daftar ulang |
| Generate dokumen gagal | GAS belum dikonfigurasi / template `gdoc_id` kosong | Set env GAS + isi `gdoc_id` template |
| Upload evidence gagal | Berkas > 5 MB / tipe tak didukung | Gunakan JPG/PNG/PDF ≤ 5 MB |
| "Periode terkunci" saat wajar | Bulan sedang dikunci | Buka kunci di Panel Admin |
| Kuota API Sheets terlampaui | Lonjakan trafik | Cache 60 dtk aktif; tunggu / kurangi polling |

---

## 5. Perintah Berguna

```bash
npm run dev      # server pengembangan (mode dev bila env kosong)
npm run build    # build produksi
npm run seed     # isi data awal ke backend terkonfigurasi
npm test         # unit test (perhitungan jam & hari cuti)
```
