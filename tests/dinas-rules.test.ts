import { test } from "node:test";
import assert from "node:assert/strict";
import { alasanKomponenDilarang, komponenTersedia, labelSifat } from "../src/lib/dinas-rules";

test("labelSifat", () => {
  assert.equal(labelSifat("residensial"), "Residensial");
  assert.equal(labelSifat("non_residensial"), "Non-Residensial");
  assert.equal(labelSifat(""), "");
  assert.equal(labelSifat(undefined), "");
});

test("residensial: akomodasi & transport lokal dilarang", () => {
  const opt = { sifat: "residensial" as const, kendaraanPribadi: false };
  assert.ok(alasanKomponenDilarang("Akomodasi Penginapan", opt));
  assert.ok(alasanKomponenDilarang("Transport Lokal", opt));
  // Komponen lain tetap boleh saat residensial.
  assert.equal(alasanKomponenDilarang("Uang Harian", opt), null);
  assert.equal(alasanKomponenDilarang("Transportasi Umum", opt), null);
});

test("non-residensial: akomodasi & transport lokal boleh", () => {
  const opt = { sifat: "non_residensial" as const, kendaraanPribadi: false };
  assert.equal(alasanKomponenDilarang("Akomodasi Penginapan", opt), null);
  assert.equal(alasanKomponenDilarang("Transport Lokal", opt), null);
});

test("kendaraan pribadi: tiket umum & transport bandara dilarang", () => {
  const opt = { sifat: "non_residensial" as const, kendaraanPribadi: true };
  assert.ok(alasanKomponenDilarang("Transportasi Umum", opt));
  assert.ok(alasanKomponenDilarang("Transport Bandara (Jabodetabek)", opt));
  assert.ok(alasanKomponenDilarang("Transport Bandara (Non-Jabodetabek)", opt));
  assert.ok(alasanKomponenDilarang("Tiket Pesawat", opt));
  // Justru kendaraan pribadi yang diklaim — boleh.
  assert.equal(alasanKomponenDilarang("Kendaraan Pribadi", opt), null);
  // Uang harian tetap boleh.
  assert.equal(alasanKomponenDilarang("Uang Harian", opt), null);
});

test("tanpa kendaraan pribadi: tiket & transport bandara boleh", () => {
  const opt = { sifat: "non_residensial" as const, kendaraanPribadi: false };
  assert.equal(alasanKomponenDilarang("Transportasi Umum", opt), null);
  assert.equal(alasanKomponenDilarang("Transport Bandara (Jabodetabek)", opt), null);
});

test("aturan gabungan (residensial + kendaraan pribadi)", () => {
  const opt = { sifat: "residensial" as const, kendaraanPribadi: true };
  assert.ok(alasanKomponenDilarang("Akomodasi Penginapan", opt));
  assert.ok(alasanKomponenDilarang("Transport Bandara (Jabodetabek)", opt));
  assert.equal(komponenTersedia("Uang Harian", opt), true);
  assert.equal(komponenTersedia("Kendaraan Pribadi", opt), true);
});
