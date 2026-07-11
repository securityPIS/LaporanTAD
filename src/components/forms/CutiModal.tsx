"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Sheet, AREA, BTN_BATAL, BTN_PRIMARY, INP, LBL } from "@/components/ui/Sheet";
import { hitungHari, hitungSaldo } from "@/lib/cuti";
import { SEED_CUTI } from "@/lib/mock-data";

export function CutiModal() {
  const { closeModal, showToast } = useApp();
  const [jenis, setJenis] = useState("Tahunan");
  const [mulai, setMulai] = useState("2026-07-13");
  const [selesai, setSelesai] = useState("2026-07-15");
  const [keterangan, setKeterangan] = useState("");

  const saldo = hitungSaldo(SEED_CUTI);
  const hari = hitungHari(mulai, selesai);

  function save() {
    closeModal();
    showToast("Pengajuan cuti tersimpan");
  }

  return (
    <Sheet
      title="Ajukan Cuti"
      subtitle={`Sisa saldo ${saldo.sisa} hari`}
      onClose={closeModal}
      footer={
        <>
          <button onClick={closeModal} className={BTN_BATAL}>
            Batal
          </button>
          <button onClick={save} className={BTN_PRIMARY}>
            Ajukan Cuti
          </button>
        </>
      }
    >
      <div>
        <label className={LBL}>Jenis cuti</label>
        <select value={jenis} onChange={(e) => setJenis(e.target.value)} className={INP}>
          <option value="Tahunan">Tahunan (potong saldo)</option>
          <option value="Sakit">Sakit (tidak potong · wajib lampiran)</option>
          <option value="Izin Khusus">Izin Khusus (tidak potong)</option>
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={LBL}>Mulai</label>
          <input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} className={INP} />
        </div>
        <div className="flex-1">
          <label className={LBL}>Selesai</label>
          <input type="date" value={selesai} onChange={(e) => setSelesai(e.target.value)} className={INP} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[14px] border border-cuti bg-cuti-weak px-4 py-[15px]">
        <div className="text-[12.5px] font-bold text-cuti">Jumlah hari (otomatis)</div>
        <div className="font-mono text-2xl font-bold text-cuti">{hari}</div>
      </div>

      <div>
        <label className={LBL}>Keterangan</label>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Alasan / keperluan cuti"
          className={AREA}
        />
      </div>
    </Sheet>
  );
}
