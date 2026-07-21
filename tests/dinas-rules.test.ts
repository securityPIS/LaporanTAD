import { test } from "node:test";
import assert from "node:assert/strict";
import {
  alasanBuktiKurang,
  alasanKomponenDilarang,
  buktiWajibUntuk,
  isTransportPerjalanan,
  komponenTersedia,
  labelSifat,
} from "../src/lib/dinas-rules";

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

test("isTransportPerjalanan: transport antar-kota, bukan lokal", () => {
  assert.equal(isTransportPerjalanan("Transportasi Umum (Pergi)"), true);
  assert.equal(isTransportPerjalanan("Transport Bandara (Pulang)"), true);
  assert.equal(isTransportPerjalanan("Kendaraan Pribadi (Pergi)"), true);
  // Transport Lokal, uang harian, akomodasi, lain-lain → bukan.
  assert.equal(isTransportPerjalanan("Transport Lokal"), false);
  assert.equal(isTransportPerjalanan("Uang Harian"), false);
  assert.equal(isTransportPerjalanan("Akomodasi Penginapan"), false);
  assert.equal(isTransportPerjalanan("Lain-lain"), false);
});

test("buktiWajibUntuk: tiket untuk umum, jarak untuk kendaraan pribadi", () => {
  assert.equal(buktiWajibUntuk("Transportasi Umum (Pergi)"), "tiket");
  assert.equal(buktiWajibUntuk("Transport Bandara (Pulang)"), "tiket");
  assert.equal(buktiWajibUntuk("Kendaraan Pribadi (Pergi)"), "jarak");
  assert.equal(buktiWajibUntuk("Transport Lokal"), null);
  assert.equal(buktiWajibUntuk("Uang Harian"), null);
});

test("alasanBuktiKurang: wajib bukti untuk transport, opsional untuk lainnya", () => {
  // Transport tanpa bukti → ada alasan (dilarang lolos).
  assert.ok(alasanBuktiKurang("Transportasi Umum (Pergi)", ""));
  assert.ok(alasanBuktiKurang("Kendaraan Pribadi (Pulang)", "   "));
  // Transport dengan bukti → lolos.
  assert.equal(alasanBuktiKurang("Transportasi Umum (Pergi)", "file_123"), null);
  assert.equal(alasanBuktiKurang("Kendaraan Pribadi (Pulang)", "f1,f2"), null);
  // Komponen non-transport → tak wajib bukti.
  assert.equal(alasanBuktiKurang("Uang Harian", ""), null);
  assert.equal(alasanBuktiKurang("Transport Lokal", ""), null);
});
