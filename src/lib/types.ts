// Tipe bersama untuk seluruh UI (data contoh & nanti data nyata dari Sheets).

export type OvertimeJenis = "reguler" | "libur_nasional" | "kjk" | "cuti";

export interface Overtime {
  id: string;
  tanggal: string; // ISO YYYY-MM-DD
  jenis: OvertimeJenis;
  keterangan: string;
  mulai: string; // HH:mm
  selesai: string; // HH:mm
  replaced?: string; // nama rekan yang digantikan (jenis "cuti")
}

export interface CutiItem {
  id: string;
  jenis: string;
  potong: boolean; // memotong saldo cuti tahunan?
  mulai: string;
  selesai: string;
  hari: number;
  ket: string;
}

export type CalEventType = "libur" | "cuti" | "dinas" | "lembur";

export interface CalEvent {
  iso: string;
  type: CalEventType;
  label: string;
}

export interface AdminOvertime {
  nama: string;
  nopek: string;
  perusahaan: string;
  lokasi: string;
  tanggal: string;
  jenis: OvertimeJenis;
  mulai: string;
  selesai: string;
}

export type WorkerStatus = "active" | "pending" | "inactive";

export interface Worker {
  nama: string;
  nopek: string;
  perusahaan: string;
  lokasi: string;
  divisi: string;
  pola: string;
  status: WorkerStatus;
}

export interface PendingReg {
  ini: string;
  nama: string;
  sub: string;
}

export interface CutiToday {
  nama: string;
  sub: string;
  jenis: string;
}

export interface DocItem {
  judul: string;
  ext: string;
  bg: string;
  fg: string;
  meta: string;
}

export interface DocCat {
  name: string;
  items: DocItem[];
}

export interface Stat {
  icon: string;
  value: string;
  label: string;
  bg: string;
  fg: string;
  trend: string;
  trendColor: string;
}

export interface CurrentUser {
  nama: string;
  inisial: string;
}
