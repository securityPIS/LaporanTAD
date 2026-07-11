# Business Requirements Document (BRD)

## Aplikasi Administrasi Pekerja TAD (Tenaga Alih Daya)

| Informasi Dokumen | |
|---|---|
| **Nama Proyek** | LaporanTAD — Administrasi Pekerja TAD |
| **Versi** | 1.0 (Draft) |
| **Tanggal** | 11 Juli 2026 |
| **Status** | Menunggu review pemilik produk |
| **Dokumen Terkait** | [PRD.md](PRD.md) · [ARSITEKTUR.md](ARSITEKTUR.md) · [TASKS.md](TASKS.md) |

---

## 1. Ringkasan Eksekutif

LaporanTAD adalah aplikasi web untuk mendigitalisasi administrasi pekerja Tenaga Alih Daya (TAD): pencatatan lembur, cuti dengan kuota tahunan, perjalanan dinas, data pekerja terpusat, kalender bersama, dan distribusi dokumen. Aplikasi diakses pekerja melalui ponsel (mobile-first) dan oleh admin melalui desktop, dengan autentikasi tunggal Google Login serta gerbang persetujuan admin untuk setiap pendaftar baru.

Aplikasi dibangun di atas layanan gratis/berbiaya rendah: **Vercel** (aplikasi web), **Google Spreadsheet** (basis data), **Google Drive** (penyimpanan berkas), dan **Google Apps Script** (pembuatan dokumen bertanda tangan & tugas terjadwal).

---

## 2. Latar Belakang & Permasalahan

> ⚠️ Asumsi — mohon dikoreksi bila tidak sesuai kondisi lapangan.

Administrasi pekerja TAD saat ini umumnya dikelola manual (formulir kertas / spreadsheet terpisah / chat WhatsApp), yang menimbulkan masalah:

| # | Masalah | Dampak |
|---|---------|--------|
| P-01 | Catatan lembur tersebar (kertas, chat, file terpisah) | Rekap bulanan untuk pembayaran lambat & rawan selisih |
| P-02 | Aturan lembur pekerja shift (libur nasional, KJK, ganti rekan cuti) tidak terdokumentasi seragam | Kesalahan klasifikasi jenis lembur → sengketa pembayaran |
| P-03 | Bukti (evidence) lembur tidak terarsip rapi | Sulit diverifikasi saat audit |
| P-04 | Data pekerja & kontak darurat tidak terpusat | Respon lambat saat keadaan darurat; data kadaluarsa |
| P-05 | Sisa kuota cuti tidak transparan | Pekerja & admin harus menghitung manual |
| P-06 | Distribusi dokumen (SOP, formulir, template) lewat chat | Versi dokumen tidak terkendali |

---

## 3. Tujuan Bisnis & Sasaran

| ID | Tujuan | Sasaran Terukur |
|----|--------|-----------------|
| G-01 | Satu sumber data (single source of truth) untuk seluruh administrasi TAD | 100% pencatatan lembur/cuti/dinas melalui aplikasi dalam 2 bulan setelah rilis |
| G-02 | Mempercepat rekap lembur bulanan | Rekap per perusahaan tersedia < 5 menit (dari sebelumnya hitungan hari) |
| G-03 | Transparansi kuota cuti | Setiap pekerja dapat melihat sisa cutinya secara mandiri |
| G-04 | Kontrol akses ketat | Hanya pekerja yang diverifikasi admin yang dapat mengakses data |
| G-05 | Arsip bukti lembur tertib | 100% catatan lembur memiliki evidence tersimpan di Drive dengan penamaan terstandar |
| G-06 | Biaya operasional mendekati nol | Berjalan pada tier gratis Vercel + Google Workspace/akun Google biasa |

---

## 4. Ruang Lingkup

### 4.1 Dalam Cakupan (Versi 1)

1. **Autentikasi** — Google Login (satu-satunya metode masuk).
2. **Registrasi & verifikasi** — formulir kelengkapan data pekerja baru; akses aktif setelah disetujui admin.
3. **Lembur** — pencatatan lembur (langsung tercatat, tanpa alur persetujuan), termasuk 3 jenis lembur khusus pekerja shift: Libur Nasional, KJK, dan Lembur Cuti (menggantikan rekan yang cuti); unggah evidence; daftar dikelompokkan bulan → tanggal.
4. **Cuti** — pencatatan cuti dengan kuota tahunan per pekerja, potong saldo otomatis, tampilan sisa saldo.
5. **Dinas** — pencatatan perjalanan dinas.
6. **Data Pekerja** — direktori pekerja (dengan tautan WhatsApp) & profil pribadi.
7. **Kalender** — libur nasional Indonesia + penanda cuti/dinas/lembur.
8. **Dokumen** — repositori dokumen umum yang diunggah admin; generate dokumen dari template (SPKL, SPD, Deklarasi Dinas, Surat Cuti) yang **wajib ditandatangani secara digital** (TTD dipilih/diunggah tiap kali generate).
9. **Admin Panel** — verifikasi pendaftar, master data (template dokumen, data seluruh pekerja, daftar perusahaan, opsi lokasi/divisi/bagian/shift, libur nasional, kuota cuti), kunci periode, ekspor rekap, log audit.


### 4.2 Di Luar Cakupan (Versi 1)

| Item | Catatan |
|------|---------|
| Alur persetujuan lembur/cuti/dinas | Keputusan pemilik produk: cukup pencatatan. Desain data tetap menyiapkan kolom agar mudah ditambahkan nanti |
| Integrasi payroll otomatis | V1 hanya menyediakan ekspor rekap (XLSX/CSV) |
| Notifikasi email & WhatsApp otomatis | Email belum dibutuhkan (dihapus dari cakupan); WhatsApp Business API berbayar. V1 memakai tautan `wa.me` manual saja |
| Enkripsi/proteksi password dokumen & TTD | Diputuskan tidak diperlukan pada V1 |
| Aplikasi native (Android/iOS) | V1 berupa web responsif (PWA-ready) |
| Absensi / kehadiran harian | Beda domain masalah; dapat menjadi fase berikutnya |
| Multi-bahasa | V1 Bahasa Indonesia saja |

---

## 5. Pemangku Kepentingan (Stakeholder)

| Peran | Deskripsi | Kepentingan Utama |
|-------|-----------|-------------------|
| **Admin TAD** | Pengelola administrasi pekerja TAD (pemilik produk) | Data rapi, rekap cepat, kontrol penuh master data |
| **Pekerja TAD** | Pekerja alih daya di 3 lokasi kerja | Catat lembur/cuti cepat dari ponsel, lihat sisa cuti, akses dokumen |
| **Perusahaan penyedia (vendor)** | Perusahaan tempat pekerja TAD bernaung | Rekap lembur/cuti akurat per perusahaan untuk penggajian |
| **Manajemen lokasi kerja** | Pengguna hasil rekap | Visibilitas beban lembur & ketersediaan personel |

---

## 6. Kebutuhan Bisnis

| ID | Kebutuhan Bisnis | Prioritas | Terkait Masalah |
|----|------------------|-----------|-----------------|
| BR-01 | Sentralisasi profil pekerja TAD termasuk kontak darurat | Wajib | P-04 |
| BR-02 | Akses aplikasi hanya untuk pekerja terverifikasi (approval admin atas pendaftar baru) | Wajib | P-04 |
| BR-03 | Pencatatan lembur akurat dengan aturan khusus shift (Libur Nasional / KJK / Lembur Cuti) dan bukti terarsip | Wajib | P-01, P-02, P-03 |
| BR-04 | Pengelolaan cuti dengan kuota tahunan dan saldo transparan | Wajib | P-05 |
| BR-05 | Pencatatan perjalanan dinas | Wajib | P-01 |
| BR-06 | Kalender bersama: libur nasional + kejadian (cuti/dinas/lembur) | Wajib | P-02 |
| BR-07 | Distribusi dokumen & template terpusat dan terkendali; dokumen resmi (SPKL/SPD/Deklarasi Dinas/Surat Cuti) digenerate dari template dan wajib bertanda tangan digital | Wajib | P-06 |
| BR-08 | Rekap bulanan per perusahaan dapat diekspor cepat | Wajib | P-01 |
| BR-09 | Jejak audit atas semua perubahan data + kunci periode agar data bulan berjalan yang sudah direkap tidak berubah | Wajib | P-01, P-03 |
| BR-10 | Direktori pekerja dengan tautan WhatsApp | Sebaiknya | P-04 |
| BR-11 | Biaya infrastruktur ≈ nol (tier gratis) | Wajib | — |

> **Catatan BR-09:** karena transaksi tidak melalui persetujuan, integritas data dijaga dengan dua mekanisme: (1) **log audit** semua perubahan, dan (2) **kunci periode** — admin mengunci bulan yang rekapnya sudah diserahkan sehingga catatan pada bulan itu tidak dapat ditambah/diubah/dihapus.
>
> **Catatan BR-03 — batas jam lembur:** hari kerja maksimal **4 jam**/hari (jenis KJK dikecualikan — boleh melebihi); akhir pekan/tanggal merah maksimal **12 jam**/hari; akumulasi maksimal **18 jam**/minggu. KJK hanya berlaku bagi pekerja shift.

---

## 7. Kriteria Keberhasilan

1. Seluruh pekerja TAD aktif (< 100 orang) terdaftar & terverifikasi dalam 1 bulan pertama.
2. Rekap lembur bulan pertama pasca-rilis dihasilkan dari aplikasi tanpa rekap manual paralel.
3. Nol kehilangan data evidence lembur sejak go-live.
4. Waktu pencatatan satu lembur oleh pekerja ≤ 2 menit dari ponsel.
5. Tidak ada perubahan data pada periode yang sudah dikunci (dibuktikan log audit).

---

## 8. Asumsi

| ID | Asumsi |
|----|--------|
| A-01 | Jumlah pengguna < 100 pekerja; volume transaksi < 3.000 baris/bulan — Google Spreadsheet memadai sebagai basis data |
| A-02 | **KJK = Kelebihan Jam Kerja** — jenis lembur khusus pekerja shift; pada hari kerja boleh melebihi batas 4 jam *(terkonfirmasi 11 Jul 2026)* |
| A-03 | Pendaftar boleh memakai akun Google apa pun (Gmail pribadi); penyaringan dilakukan lewat approval admin, bukan pembatasan domain email |
| A-04 | Satu akun Google = satu pekerja; nopek unik per pekerja |
| A-05 | Admin ditunjuk manual (di-set pada data, bukan mendaftar sebagai admin) |
| A-06 | Zona waktu tunggal: WIB (Asia/Jakarta) |
| A-07 | Daftar libur nasional diambil otomatis dari sumber publik dan dapat dikoreksi admin |
| A-08 | Evidence lembur wajib diunggah (foto/PDF) |
| A-09 | Kuota cuti tahunan default 12 hari, dapat disesuaikan per pekerja oleh admin |

## 9. Batasan (Constraints)

| ID | Batasan |
|----|---------|
| C-01 | Teknologi ditetapkan pemilik produk: Vercel + Google Apps Script + Google Spreadsheet + Google Drive |
| C-02 | Kuota Google API (Sheets/Drive) & Apps Script pada akun gratis — lihat mitigasi di [ARSITEKTUR.md](ARSITEKTUR.md) §10 |
| C-03 | Batas ukuran unggahan pada Vercel serverless ± 4,5 MB per permintaan → kompresi gambar di sisi klien |
| C-04 | Tidak ada anggaran lisensi/berlangganan pada V1 |

## 10. Risiko & Mitigasi

| ID | Risiko | Kemungkinan | Dampak | Mitigasi |
|----|--------|-------------|--------|----------|
| R-01 | Tanpa approval transaksi, data lembur bisa diisi keliru/curang | Sedang | Tinggi | Evidence wajib, log audit, kunci periode, rekap ditinjau admin sebelum diserahkan |
| R-02 | Spreadsheet diedit manual langsung oleh manusia hingga struktur rusak | Sedang | Tinggi | Sheet dilindungi (protected range), hanya service account & admin teknis; backup otomatis mingguan |
| R-03 | Kuota API Google terlampaui | Rendah (skala <100) | Sedang | Caching sisi server, batch read/write |
| R-04 | Kebocoran data pribadi (kontak darurat) | Rendah | Tinggi | Kontak darurat hanya tampil untuk admin & pemilik data; berkas Drive privat (akses via aplikasi, bukan tautan publik) |
| R-05 | Ketergantungan satu admin (bottleneck verifikasi) | Sedang | Rendah | Role admin dapat diberikan ke lebih dari satu akun |
| R-06 | Akun Google pemilik spreadsheet terkunci/hilang | Rendah | Tinggi | Gunakan akun khusus organisasi + backup rutin ke folder terpisah |

---

## 11. Glosarium

| Istilah | Arti |
|---------|------|
| **TAD** | Tenaga Alih Daya — pekerja outsourcing |
| **Nopek** | Nomor Pekerja — identitas unik pekerja |
| **KJK** | Kelebihan Jam Kerja |
| **Lembur Cuti** | Lembur karena menggantikan rekan satu shift yang sedang cuti |
| **Shift / Non-shift** | Pola kerja bergilir vs jam kantor normal |
| **Evidence** | Bukti pelaksanaan lembur (foto/dokumen) |
| **Kunci Periode** | Penguncian data satu bulan oleh admin agar tidak dapat diubah setelah rekap diserahkan |
| **SPKL** | Surat Perintah Kerja Lembur *(digenerate dari template)* |
| **SPD** | Surat Perintah Dinas *(digenerate dari template)* |
| **Deklarasi Dinas** | Surat Rincian Biaya Pengeluaran Dinas *(digenerate dari template)* |
| **Surat Cuti** | Surat keterangan cuti pekerja *(digenerate dari template)* |
| **TTD** | Tanda tangan digital — gambar tanda tangan yang disisipkan ke dokumen saat generate |
| **GAS** | Google Apps Script |
