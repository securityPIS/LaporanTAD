"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Sheet, BTN_BATAL, LBL } from "@/components/ui/Sheet";
import { SignaturePad } from "./SignaturePad";

const GEN_DEFS = [
  { key: "spkl", code: "SPKL", name: "Surat Perintah Kerja Lembur" },
  { key: "spd", code: "SPD", name: "Surat Perintah Dinas" },
  { key: "deklarasi", code: "Deklarasi", name: "Rincian Biaya Dinas" },
  { key: "cuti", code: "Surat Cuti", name: "Keterangan Cuti" },
];

export function GenerateDocModal() {
  const { closeModal, showToast } = useApp();
  const [template, setTemplate] = useState("spkl");
  const [hasSig, setHasSig] = useState(false);

  function generate() {
    if (!hasSig) {
      showToast("Sediakan tanda tangan dulu");
      return;
    }
    closeModal();
    showToast("Dokumen tergenerate & bertanda tangan");
  }

  return (
    <Sheet
      title="Buat Dokumen Resmi"
      subtitle="Tanda tangan digital wajib sebelum generate"
      onClose={closeModal}
      footer={
        <>
          <button onClick={closeModal} className={BTN_BATAL}>
            Batal
          </button>
          <button
            onClick={generate}
            className={cn(
              "h-12 flex-1 rounded-[13px] border-none text-[14.5px] font-extrabold",
              hasSig
                ? "cursor-pointer bg-accent text-white shadow"
                : "cursor-not-allowed bg-surface-3 text-faint",
            )}
          >
            Generate PDF
          </button>
        </>
      }
    >
      <div>
        <label className={LBL}>Jenis dokumen</label>
        <div className="grid grid-cols-2 gap-2">
          {GEN_DEFS.map((g) => {
            const on = template === g.key;
            return (
              <button
                key={g.key}
                onClick={() => setTemplate(g.key)}
                className={cn(
                  "flex flex-col items-start rounded-xl border-[1.5px] px-[14px] py-3 text-left",
                  on
                    ? "border-accent bg-accent-weak text-accent-ink"
                    : "border-border bg-surface text-text",
                )}
              >
                <span className="text-[13px] font-extrabold">{g.code}</span>
                <span className="mt-[2px] text-[10.5px] opacity-80">{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <SignaturePad onChange={setHasSig} />
    </Sheet>
  );
}
