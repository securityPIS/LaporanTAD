import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTripView,
  deklarasiState,
  spdState,
  totalBiaya,
  tripPhase,
} from "../src/lib/trip-view";
import type { TripCostRow, TripRow } from "../src/lib/db/tables";

function trip(p: Partial<TripRow>): TripRow {
  return {
    id: "trp_x",
    user_id: "u1",
    tujuan: "Surabaya",
    tanggal_mulai: "2026-07-10",
    tanggal_selesai: "2026-07-12",
    keperluan: "Koordinasi",
    transportasi: "Pesawat",
    keterangan: "",
    lampiran_file_id: "",
    status: "draft",
    tanggal_realisasi_mulai: "",
    tanggal_realisasi_selesai: "",
    deklarasi_catatan: "",
    sifat: "",
    golongan: "-",
    biaya_ditanggung: "Perusahaan",
    surat_perintah_file_id: "",
    deklarasi_kendaraan_pribadi: false,
    created_at: "",
    updated_at: "",
    ...p,
  };
}

function cost(jumlah: number, urutan = 1): TripCostRow {
  return { id: `c${urutan}`, trip_id: "trp_x", user_id: "u1", komponen: "X", keterangan: "", vol: 1, tarif: jumlah, jumlah, bukti_file_id: "", urutan, created_at: "" };
}

test("tripPhase: draft saat status draft", () => {
  assert.equal(tripPhase(trip({ status: "draft" }), "2026-07-01"), "draft");
});

test("tripPhase: spd_terbit sebelum tanggal selesai lewat", () => {
  assert.equal(tripPhase(trip({ status: "spd_terbit", tanggal_selesai: "2026-07-12" }), "2026-07-11"), "spd_terbit");
});

test("tripPhase: menunggu_deklarasi setelah tanggal selesai lewat", () => {
  assert.equal(tripPhase(trip({ status: "spd_terbit", tanggal_selesai: "2026-07-12" }), "2026-07-13"), "menunggu_deklarasi");
});

test("tripPhase: selesai tetap selesai apa pun tanggalnya", () => {
  assert.equal(tripPhase(trip({ status: "selesai", tanggal_selesai: "2026-07-12" }), "2026-07-11"), "selesai");
});

test("tripPhase: status lama tak dikenal jatuh ke draft", () => {
  assert.equal(tripPhase(trip({ status: "tercatat" as never }), "2026-07-11"), "draft");
});

test("spdState: menunggu saat draft, terbit selain itu", () => {
  assert.equal(spdState("draft"), "menunggu");
  assert.equal(spdState("spd_terbit"), "terbit");
  assert.equal(spdState("selesai"), "terbit");
});

test("deklarasiState: terkunci→menunggu→terbit sesuai fase", () => {
  assert.equal(deklarasiState("draft"), "terkunci");
  assert.equal(deklarasiState("spd_terbit"), "menunggu");
  assert.equal(deklarasiState("menunggu_deklarasi"), "menunggu");
  assert.equal(deklarasiState("selesai"), "terbit");
});

test("totalBiaya: menjumlah seluruh komponen", () => {
  assert.equal(totalBiaya([cost(1_200_000, 1), cost(900_000, 2), cost(300_000, 3)]), 2_400_000);
  assert.equal(totalBiaya([]), 0);
});

test("buildTripView: rakit fase, langkah, pil, total", () => {
  const v = buildTripView(
    trip({ status: "selesai", tanggal_realisasi_mulai: "2026-07-10" }),
    [cost(2_400_000)],
    "2026-07-20",
  );
  assert.equal(v.phase, "selesai");
  assert.equal(v.langkah, 3);
  assert.equal(v.spd_state, "terbit");
  assert.equal(v.deklarasi_state, "terbit");
  assert.equal(v.deklarasi_terisi, true);
  assert.equal(v.total_biaya, 2_400_000);
});

test("buildTripView: deklarasi_terisi hanya bila ada komponen biaya (tahan data lama)", () => {
  // Tanggal realisasi terisi tapi tanpa biaya (mis. baris lama tergeser) → belum terisi.
  const v = buildTripView(
    trip({ status: "spd_terbit", tanggal_realisasi_mulai: "2026-07-10T09:00:00+07:00" }),
    [],
    "2026-07-20",
  );
  assert.equal(v.deklarasi_terisi, false);
});

test("buildTripView: draft belum terisi deklarasi", () => {
  const v = buildTripView(trip({ status: "draft" }), [], "2026-07-20");
  assert.equal(v.phase, "draft");
  assert.equal(v.langkah, 1);
  assert.equal(v.deklarasi_state, "terkunci");
  assert.equal(v.deklarasi_terisi, false);
});
