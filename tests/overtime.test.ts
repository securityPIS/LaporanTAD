import { test } from "node:test";
import assert from "node:assert/strict";
import { hitungTotalJam, selisihMenit, seninMingguIni, isAkhirPekan } from "../src/lib/overtime-calc";

test("total jam standar", () => {
  assert.equal(hitungTotalJam("18:00", "21:00"), 3);
  assert.equal(hitungTotalJam("17:30", "20:30"), 3);
});

test("lintas tengah malam (22:00–06:00 = 8 jam)", () => {
  assert.equal(hitungTotalJam("22:00", "06:00"), 8);
  assert.equal(selisihMenit("23:15", "01:45"), 150);
});

test("presisi 2 desimal tanpa pembulatan ke satuan", () => {
  // 17:37–20:00 = 2 jam 23 menit = 2.383… → 2.38
  assert.equal(hitungTotalJam("17:37", "20:00"), 2.38);
});

test("24 jam penuh bila mulai == selesai", () => {
  assert.equal(hitungTotalJam("00:00", "00:00"), 24);
});

test("Senin awal minggu", () => {
  // 2026-07-11 adalah Sabtu → Senin minggu itu 2026-07-06
  assert.equal(seninMingguIni("2026-07-11"), "2026-07-06");
  // 2026-07-06 adalah Senin
  assert.equal(seninMingguIni("2026-07-06"), "2026-07-06");
});

test("deteksi akhir pekan", () => {
  assert.equal(isAkhirPekan("2026-07-11"), true); // Sabtu
  assert.equal(isAkhirPekan("2026-07-12"), true); // Minggu
  assert.equal(isAkhirPekan("2026-07-09"), false); // Kamis
});
