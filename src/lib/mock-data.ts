// Data contoh (mock) — nilai persis dari LaporanTAD.dc.html.
// Diganti dengan data nyata dari Google Sheets pada fase backend.
import type {
  AdminOvertime,
  CalEvent,
  CurrentUser,
  CutiItem,
  CutiToday,
  DocCat,
  Overtime,
  PendingReg,
  Stat,
  Worker,
} from "./types";

export const CURRENT_USER: CurrentUser = { nama: "Rizky Ramadhan", inisial: "RR" };

export const KUOTA_CUTI = 12;

export const SEED_OVERTIME: Overtime[] = [
  {
    id: "o1",
    tanggal: "2026-07-08",
    jenis: "reguler",
    keterangan: "Penyelesaian laporan bulanan operasional",
    mulai: "18:00",
    selesai: "21:00",
  },
  {
    id: "o2",
    tanggal: "2026-07-05",
    jenis: "kjk",
    keterangan: "Menutup shift malam karena gangguan sistem",
    mulai: "22:00",
    selesai: "06:00",
  },
  {
    id: "o3",
    tanggal: "2026-07-01",
    jenis: "libur_nasional",
    keterangan: "Piket hari libur — pemeliharaan gedung",
    mulai: "08:00",
    selesai: "16:00",
  },
  {
    id: "o4",
    tanggal: "2026-06-21",
    jenis: "cuti",
    keterangan: "Menggantikan rekan yang cuti",
    mulai: "14:00",
    selesai: "22:00",
    replaced: "Andi Pratama",
  },
  {
    id: "o5",
    tanggal: "2026-06-14",
    jenis: "reguler",
    keterangan: "Audit internal kuartal 2",
    mulai: "17:30",
    selesai: "20:30",
  },
];

export const SEED_CUTI: CutiItem[] = [
  {
    id: "c1",
    jenis: "Tahunan",
    potong: true,
    mulai: "2026-05-05",
    selesai: "2026-05-05",
    hari: 1,
    ket: "Keperluan keluarga",
  },
  {
    id: "c2",
    jenis: "Sakit",
    potong: false,
    mulai: "2026-03-18",
    selesai: "2026-03-19",
    hari: 2,
    ket: "Demam — surat dokter terlampir",
  },
  {
    id: "c3",
    jenis: "Tahunan",
    potong: true,
    mulai: "2026-02-12",
    selesai: "2026-02-14",
    hari: 3,
    ket: "Liburan keluarga tahunan",
  },
];

export const CAL_EVENTS: CalEvent[] = [
  { iso: "2026-07-01", type: "lembur", label: "Lembur piket libur (8,00 jam)" },
  { iso: "2026-07-05", type: "lembur", label: "Lembur KJK (8,00 jam)" },
  { iso: "2026-07-08", type: "lembur", label: "Lembur reguler (3,00 jam)" },
  { iso: "2026-07-09", type: "cuti", label: "Andi Pratama — Cuti Tahunan" },
  { iso: "2026-07-13", type: "cuti", label: "Rencana cuti Anda — Tahunan" },
  { iso: "2026-07-15", type: "dinas", label: "Dinas ke Surabaya — koordinasi vendor" },
  { iso: "2026-07-16", type: "dinas", label: "Dinas ke Surabaya (hari ke-2)" },
  { iso: "2026-07-17", type: "dinas", label: "Dinas ke Surabaya (hari ke-3)" },
  { iso: "2026-07-20", type: "libur", label: "Cuti Bersama (libur nasional)" },
];

export const ADMIN_OVERTIME: AdminOvertime[] = [
  { nama: "Rizky Ramadhan", nopek: "TAD-0421", perusahaan: "PT Sigap Prima", lokasi: "Patra Jasa", tanggal: "2026-07-08", jenis: "reguler", mulai: "18:00", selesai: "21:00" },
  { nama: "Andi Pratama", nopek: "TAD-0388", perusahaan: "PT Sigap Prima", lokasi: "Patra Jasa", tanggal: "2026-07-08", jenis: "kjk", mulai: "22:00", selesai: "05:30" },
  { nama: "Dewi Lestari", nopek: "TAD-0405", perusahaan: "PT Karya Andalan", lokasi: "Logistic Sunter", tanggal: "2026-07-07", jenis: "libur_nasional", mulai: "08:00", selesai: "17:00" },
  { nama: "Budi Santoso", nopek: "TAD-0311", perusahaan: "PT Sigap Prima", lokasi: "Grha Pertamina", tanggal: "2026-07-07", jenis: "reguler", mulai: "17:00", selesai: "20:00" },
  { nama: "Siti Rahayu", nopek: "TAD-0499", perusahaan: "PT Karya Andalan", lokasi: "Logistic Sunter", tanggal: "2026-07-06", jenis: "cuti", mulai: "14:00", selesai: "22:00" },
  { nama: "Eko Nugroho", nopek: "TAD-0276", perusahaan: "PT Bina Sejahtera", lokasi: "Patra Jasa", tanggal: "2026-07-06", jenis: "reguler", mulai: "18:30", selesai: "21:30" },
  { nama: "Maya Anggraini", nopek: "TAD-0450", perusahaan: "PT Sigap Prima", lokasi: "Grha Pertamina", tanggal: "2026-07-05", jenis: "kjk", mulai: "23:00", selesai: "07:00" },
  { nama: "Fajar Hidayat", nopek: "TAD-0362", perusahaan: "PT Bina Sejahtera", lokasi: "Logistic Sunter", tanggal: "2026-07-05", jenis: "reguler", mulai: "16:00", selesai: "19:30" },
  { nama: "Rizky Ramadhan", nopek: "TAD-0421", perusahaan: "PT Sigap Prima", lokasi: "Patra Jasa", tanggal: "2026-07-01", jenis: "libur_nasional", mulai: "08:00", selesai: "16:00" },
  { nama: "Dewi Lestari", nopek: "TAD-0405", perusahaan: "PT Karya Andalan", lokasi: "Logistic Sunter", tanggal: "2026-07-01", jenis: "reguler", mulai: "18:00", selesai: "20:00" },
];

export const WORKERS: Worker[] = [
  { nama: "Rizky Ramadhan", nopek: "TAD-0421", perusahaan: "PT Sigap Prima", lokasi: "Patra Jasa", divisi: "Operasional / Fasilitas", pola: "Shift B", status: "active" },
  { nama: "Andi Pratama", nopek: "TAD-0388", perusahaan: "PT Sigap Prima", lokasi: "Patra Jasa", divisi: "Operasional / Fasilitas", pola: "Shift B", status: "active" },
  { nama: "Dewi Lestari", nopek: "TAD-0405", perusahaan: "PT Karya Andalan", lokasi: "Logistic Sunter", divisi: "Gudang / Inbound", pola: "Shift A", status: "active" },
  { nama: "Budi Santoso", nopek: "TAD-0311", perusahaan: "PT Sigap Prima", lokasi: "Grha Pertamina", divisi: "Umum / Resepsionis", pola: "Non-shift", status: "active" },
  { nama: "Siti Rahayu", nopek: "TAD-0499", perusahaan: "PT Karya Andalan", lokasi: "Logistic Sunter", divisi: "Gudang / Outbound", pola: "Shift C", status: "active" },
  { nama: "Eko Nugroho", nopek: "TAD-0276", perusahaan: "PT Bina Sejahtera", lokasi: "Patra Jasa", divisi: "Teknik / ME", pola: "Shift D", status: "inactive" },
  { nama: "Maya Anggraini", nopek: "TAD-0450", perusahaan: "PT Sigap Prima", lokasi: "Grha Pertamina", divisi: "Umum / Administrasi", pola: "Non-shift", status: "active" },
  { nama: "Fajar Hidayat", nopek: "TAD-0362", perusahaan: "PT Bina Sejahtera", lokasi: "Logistic Sunter", divisi: "Gudang / Inbound", pola: "Shift A", status: "pending" },
];

export const PENDING_REGS: PendingReg[] = [
  { ini: "FH", nama: "Fajar Hidayat", sub: "TAD-0362 · PT Bina Sejahtera · Shift A" },
  { ini: "NW", nama: "Nadia Wulandari", sub: "TAD-0512 · PT Sigap Prima · Non-shift" },
  { ini: "RA", nama: "Rahmat Aditya", sub: "TAD-0518 · PT Karya Andalan · Shift C" },
];

export const CUTI_TODAY: CutiToday[] = [
  { nama: "Siti Rahayu", sub: "Logistic Sunter · sampai 8 Jul", jenis: "Tahunan" },
  { nama: "Andi Pratama", sub: "Patra Jasa · 1 hari", jenis: "Tahunan" },
  { nama: "Joko Susilo", sub: "Grha Pertamina · surat dokter", jenis: "Sakit" },
];

export const DOC_CATS: DocCat[] = [
  {
    name: "SOP & Kebijakan",
    items: [
      { judul: "SOP Pencatatan Lembur v2", ext: "PDF", bg: "var(--libur-weak)", fg: "var(--libur)", meta: "PDF · 480 KB · 12 Jun 2026" },
      { judul: "Kebijakan Cuti Tahunan 2026", ext: "PDF", bg: "var(--libur-weak)", fg: "var(--libur)", meta: "PDF · 210 KB · 3 Jan 2026" },
    ],
  },
  {
    name: "Formulir",
    items: [
      { judul: "Formulir Klaim Transport Dinas", ext: "DOC", bg: "var(--accent-weak)", fg: "var(--accent)", meta: "DOCX · 88 KB · 20 Mei 2026" },
    ],
  },
  {
    name: "Pengumuman",
    items: [
      { judul: "Jadwal Shift Juli 2026", ext: "XLS", bg: "var(--lembur-weak)", fg: "var(--lembur)", meta: "XLSX · 45 KB · 28 Jun 2026" },
    ],
  },
];

export const ADMIN_STATS: Stat[] = [
  { icon: "users", value: "3", label: "Pendaftar menunggu", bg: "var(--accent-weak)", fg: "var(--accent)", trend: "perlu tindakan", trendColor: "var(--cuti)" },
  { icon: "badge", value: "87", label: "Pekerja aktif", bg: "var(--lembur-weak)", fg: "var(--lembur)", trend: "+4 bln ini", trendColor: "var(--lembur)" },
  { icon: "clock", value: "1.240", label: "Jam lembur Juli", bg: "var(--dinas-weak)", fg: "var(--dinas)", trend: "+12%", trendColor: "var(--lembur)" },
  { icon: "cal", value: "4", label: "Cuti hari ini", bg: "var(--cuti-weak)", fg: "var(--cuti)", trend: "2 shift", trendColor: "var(--muted)" },
];

/** Sisa kuota lembur mingguan (contoh statis dari desain). */
export const SISA_MINGGU = "10:00";
