import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSpklRows, buildSpklHeader, totalJam } from "../src/lib/spkl";
import type { OvertimeRow } from "../src/lib/db/tables";

function ot(p: Partial<OvertimeRow>): OvertimeRow {
  return {
    id: "x",
    user_id: "u1",
    tanggal: "2026-07-01",
    jenis: "reguler",
    holiday_id: "",
    replaced_user_id: "",
    keterangan: "Lembur",
    jam_mulai: "18:00",
    jam_selesai: "21:00",
    total_jam: 3,
    evidence_file_id: "",
    status: "tercatat",
    created_at: "",
    updated_at: "",
    ...p,
  };
}

const owner = {
  nama_lengkap: "Budi Santoso",
  nopek: "TAD-001",
  divisi: "Operasi",
  bagian: "Distribusi",
  lokasi_kerja: "Jakarta",
};

test("buildSpklRows: penomoran, label jenis, jam & total", () => {
  const rows = buildSpklRows([
    ot({ tanggal: "2026-07-02", jenis: "reguler", jam_mulai: "18:00", jam_selesai: "21:00", total_jam: 3 }),
    ot({ tanggal: "2026-07-05", jenis: "kjk", jam_mulai: "22:00", jam_selesai: "06:00", total_jam: 8 }),
  ]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].no, "1");
  assert.equal(rows[1].no, "2");
  assert.equal(rows[0].jenis, "Reguler");
  assert.equal(rows[1].jenis, "KJK");
  assert.equal(rows[0].jam, "18:00–21:00");
  assert.equal(rows[1].total_jam, "8:00");
});

test("totalJam: agregat presisi 2 desimal", () => {
  const list = [ot({ total_jam: 2.38 }), ot({ total_jam: 3 }), ot({ total_jam: 1.5 })];
  assert.equal(totalJam(list), 6.88);
});

test("buildSpklHeader: periode, total catatan & total jam", () => {
  const list = [
    ot({ tanggal: "2026-07-02", total_jam: 3 }),
    ot({ tanggal: "2026-07-05", total_jam: 8 }),
  ];
  const h = buildSpklHeader(owner, "2026-07-01", "2026-07-31", list, "2026-07-18");
  assert.equal(h.nama, "Budi Santoso");
  assert.equal(h.nopek, "TAD-001");
  assert.equal(h.total_catatan, "2");
  assert.equal(h.total_jam, "11:00 jam");
  assert.equal(h.periode, "1–31 Jul 2026");
});
