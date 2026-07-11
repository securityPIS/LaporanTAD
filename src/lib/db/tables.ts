// Skema tabel (1 tab spreadsheet = 1 tabel) sesuai ARSITEKTUR.md §6.
// Nilai boolean disimpan sebagai TRUE/FALSE; tanggal ISO; angka sebagai string
// di Sheets namun dinormalisasi ke tipe berikut oleh lapisan repository.

export type Role = "admin" | "pekerja";
export type UserStatus = "pending" | "active" | "rejected" | "inactive";
export type TipeKerja = "shift" | "nonshift";
export type OvertimeJenis = "reguler" | "libur_nasional" | "kjk" | "cuti";
export type TxStatus = "tercatat"; // disiapkan untuk approval fase 2
export type DocKategori = "umum" | "generated";
export type JenisDok = "spkl" | "spd" | "deklarasi_dinas" | "surat_cuti" | "-";
export type OptionKategori =
  | "lokasi"
  | "divisi"
  | "bagian"
  | "shift"
  | "hubungan_darurat"
  | "kategori_dokumen";

export interface UserRow {
  id: string;
  email: string;
  nama_lengkap: string;
  nopek: string;
  company_id: string;
  lokasi_kerja: string;
  divisi: string;
  bagian: string;
  tipe_kerja: TipeKerja;
  nama_shift: string;
  no_telp: string;
  darurat_alamat: string;
  darurat_telp: string;
  darurat_hubungan: string;
  foto_url: string;
  ttd_file_id: string;
  role: Role;
  status: UserStatus;
  alasan_tolak: string;
  approved_by: string;
  approved_at: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyRow {
  id: string;
  nama: string;
  pic_nama: string;
  pic_telp: string;
  alamat: string;
  active: boolean;
  created_at: string;
}

export interface MasterOptionRow {
  id: string;
  kategori: OptionKategori;
  nilai: string;
  urutan: number;
  active: boolean;
}

export interface OvertimeRow {
  id: string;
  user_id: string;
  tanggal: string;
  jenis: OvertimeJenis;
  holiday_id: string;
  replaced_user_id: string;
  keterangan: string;
  jam_mulai: string;
  jam_selesai: string;
  total_jam: number;
  evidence_file_id: string;
  status: TxStatus;
  created_at: string;
  updated_at: string;
}

export interface LeaveRow {
  id: string;
  user_id: string;
  leave_type_id: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_hari: number;
  keterangan: string;
  lampiran_file_id: string;
  status: TxStatus;
  created_at: string;
  updated_at: string;
}

export interface LeaveTypeRow {
  id: string;
  nama: string;
  potong_saldo: boolean;
  wajib_lampiran: boolean;
  active: boolean;
}

export interface LeaveBalanceRow {
  id: string;
  user_id: string;
  tahun: number;
  kuota: number;
  penyesuaian: number;
  catatan: string;
  updated_at: string;
}

export interface TripRow {
  id: string;
  user_id: string;
  tujuan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keperluan: string;
  transportasi: string;
  keterangan: string;
  lampiran_file_id: string;
  status: TxStatus;
  created_at: string;
  updated_at: string;
}

export interface HolidayRow {
  id: string;
  tanggal: string;
  nama: string;
  tahun: number;
  sumber: "api" | "manual";
}

export interface DocumentRow {
  id: string;
  judul: string;
  kategori: DocKategori;
  jenis_dok: JenisDok;
  sumber_entitas: string;
  sumber_id: string;
  file_id: string;
  mime: string;
  ukuran: number;
  uploaded_by: string;
  signed_by: string;
  created_at: string;
}

export interface DocTemplateRow {
  id: string;
  nama: string;
  jenis: Exclude<JenisDok, "-">;
  gdoc_id: string;
  keterangan: string;
  active: boolean;
  created_at: string;
}

export interface PeriodLockRow {
  id: string;
  periode: string; // YYYY-MM
  locked_by: string;
  locked_at: string;
}

export interface SettingRow {
  key: string;
  value: string;
  keterangan: string;
}

export interface AuditLogRow {
  id: string;
  timestamp: string;
  actor_email: string;
  aksi: string;
  entitas: string;
  entitas_id: string;
  detail_json: string;
}

/** Peta nama tabel → tipe barisnya. */
export interface TableMap {
  users: UserRow;
  companies: CompanyRow;
  master_options: MasterOptionRow;
  overtime: OvertimeRow;
  leaves: LeaveRow;
  leave_types: LeaveTypeRow;
  leave_balances: LeaveBalanceRow;
  trips: TripRow;
  holidays: HolidayRow;
  documents: DocumentRow;
  doc_templates: DocTemplateRow;
  period_locks: PeriodLockRow;
  settings: SettingRow;
  audit_log: AuditLogRow;
}

export type TableName = keyof TableMap;

/** Urutan kolom header per tabel — dipakai driver Sheets & seed. */
export const TABLE_COLUMNS: Record<TableName, string[]> = {
  users: [
    "id", "email", "nama_lengkap", "nopek", "company_id", "lokasi_kerja", "divisi",
    "bagian", "tipe_kerja", "nama_shift", "no_telp", "darurat_alamat", "darurat_telp",
    "darurat_hubungan", "foto_url", "ttd_file_id", "role", "status", "alasan_tolak",
    "approved_by", "approved_at", "created_at", "updated_at",
  ],
  companies: ["id", "nama", "pic_nama", "pic_telp", "alamat", "active", "created_at"],
  master_options: ["id", "kategori", "nilai", "urutan", "active"],
  overtime: [
    "id", "user_id", "tanggal", "jenis", "holiday_id", "replaced_user_id", "keterangan",
    "jam_mulai", "jam_selesai", "total_jam", "evidence_file_id", "status",
    "created_at", "updated_at",
  ],
  leaves: [
    "id", "user_id", "leave_type_id", "tanggal_mulai", "tanggal_selesai", "jumlah_hari",
    "keterangan", "lampiran_file_id", "status", "created_at", "updated_at",
  ],
  leave_types: ["id", "nama", "potong_saldo", "wajib_lampiran", "active"],
  leave_balances: ["id", "user_id", "tahun", "kuota", "penyesuaian", "catatan", "updated_at"],
  trips: [
    "id", "user_id", "tujuan", "tanggal_mulai", "tanggal_selesai", "keperluan",
    "transportasi", "keterangan", "lampiran_file_id", "status", "created_at", "updated_at",
  ],
  holidays: ["id", "tanggal", "nama", "tahun", "sumber"],
  documents: [
    "id", "judul", "kategori", "jenis_dok", "sumber_entitas", "sumber_id", "file_id",
    "mime", "ukuran", "uploaded_by", "signed_by", "created_at",
  ],
  doc_templates: ["id", "nama", "jenis", "gdoc_id", "keterangan", "active", "created_at"],
  period_locks: ["id", "periode", "locked_by", "locked_at"],
  settings: ["key", "value", "keterangan"],
  audit_log: ["id", "timestamp", "actor_email", "aksi", "entitas", "entitas_id", "detail_json"],
};

/** Kolom bertipe boolean & numerik per tabel — untuk (de)serialisasi Sheets. */
export const BOOLEAN_COLUMNS: Partial<Record<TableName, string[]>> = {
  companies: ["active"],
  master_options: ["active"],
  leave_types: ["potong_saldo", "wajib_lampiran", "active"],
  doc_templates: ["active"],
};

export const NUMBER_COLUMNS: Partial<Record<TableName, string[]>> = {
  master_options: ["urutan"],
  overtime: ["total_jam"],
  leaves: ["jumlah_hari"],
  leave_balances: ["tahun", "kuota", "penyesuaian"],
  holidays: ["tahun"],
  documents: ["ukuran"],
};
