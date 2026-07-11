"use client";

import { useApp } from "@/lib/store";
import { FAB_CLASS, PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { fmtRange } from "@/lib/date";
import { hitungSaldo } from "@/lib/cuti";
import { SEED_CUTI } from "@/lib/mock-data";

export default function CutiPage() {
  const { openModal } = useApp();
  const saldo = hitungSaldo(SEED_CUTI);

  const list = SEED_CUTI.map((c) => ({
    id: c.id,
    jenis: c.jenis,
    tag: c.potong ? "Potong saldo" : "Tidak potong",
    badgeBg: c.potong ? "var(--cuti-weak)" : "var(--lembur-weak)",
    badgeFg: c.potong ? "var(--cuti)" : "var(--lembur)",
    hari: c.hari,
    rentang: fmtRange(c.mulai, c.selesai),
    ket: c.ket,
  }));

  return (
    <>
      <div className={PHONE_SCROLL}>
        <div className="px-[18px] pb-[6px] pt-5">
          <div className="text-[22px] font-extrabold tracking-[-.4px]">Cuti</div>
          <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Saldo & riwayat tahun 2026</div>
        </div>

        <div className="px-[18px] pb-[6px] pt-[14px]">
          <div className="flex items-center gap-[18px] rounded-[18px] border border-border bg-surface p-[18px] shadow-sm">
            <div
              className="relative flex h-24 w-24 flex-none items-center justify-center rounded-full"
              style={{ background: `conic-gradient(var(--accent) ${saldo.deg}, var(--surface-3) 0)` }}
            >
              <div className="flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full bg-surface">
                <span className="font-mono text-2xl font-bold leading-none">{saldo.sisa}</span>
                <span className="text-[10px] font-bold text-faint">SISA HARI</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-muted">Kuota tahunan</span>
                <span className="font-mono text-sm font-bold">{saldo.kuota} hari</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-muted">Terpakai</span>
                <span className="font-mono text-sm font-bold text-cuti">{saldo.terpakai} hari</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-[9px]">
                <span className="text-[12.5px] font-bold text-text">Sisa</span>
                <span className="font-mono text-[15px] font-bold text-accent">{saldo.sisa} hari</span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-center text-[11px] text-faint">
            Saldo hangus pada pergantian tahun kalender.
          </div>
        </div>

        <div className="px-[18px] pb-24 pt-[14px]">
          <div className="mb-3 text-xs font-bold uppercase tracking-[.5px] text-muted">Riwayat</div>
          <div className="flex flex-col gap-[10px]">
            {list.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-surface px-[14px] py-[13px] shadow-sm">
                <div className="flex items-center justify-between gap-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-extrabold">{c.jenis}</span>
                    <span
                      className="rounded-md px-2 py-[2.5px] text-[10px] font-extrabold"
                      style={{ background: c.badgeBg, color: c.badgeFg }}
                    >
                      {c.tag}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold">{c.hari} hari</span>
                </div>
                <div className="mt-[6px] text-xs text-muted">{c.rentang}</div>
                <div className="mt-[3px] text-xs text-faint">{c.ket}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => openModal("cuti")} className={FAB_CLASS}>
        <Icon name="plus" size={18} strokeWidth={2.6} />
        Ajukan
      </button>
    </>
  );
}
