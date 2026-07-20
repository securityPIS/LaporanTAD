// Data awal (seed) yang dapat diulang — dipakai driver memory (auto) &
// skrip `npm run seed` (menulis ke Sheets). Nilai selaras dengan komp desain.
import type {
  CompanyRow,
  DocTemplateRow,
  DocumentRow,
  HolidayRow,
  LeaveBalanceRow,
  LeaveRow,
  LeaveTypeRow,
  MasterOptionRow,
  OvertimeRow,
  SettingRow,
  TableMap,
  TripCostRow,
  TripRow,
  UserRow,
} from "./db/tables";

const T = "2026-07-11T09:00:00+07:00";

function user(p: Partial<UserRow> & Pick<UserRow, "id" | "email" | "nama_lengkap" | "nopek">): UserRow {
  return {
    company_id: "cmp_sigap",
    lokasi_kerja: "Patra Jasa Office Tower",
    divisi: "Operasional",
    bagian: "Fasilitas",
    tipe_kerja: "shift",
    nama_shift: "B",
    no_telp: "6281200000000",
    darurat_alamat: "Jl. Contoh No. 1, Jakarta",
    darurat_telp: "6281300000000",
    darurat_hubungan: "Orang Tua",
    foto_url: "",
    ttd_file_id: "",
    role: "pekerja",
    status: "active",
    alasan_tolak: "",
    approved_by: "admin@laporantad.app",
    approved_at: T,
    created_at: T,
    updated_at: T,
    ...p,
  } as UserRow;
}

const companies: CompanyRow[] = [
  { id: "cmp_sigap", nama: "PT Sigap Prima Astria", pic_nama: "Hendra", pic_telp: "6281111111111", alamat: "Jakarta", active: true, created_at: T },
  { id: "cmp_karya", nama: "PT Karya Andalan", pic_nama: "Wati", pic_telp: "6282222222222", alamat: "Jakarta", active: true, created_at: T },
  { id: "cmp_bina", nama: "PT Bina Sejahtera", pic_nama: "Rudi", pic_telp: "6283333333333", alamat: "Jakarta", active: true, created_at: T },
];

const opt = (kategori: MasterOptionRow["kategori"], nilai: string, urutan: number): MasterOptionRow => ({
  id: `opt_${kategori}_${urutan}`,
  kategori,
  nilai,
  urutan,
  active: true,
});

const master_options: MasterOptionRow[] = [
  opt("lokasi", "Patra Jasa Office Tower", 1),
  opt("lokasi", "Logistic Sunter", 2),
  opt("lokasi", "Grha Pertamina", 3),
  opt("divisi", "Operasional", 1),
  opt("divisi", "Gudang", 2),
  opt("divisi", "Umum", 3),
  opt("divisi", "Teknik", 4),
  opt("bagian", "Fasilitas", 1),
  opt("bagian", "Inbound", 2),
  opt("bagian", "Outbound", 3),
  opt("bagian", "Resepsionis", 4),
  opt("bagian", "Administrasi", 5),
  opt("bagian", "ME", 6),
  opt("shift", "A", 1),
  opt("shift", "B", 2),
  opt("shift", "C", 3),
  opt("shift", "D", 4),
  opt("hubungan_darurat", "Orang Tua", 1),
  opt("hubungan_darurat", "Suami/Istri", 2),
  opt("hubungan_darurat", "Anak", 3),
  opt("hubungan_darurat", "Saudara", 4),
  opt("hubungan_darurat", "Lainnya", 5),
  opt("kategori_dokumen", "SOP & Kebijakan", 1),
  opt("kategori_dokumen", "Formulir", 2),
  opt("kategori_dokumen", "Pengumuman", 3),
  opt("kategori_dokumen", "Lainnya", 4),
];

const leave_types: LeaveTypeRow[] = [
  { id: "lt_tahunan", nama: "Tahunan", potong_saldo: true, wajib_lampiran: false, active: true },
  { id: "lt_sakit", nama: "Sakit", potong_saldo: false, wajib_lampiran: true, active: true },
  { id: "lt_izin", nama: "Izin Khusus", potong_saldo: false, wajib_lampiran: false, active: true },
];

const settings: SettingRow[] = [
  { key: "default_kuota_cuti", value: "12", keterangan: "Kuota cuti tahunan default (hari)" },
  { key: "batas_lembur_hari_kerja", value: "4", keterangan: "Batas jam lembur hari kerja (KJK dikecualikan)" },
  { key: "batas_lembur_libur", value: "12", keterangan: "Batas jam lembur akhir pekan/libur nasional" },
  { key: "batas_lembur_mingguan", value: "18", keterangan: "Batas akumulasi jam lembur per minggu" },
];

// Libur nasional Indonesia 2026 (dapat dikoreksi admin — sumber `manual`).
const HOL_2026: [string, string][] = [
  ["2026-01-01", "Tahun Baru Masehi"],
  ["2026-01-17", "Isra Mikraj"],
  ["2026-02-17", "Tahun Baru Imlek"],
  ["2026-03-19", "Hari Suci Nyepi"],
  ["2026-03-21", "Idulfitri 1447 H"],
  ["2026-03-22", "Idulfitri 1447 H (hari ke-2)"],
  ["2026-04-03", "Wafat Isa Almasih"],
  ["2026-05-01", "Hari Buruh Internasional"],
  ["2026-05-14", "Kenaikan Isa Almasih"],
  ["2026-05-27", "Iduladha 1447 H"],
  ["2026-05-31", "Hari Raya Waisak"],
  ["2026-06-01", "Hari Lahir Pancasila"],
  ["2026-06-17", "Tahun Baru Islam 1448 H"],
  ["2026-07-20", "Cuti Bersama"],
  ["2026-08-17", "Hari Kemerdekaan RI"],
  ["2026-08-26", "Maulid Nabi Muhammad SAW"],
  ["2026-12-25", "Hari Raya Natal"],
];
const holidays: HolidayRow[] = HOL_2026.map(([tanggal, nama], i) => ({
  id: `hol_2026_${i + 1}`,
  tanggal,
  nama,
  tahun: 2026,
  sumber: "manual",
}));

const users: UserRow[] = [
  user({ id: "usr_admin", email: "admin@laporantad.app", nama_lengkap: "Administrator TAD", nopek: "TAD-0001", role: "admin", tipe_kerja: "nonshift", nama_shift: "", divisi: "Umum", bagian: "Administrasi" }),
  user({ id: "usr_rizky", email: "rizky@example.com", nama_lengkap: "Rizky Ramadhan", nopek: "TAD-0421", lokasi_kerja: "Patra Jasa Office Tower", divisi: "Operasional", bagian: "Fasilitas", nama_shift: "B" }),
  user({ id: "usr_andi", email: "andi@example.com", nama_lengkap: "Andi Pratama", nopek: "TAD-0388", lokasi_kerja: "Patra Jasa Office Tower", divisi: "Operasional", bagian: "Fasilitas", nama_shift: "B" }),
  user({ id: "usr_dewi", email: "dewi@example.com", nama_lengkap: "Dewi Lestari", nopek: "TAD-0405", company_id: "cmp_karya", lokasi_kerja: "Logistic Sunter", divisi: "Gudang", bagian: "Inbound", nama_shift: "A" }),
  user({ id: "usr_budi", email: "budi@example.com", nama_lengkap: "Budi Santoso", nopek: "TAD-0311", lokasi_kerja: "Grha Pertamina", divisi: "Umum", bagian: "Resepsionis", tipe_kerja: "nonshift", nama_shift: "" }),
  user({ id: "usr_siti", email: "siti@example.com", nama_lengkap: "Siti Rahayu", nopek: "TAD-0499", company_id: "cmp_karya", lokasi_kerja: "Logistic Sunter", divisi: "Gudang", bagian: "Outbound", nama_shift: "C" }),
  user({ id: "usr_eko", email: "eko@example.com", nama_lengkap: "Eko Nugroho", nopek: "TAD-0276", company_id: "cmp_bina", lokasi_kerja: "Patra Jasa Office Tower", divisi: "Teknik", bagian: "ME", nama_shift: "D", status: "inactive" }),
  user({ id: "usr_maya", email: "maya@example.com", nama_lengkap: "Maya Anggraini", nopek: "TAD-0450", lokasi_kerja: "Grha Pertamina", divisi: "Umum", bagian: "Administrasi", tipe_kerja: "nonshift", nama_shift: "" }),
  // Pendaftar menunggu verifikasi (status pending)
  user({ id: "usr_fajar", email: "fajar@example.com", nama_lengkap: "Fajar Hidayat", nopek: "TAD-0362", company_id: "cmp_bina", lokasi_kerja: "Logistic Sunter", divisi: "Gudang", bagian: "Inbound", nama_shift: "A", status: "pending", approved_by: "", approved_at: "" }),
  user({ id: "usr_nadia", email: "nadia@example.com", nama_lengkap: "Nadia Wulandari", nopek: "TAD-0512", lokasi_kerja: "Patra Jasa Office Tower", divisi: "Umum", bagian: "Administrasi", tipe_kerja: "nonshift", nama_shift: "", status: "pending", approved_by: "", approved_at: "" }),
  user({ id: "usr_rahmat", email: "rahmat@example.com", nama_lengkap: "Rahmat Aditya", nopek: "TAD-0518", company_id: "cmp_karya", lokasi_kerja: "Logistic Sunter", divisi: "Gudang", bagian: "Outbound", nama_shift: "C", status: "pending", approved_by: "", approved_at: "" }),
];

const overtime: OvertimeRow[] = [
  ot("ovt_1", "usr_rizky", "2026-07-08", "reguler", "18:00", "21:00", "Penyelesaian laporan bulanan operasional"),
  ot("ovt_2", "usr_rizky", "2026-07-05", "kjk", "22:00", "06:00", "Menutup shift malam karena gangguan sistem"),
  ot("ovt_3", "usr_rizky", "2026-07-01", "libur_nasional", "08:00", "16:00", "Piket hari libur — pemeliharaan gedung", { holiday_id: "" }),
  ot("ovt_4", "usr_rizky", "2026-06-21", "cuti", "14:00", "22:00", "Menggantikan rekan yang cuti", { replaced_user_id: "usr_andi" }),
  ot("ovt_5", "usr_rizky", "2026-06-14", "reguler", "17:30", "20:30", "Audit internal kuartal 2"),
];

function ot(
  id: string,
  user_id: string,
  tanggal: string,
  jenis: OvertimeRow["jenis"],
  jam_mulai: string,
  jam_selesai: string,
  keterangan: string,
  extra: Partial<OvertimeRow> = {},
): OvertimeRow {
  const total = totalJam(jam_mulai, jam_selesai);
  return {
    id, user_id, tanggal, jenis,
    holiday_id: "", replaced_user_id: "", keterangan,
    jam_mulai, jam_selesai, total_jam: total,
    evidence_file_id: "", status: "tercatat",
    created_at: T, updated_at: T, ...extra,
  };
}

function totalJam(a: string, b: string): number {
  const [sh, sm] = a.split(":").map(Number);
  const [eh, em] = b.split(":").map(Number);
  let d = eh * 60 + em - (sh * 60 + sm);
  if (d <= 0) d += 1440;
  return Math.round((d / 60) * 100) / 100;
}

const leaves: LeaveRow[] = [
  { id: "lv_1", user_id: "usr_rizky", leave_type_id: "lt_tahunan", tanggal_mulai: "2026-05-05", tanggal_selesai: "2026-05-05", jumlah_hari: 1, keterangan: "Keperluan keluarga", lampiran_file_id: "", status: "tercatat", created_at: T, updated_at: T },
  { id: "lv_2", user_id: "usr_rizky", leave_type_id: "lt_sakit", tanggal_mulai: "2026-03-18", tanggal_selesai: "2026-03-19", jumlah_hari: 2, keterangan: "Demam — surat dokter terlampir", lampiran_file_id: "", status: "tercatat", created_at: T, updated_at: T },
  { id: "lv_3", user_id: "usr_rizky", leave_type_id: "lt_tahunan", tanggal_mulai: "2026-02-12", tanggal_selesai: "2026-02-14", jumlah_hari: 3, keterangan: "Liburan keluarga tahunan", lampiran_file_id: "", status: "tercatat", created_at: T, updated_at: T },
  { id: "lv_4", user_id: "usr_andi", leave_type_id: "lt_tahunan", tanggal_mulai: "2026-06-21", tanggal_selesai: "2026-06-21", jumlah_hari: 1, keterangan: "Cuti tahunan", lampiran_file_id: "", status: "tercatat", created_at: T, updated_at: T },
];

// Tiga contoh dinas menempuh tiap fase siklus hidup: Bandung selesai (SPD +
// Deklarasi terbit, ada rincian biaya), Surabaya sedang berjalan (SPD terbit,
// menunggu deklarasi), Semarang baru direncanakan (perlu SPD).
const trips: TripRow[] = [
  {
    id: "trp_1", user_id: "usr_rizky", tujuan: "Surabaya",
    tanggal_mulai: "2026-07-18", tanggal_selesai: "2026-07-20",
    keperluan: "Koordinasi vendor infrastruktur", transportasi: "Pesawat",
    keterangan: "", lampiran_file_id: "", status: "spd_terbit",
    tanggal_realisasi_mulai: "", tanggal_realisasi_selesai: "", deklarasi_catatan: "",
    deklarasi_sifat: "", deklarasi_kendaraan_pribadi: false,
    created_at: "2026-07-14T09:00:00+07:00", updated_at: "2026-07-16T09:00:00+07:00",
  },
  {
    id: "trp_2", user_id: "usr_rizky", tujuan: "Bandung",
    tanggal_mulai: "2026-07-05", tanggal_selesai: "2026-07-06",
    keperluan: "Audit mutu triwulan", transportasi: "Kereta",
    keterangan: "", lampiran_file_id: "", status: "selesai",
    tanggal_realisasi_mulai: "2026-07-05", tanggal_realisasi_selesai: "2026-07-06",
    deklarasi_catatan: "Sesuai rencana.",
    deklarasi_sifat: "non_residensial", deklarasi_kendaraan_pribadi: false,
    created_at: "2026-07-01T09:00:00+07:00", updated_at: "2026-07-07T09:00:00+07:00",
  },
  {
    id: "trp_3", user_id: "usr_rizky", tujuan: "Semarang",
    tanggal_mulai: "2026-07-28", tanggal_selesai: "2026-07-29",
    keperluan: "Pelatihan sistem baru", transportasi: "",
    keterangan: "", lampiran_file_id: "", status: "draft",
    tanggal_realisasi_mulai: "", tanggal_realisasi_selesai: "", deklarasi_catatan: "",
    deklarasi_sifat: "", deklarasi_kendaraan_pribadi: false,
    created_at: "2026-07-17T09:00:00+07:00", updated_at: "2026-07-17T09:00:00+07:00",
  },
];

const trip_costs: TripCostRow[] = [
  { id: "tc_1", trip_id: "trp_2", user_id: "usr_rizky", komponen: "Transportasi Umum (Kereta PP)", keterangan: "Tiket kereta PP", vol: 1, tarif: 1200000, jumlah: 1200000, bukti_file_id: "", urutan: 1, created_at: "2026-07-07T09:00:00+07:00" },
  { id: "tc_2", trip_id: "trp_2", user_id: "usr_rizky", komponen: "Akomodasi Penginapan", keterangan: "1 malam", vol: 1, tarif: 900000, jumlah: 900000, bukti_file_id: "", urutan: 2, created_at: "2026-07-07T09:00:00+07:00" },
  { id: "tc_3", trip_id: "trp_2", user_id: "usr_rizky", komponen: "Uang Harian", keterangan: "2 hari", vol: 2, tarif: 150000, jumlah: 300000, bukti_file_id: "", urutan: 3, created_at: "2026-07-07T09:00:00+07:00" },
];

const leave_balances: LeaveBalanceRow[] = users
  .filter((u) => u.role === "pekerja")
  .map((u) => ({ id: `lb_${u.id}`, user_id: u.id, tahun: 2026, kuota: 12, penyesuaian: 0, catatan: "", updated_at: T }));

const doc_templates: DocTemplateRow[] = [
  { id: "tpl_spkl", nama: "SPKL — Surat Perintah Kerja Lembur", jenis: "spkl", gdoc_id: "", keterangan: "Placeholder: {{nama}},{{nopek}},{{tanggal}},{{jam}},{{total_jam}},{{ttd}}", active: true, created_at: T },
  { id: "tpl_spd", nama: "SPD — Surat Perintah Dinas", jenis: "spd", gdoc_id: "", keterangan: "Placeholder: {{nama}},{{nopek}},{{tujuan}},{{tanggal_mulai}},{{tanggal_selesai}},{{ttd}}", active: true, created_at: T },
  { id: "tpl_dekl", nama: "Deklarasi Dinas — Rincian Biaya", jenis: "deklarasi_dinas", gdoc_id: "", keterangan: "Placeholder: {{nama}},{{nopek}},{{tujuan}},{{rincian}},{{ttd}}", active: true, created_at: T },
  { id: "tpl_cuti", nama: "Surat Cuti", jenis: "surat_cuti", gdoc_id: "", keterangan: "Placeholder: {{nama}},{{nopek}},{{jenis_cuti}},{{tanggal_mulai}},{{tanggal_selesai}},{{ttd}}", active: true, created_at: T },
];

const documents: DocumentRow[] = [
  { id: "doc_1", judul: "SOP Pencatatan Lembur v2", kategori: "umum", jenis_dok: "-", sumber_entitas: "SOP & Kebijakan", sumber_id: "", file_id: "", mime: "application/pdf", ukuran: 491520, uploaded_by: "admin@laporantad.app", signed_by: "", created_at: "2026-06-12T09:00:00+07:00" },
  { id: "doc_2", judul: "Kebijakan Cuti Tahunan 2026", kategori: "umum", jenis_dok: "-", sumber_entitas: "SOP & Kebijakan", sumber_id: "", file_id: "", mime: "application/pdf", ukuran: 215040, uploaded_by: "admin@laporantad.app", signed_by: "", created_at: "2026-01-03T09:00:00+07:00" },
  { id: "doc_3", judul: "Formulir Klaim Transport Dinas", kategori: "umum", jenis_dok: "-", sumber_entitas: "Formulir", sumber_id: "", file_id: "", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ukuran: 90112, uploaded_by: "admin@laporantad.app", signed_by: "", created_at: "2026-05-20T09:00:00+07:00" },
  { id: "doc_4", judul: "Jadwal Shift Juli 2026", kategori: "umum", jenis_dok: "-", sumber_entitas: "Pengumuman", sumber_id: "", file_id: "", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ukuran: 46080, uploaded_by: "admin@laporantad.app", signed_by: "", created_at: "2026-06-28T09:00:00+07:00" },
  // Dokumen dinas tergenerate — menandai SPD/Deklarasi yang sudah terbit.
  { id: "doc_spd_1", judul: "Surat Perintah Dinas (SPD) — Rizky Pratama", kategori: "generated", jenis_dok: "spd", sumber_entitas: "trips", sumber_id: "trp_1", file_id: "", mime: "application/pdf", ukuran: 84000, uploaded_by: "rizky@example.com", signed_by: "rizky@example.com", created_at: "2026-07-16T09:00:00+07:00" },
  { id: "doc_spd_2", judul: "Surat Perintah Dinas (SPD) — Rizky Pratama", kategori: "generated", jenis_dok: "spd", sumber_entitas: "trips", sumber_id: "trp_2", file_id: "", mime: "application/pdf", ukuran: 84000, uploaded_by: "rizky@example.com", signed_by: "rizky@example.com", created_at: "2026-07-03T09:00:00+07:00" },
  { id: "doc_dek_2", judul: "Deklarasi Dinas — Rincian Biaya — Rizky Pratama", kategori: "generated", jenis_dok: "deklarasi_dinas", sumber_entitas: "trips", sumber_id: "trp_2", file_id: "", mime: "application/pdf", ukuran: 96000, uploaded_by: "rizky@example.com", signed_by: "rizky@example.com", created_at: "2026-07-07T10:00:00+07:00" },
];

/** Bangun seluruh dataset seed. */
export function buildSeed(): { [K in keyof TableMap]: TableMap[K][] } {
  return {
    users,
    companies,
    master_options,
    overtime,
    leaves,
    leave_types,
    leave_balances,
    trips,
    trip_costs,
    holidays,
    documents,
    doc_templates,
    period_locks: [],
    settings,
    audit_log: [],
  };
}
