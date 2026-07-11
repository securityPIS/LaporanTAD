import { test } from "node:test";
import assert from "node:assert/strict";
import { hitungHariCuti } from "../src/lib/leave-calc";

const noHol = new Set<string>();

test("non-shift: kecualikan Sabtu/Minggu", () => {
  // 2026-07-09 (Kamis) – 2026-07-13 (Senin): Kam,Jum kerja; Sab,Min libur; Sen kerja = 3
  assert.equal(hitungHariCuti("2026-07-09", "2026-07-13", "nonshift", noHol), 3);
});

test("non-shift: kecualikan libur nasional", () => {
  const hol = new Set(["2026-07-09"]);
  // Kam(libur nasional),Jum kerja = 1 (Kamis dikecualikan)
  assert.equal(hitungHariCuti("2026-07-09", "2026-07-10", "nonshift", hol), 1);
});

test("shift: hari kalender penuh", () => {
  assert.equal(hitungHariCuti("2026-07-09", "2026-07-13", "shift", noHol), 5);
});

test("satu hari", () => {
  assert.equal(hitungHariCuti("2026-05-05", "2026-05-05", "nonshift", noHol), 1); // Selasa
});
