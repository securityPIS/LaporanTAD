import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { alasanKomponenDilarang } from "@/lib/dinas-rules";

const jam = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam HH:mm tidak valid");
const tanggal = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid");
const telp = z.string().min(6, "No. telepon tidak valid").transform(normalizePhone);

// ── Registrasi (FR-AUTH-03) ──────────────────────────────────────────────
export const registrationSchema = z
  .object({
    nama_lengkap: z.string().min(3, "Nama minimal 3 karakter").max(100),
    company_id: z.string().min(1, "Perusahaan wajib dipilih"),
    nopek: z.string().min(1, "Nopek wajib diisi").max(50),
    lokasi_kerja: z.string().min(1, "Lokasi kerja wajib dipilih"),
    divisi: z.string().min(1, "Divisi wajib dipilih"),
    bagian: z.string().min(1, "Bagian wajib dipilih"),
    tipe_kerja: z.enum(["shift", "nonshift"]),
    nama_shift: z.string().optional().default(""),
    no_telp: telp,
    darurat_alamat: z.string().min(1, "Alamat kontak darurat wajib diisi"),
    darurat_telp: telp,
    darurat_hubungan: z.string().min(1, "Hubungan wajib dipilih"),
  })
  .refine((v) => v.tipe_kerja !== "shift" || (v.nama_shift && v.nama_shift.length > 0), {
    message: "Nama shift wajib dipilih untuk pekerja shift",
    path: ["nama_shift"],
  });
export type RegistrationInput = z.infer<typeof registrationSchema>;

// ── Lembur (FR-LBR) ──────────────────────────────────────────────────────
export const overtimeSchema = z
  .object({
    tanggal,
    jenis: z.enum(["reguler", "libur_nasional", "kjk", "cuti"]),
    holiday_id: z.string().optional().default(""),
    replaced_user_id: z.string().optional().default(""),
    keterangan: z.string().min(1, "Keterangan wajib diisi").max(500),
    jam_mulai: jam,
    jam_selesai: jam,
    evidence_file_id: z.string().optional().default(""),
  })
  .refine((v) => v.jenis !== "cuti" || v.replaced_user_id.length > 0, {
    message: "Pilih rekan yang digantikan untuk Lembur Cuti",
    path: ["replaced_user_id"],
  });
export type OvertimeInput = z.infer<typeof overtimeSchema>;

// ── Cuti (FR-CTI) ────────────────────────────────────────────────────────
export const leaveSchema = z
  .object({
    leave_type_id: z.string().min(1, "Jenis cuti wajib dipilih"),
    tanggal_mulai: tanggal,
    tanggal_selesai: tanggal,
    jumlah_hari: z.number().int().positive().optional(),
    keterangan: z.string().max(500).optional().default(""),
    lampiran_file_id: z.string().optional().default(""),
  })
  .refine((v) => v.tanggal_selesai >= v.tanggal_mulai, {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    path: ["tanggal_selesai"],
  });
export type LeaveInput = z.infer<typeof leaveSchema>;

// ── Dinas (FR-DNS) ───────────────────────────────────────────────────────
export const tripSchema = z
  .object({
    tujuan: z.string().min(1, "Tujuan wajib diisi").max(200),
    tanggal_mulai: tanggal,
    tanggal_selesai: tanggal,
    keperluan: z.string().min(1, "Keperluan wajib diisi").max(500),
    transportasi: z.string().max(100).optional().default(""),
    keterangan: z.string().max(500).optional().default(""),
    lampiran_file_id: z.string().optional().default(""),
    // Data SPD (Surat Perintah Perjalanan Dinas), diisi saat perencanaan.
    sifat: z.enum(["residensial", "non_residensial"]).default("non_residensial"),
    golongan: z.string().max(50).optional().default(""),
    biaya_ditanggung: z.string().max(100).optional().default("Perusahaan"),
  })
  .refine((v) => v.tanggal_selesai >= v.tanggal_mulai, {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    path: ["tanggal_selesai"],
  });
export type TripInput = z.infer<typeof tripSchema>;

// Deklarasi Dinas (fase 2) — realisasi + rincian biaya, diisi sepulang dinas.
// Biaya mengikuti ketentuan dinas: jumlah = vol × tarif (dihitung di server).
// vol = Vol/Hari (hari, malam, km, dsb.), tarif = Nilai Rupiah satuan.
export const tripCostSchema = z.object({
  komponen: z.string().min(1, "Komponen wajib diisi").max(100),
  keterangan: z.string().max(200).optional().default(""),
  vol: z.number({ invalid_type_error: "Vol harus angka" }).positive("Vol harus lebih dari 0").default(1),
  tarif: z.number({ invalid_type_error: "Tarif harus angka" }).int().nonnegative("Tarif tidak boleh negatif"),
  bukti_file_id: z.string().optional().default(""),
});
export type TripCostInput = z.infer<typeof tripCostSchema>;

export const deklarasiSchema = z
  .object({
    tanggal_realisasi_mulai: tanggal,
    tanggal_realisasi_selesai: tanggal,
    catatan: z.string().max(500).optional().default(""),
    // Sifat dinas & moda menentukan aturan klaim biaya (lib/dinas-rules).
    sifat: z.enum(["residensial", "non_residensial"]).default("non_residensial"),
    kendaraan_pribadi: z.boolean().default(false),
    biaya: z.array(tripCostSchema).min(1, "Isi minimal satu komponen biaya"),
  })
  .refine((v) => v.tanggal_realisasi_selesai >= v.tanggal_realisasi_mulai, {
    message: "Tanggal kembali tidak boleh sebelum tanggal berangkat",
    path: ["tanggal_realisasi_selesai"],
  })
  // Tegakkan aturan klaim: komponen terlarang (residensial / kendaraan pribadi)
  // tak boleh ada dalam rincian biaya.
  .superRefine((v, ctx) => {
    v.biaya.forEach((b, i) => {
      const alasan = alasanKomponenDilarang(b.komponen, {
        sifat: v.sifat,
        kendaraanPribadi: v.kendaraan_pribadi,
      });
      if (alasan) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: alasan, path: ["biaya", i, "komponen"] });
      }
    });
  });
export type DeklarasiInput = z.infer<typeof deklarasiSchema>;

// ── Master data admin ────────────────────────────────────────────────────
export const companySchema = z.object({
  nama: z.string().min(1, "Nama perusahaan wajib diisi"),
  pic_nama: z.string().optional().default(""),
  pic_telp: z.string().optional().default(""),
  alamat: z.string().optional().default(""),
  active: z.boolean().optional().default(true),
});

export const optionSchema = z.object({
  kategori: z.enum(["lokasi", "divisi", "bagian", "shift", "hubungan_darurat", "kategori_dokumen"]),
  nilai: z.string().min(1, "Nilai wajib diisi"),
  urutan: z.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
});

export const leaveTypeSchema = z.object({
  nama: z.string().min(1),
  potong_saldo: z.boolean(),
  wajib_lampiran: z.boolean(),
  active: z.boolean().optional().default(true),
});

export const holidaySchema = z.object({
  tanggal,
  nama: z.string().min(1, "Nama libur wajib diisi"),
});

export const templateSchema = z.object({
  nama: z.string().min(1),
  jenis: z.enum(["spkl", "spd", "deklarasi_dinas", "surat_cuti"]),
  gdoc_id: z.string().optional().default(""),
  keterangan: z.string().optional().default(""),
  active: z.boolean().optional().default(true),
});

export const generateSchema = z.object({
  jenis: z.enum(["spkl", "spd", "deklarasi_dinas", "surat_cuti"]),
  sumber_id: z.string().min(1),
  ttd_file_id: z.string().optional().default(""),
  ttd_data_url: z.string().optional().default(""),
});

// ── Generate SPKL per periode (agregasi banyak lembur → satu dokumen) ─────
export const spklSchema = z
  .object({
    tanggal_mulai: tanggal,
    tanggal_selesai: tanggal,
    ttd_file_id: z.string().optional().default(""),
    ttd_data_url: z.string().optional().default(""),
  })
  .refine((v) => v.tanggal_mulai <= v.tanggal_selesai, {
    message: "Tanggal mulai tidak boleh setelah tanggal selesai",
    path: ["tanggal_selesai"],
  });
export type SpklInput = z.infer<typeof spklSchema>;
