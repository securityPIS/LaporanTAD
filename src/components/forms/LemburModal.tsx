"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Sheet, AREA, BTN_BATAL, BTN_PRIMARY, INP, LBL } from "@/components/ui/Sheet";
import { Icon } from "@/components/shared/Icons";
import { calc, fmtJam } from "@/lib/overtime";
import type { OvertimeJenis } from "@/lib/types";

const JENIS_OPTS: { key: OvertimeJenis; label: string }[] = [
  { key: "reguler", label: "Reguler" },
  { key: "kjk", label: "KJK" },
  { key: "libur_nasional", label: "Libur Nasional" },
  { key: "cuti", label: "Lembur Cuti" },
];

export function LemburModal() {
  const { addOvertime, closeModal, showToast } = useApp();
  const [tanggal, setTanggal] = useState("2026-07-11");
  const [keterangan, setKeterangan] = useState("");
  const [mulai, setMulai] = useState("18:00");
  const [selesai, setSelesai] = useState("21:00");
  const [jenis, setJenis] = useState<OvertimeJenis>("reguler");

  const total = fmtJam(calc(mulai, selesai));

  function save() {
    addOvertime({
      tanggal,
      jenis,
      keterangan: keterangan || "Lembur tanpa keterangan",
      mulai,
      selesai,
    });
    closeModal();
    showToast("Catatan lembur tersimpan");
  }

  return (
    <Sheet
      title="Catat Lembur"
      subtitle="Pekerja shift · PT Sigap Prima"
      onClose={closeModal}
      footer={
        <>
          <button onClick={closeModal} className={BTN_BATAL}>
            Batal
          </button>
          <button onClick={save} className={BTN_PRIMARY}>
            Simpan Catatan
          </button>
        </>
      }
    >
      <div>
        <label className={LBL}>Jenis lembur</label>
        <div className="flex flex-wrap gap-2">
          {JENIS_OPTS.map((j) => {
            const on = jenis === j.key;
            return (
              <button
                key={j.key}
                onClick={() => setJenis(j.key)}
                className={cn(
                  "cursor-pointer rounded-[10px] border px-[13px] py-2 text-[12.5px] font-bold",
                  on ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted",
                )}
              >
                {j.label}
              </button>
            );
          })}
        </div>
      </div>

      {jenis === "libur_nasional" && (
        <div>
          <label className={LBL}>Pilih libur nasional</label>
          <select className={INP}>
            <option>20 Jul 2026 — Cuti Bersama</option>
            <option>17 Aug 2026 — HUT Kemerdekaan RI</option>
          </select>
        </div>
      )}

      {jenis === "cuti" && (
        <div>
          <label className={LBL}>Menggantikan rekan (shift, satu bagian)</label>
          <select className={INP}>
            <option>Andi Pratama — Shift B</option>
            <option>Dewi Lestari — Shift B</option>
          </select>
          <div className="mt-[6px] text-[11px] font-semibold text-cuti">
            ⚠ Rekan belum tercatat cuti pada tanggal ini — tetap dapat disimpan.
          </div>
        </div>
      )}

      <div>
        <label className={LBL}>Tanggal</label>
        <input
          type="date"
          value={tanggal}
          max="2026-07-11"
          onChange={(e) => setTanggal(e.target.value)}
          className={INP}
        />
      </div>

      <div>
        <label className={LBL}>Keterangan</label>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Contoh: Penyelesaian laporan bulanan operasional"
          className={AREA}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={LBL}>Jam mulai</label>
          <input type="time" value={mulai} onChange={(e) => setMulai(e.target.value)} className={INP} />
        </div>
        <div className="flex-1">
          <label className={LBL}>Jam selesai</label>
          <input type="time" value={selesai} onChange={(e) => setSelesai(e.target.value)} className={INP} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[14px] border border-accent bg-accent-weak px-4 py-[15px]">
        <div>
          <div className="text-xs font-bold text-accent-ink">Total jam terhitung</div>
          <div className="mt-[1px] text-[11px] text-accent">otomatis · mendukung lintas tengah malam</div>
        </div>
        <div className="font-mono text-[26px] font-bold text-accent-ink">{total}</div>
      </div>

      <div>
        <label className={LBL}>
          Evidence <span className="text-libur">*</span>
        </label>
        <div className="cursor-pointer rounded-[14px] border-[1.5px] border-dashed border-border-strong bg-surface-2 p-[22px] text-center">
          <Icon name="upload" size={26} strokeWidth={1.8} className="mx-auto mb-[6px] text-faint" />
          <div className="text-[12.5px] font-bold">Unggah foto atau PDF</div>
          <div className="mt-[2px] text-[11px] text-faint">JPG/PNG/PDF · maks 5 MB · dikompresi otomatis</div>
        </div>
      </div>
    </Sheet>
  );
}
