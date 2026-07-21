import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDeklarasiHeader, buildDeklarasiRows, lamaHari } from "../src/lib/deklarasi";
import { fmtRupiah, fmtRupiahShort } from "../src/lib/rupiah";
import type { TripCostRow, TripRow } from "../src/lib/db/tables";

const owner = {
  nama_lengkap: "Budi Santoso",
  nopek: "TAD-001",
  divisi: "Operasi",
  bagian: "Distribusi",
  lokasi_kerja: "Jakarta",
};

function trip(p: Partial<TripRow>): TripRow {
  return {
    id: "trp_x", user_id: "u1", tujuan: "Bandung",
    tanggal_mulai: "2026-07-05", tanggal_selesai: "2026-07-06",
    keperluan: "Audit", transportasi: "Kereta", keterangan: "",
    lampiran_file_id: "", status: "selesai",
    tanggal_realisasi_mulai: "2026-07-05", tanggal_realisasi_selesai: "2026-07-07",
    deklarasi_catatan: "Menginap lebih lama",
    sifat: "non_residensial", golongan: "-", biaya_ditanggung: "Perusahaan", surat_perintah_file_id: "", deklarasi_kendaraan_pribadi: false,
    created_at: "", updated_at: "", ...p,
  };
}

function cost(komponen: string, jumlah: number, urutan: number, vol = 1, tarif = jumlah): TripCostRow {
  return { id: `c${urutan}`, trip_id: "trp_x", user_id: "u1", komponen, keterangan: "", vol, tarif, jumlah, bukti_file_id: "", urutan, created_at: "" };
}

test("fmtRupiah: pemisah ribuan", () => {
  assert.equal(fmtRupiah(2_400_000), "Rp 2.400.000");
  assert.equal(fmtRupiah(0), "Rp 0");
  assert.equal(fmtRupiah(950_000), "Rp 950.000");
});

test("fmtRupiahShort: ringkas jt/rb", () => {
  assert.equal(fmtRupiahShort(2_400_000), "Rp 2,4 jt");
  assert.equal(fmtRupiahShort(950_000), "Rp 950 rb");
  assert.equal(fmtRupiahShort(500), "Rp 500");
});

test("lamaHari: inklusif", () => {
  assert.equal(lamaHari("2026-07-05", "2026-07-07"), 3);
  assert.equal(lamaHari("2026-07-05", "2026-07-05"), 1);
});

test("buildDeklarasiRows: bernomor & urut, jumlah terformat", () => {
  const rows = buildDeklarasiRows([
    cost("Uang Harian", 600_000, 3, 4, 150_000), // vol 4 × Rp 150.000
    cost("Transportasi", 1_200_000, 1),
    cost("Penginapan", 900_000, 2),
  ]);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].no, "1");
  assert.equal(rows[0].komponen, "Transportasi"); // urut naik
  assert.equal(rows[0].jumlah, "Rp 1.200.000");
  assert.equal(rows[2].komponen, "Uang Harian");
  // Kolom Vol/Hari & Nilai Rupiah tampil saat tarif satuan diketahui.
  assert.equal(rows[2].vol, "4");
  assert.equal(rows[2].nilai, "Rp 150.000");
  assert.equal(rows[2].jumlah, "Rp 600.000");
  assert.equal(rows[2].mata_uang, "");
});

test("buildDeklarasiRows: pos tanpa tarif satuan → Vol & Nilai kosong", () => {
  const rows = buildDeklarasiRows([
    { id: "cx", trip_id: "trp_x", user_id: "u1", komponen: "Akomodasi", keterangan: "", vol: 0, tarif: 0, jumlah: 750_000, bukti_file_id: "", urutan: 1, created_at: "" },
  ]);
  assert.equal(rows[0].vol, "");
  assert.equal(rows[0].nilai, "");
  assert.equal(rows[0].jumlah, "Rp 750.000");
});

test("buildDeklarasiHeader: realisasi, total, & lama hari", () => {
  const costs = [cost("Transportasi", 1_200_000, 1), cost("Penginapan", 900_000, 2)];
  const ph = buildDeklarasiHeader(owner, trip({}), costs, "2026-07-08");
  assert.equal(ph.nama, "Budi Santoso");
  assert.equal(ph.dari, "Jakarta"); // asal = lokasi kerja pemohon
  assert.equal(ph.tujuan, "Bandung");
  assert.equal(ph.total_biaya, "Rp 2.100.000");
  assert.equal(ph.total_komponen, "2");
  assert.equal(ph.lama_hari, "3 hari"); // realisasi 05..07
});
