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
    deklarasi_catatan: "Menginap lebih lama", created_at: "", updated_at: "", ...p,
  };
}

function cost(komponen: string, jumlah: number, urutan: number): TripCostRow {
  return { id: `c${urutan}`, trip_id: "trp_x", user_id: "u1", komponen, keterangan: "", jumlah, bukti_file_id: "", urutan, created_at: "" };
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
    cost("Uang harian", 300_000, 3),
    cost("Transportasi", 1_200_000, 1),
    cost("Penginapan", 900_000, 2),
  ]);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].no, "1");
  assert.equal(rows[0].komponen, "Transportasi"); // urut naik
  assert.equal(rows[0].jumlah, "Rp 1.200.000");
  assert.equal(rows[2].komponen, "Uang harian");
});

test("buildDeklarasiHeader: realisasi, total, & lama hari", () => {
  const costs = [cost("Transportasi", 1_200_000, 1), cost("Penginapan", 900_000, 2)];
  const ph = buildDeklarasiHeader(owner, trip({}), costs, "2026-07-08");
  assert.equal(ph.nama, "Budi Santoso");
  assert.equal(ph.tujuan, "Bandung");
  assert.equal(ph.total_biaya, "Rp 2.100.000");
  assert.equal(ph.total_komponen, "2");
  assert.equal(ph.lama_hari, "3 hari"); // realisasi 05..07
});
