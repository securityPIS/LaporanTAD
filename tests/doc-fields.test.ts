import { test } from "node:test";
import assert from "node:assert/strict";
import { ownerPlaceholders } from "../src/lib/doc-fields";

const owner = {
  nama_lengkap: "Budi Santoso",
  nopek: "TAD-001",
  divisi: "Operasi",
  bagian: "Distribusi",
  lokasi_kerja: "Jakarta",
};

test("ownerPlaceholders: identitas lengkap + tanggal cetak diformat", () => {
  const p = ownerPlaceholders(owner, "2026-07-18");
  assert.equal(p.nama, "Budi Santoso");
  assert.equal(p.nopek, "TAD-001");
  assert.equal(p.divisi, "Operasi");
  assert.equal(p.bagian, "Distribusi");
  assert.equal(p.lokasi_kerja, "Jakarta");
  assert.equal(p.tanggal_cetak, "Sab, 18 Jul 2026");
});
