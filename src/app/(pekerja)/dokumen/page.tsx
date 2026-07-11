"use client";

import { useApp } from "@/lib/store";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { DOC_CATS } from "@/lib/mock-data";

export default function DokumenPage() {
  const { openModal, showToast } = useApp();

  return (
    <div className={PHONE_SCROLL}>
      <div className="px-[18px] pb-[6px] pt-5">
        <div className="text-[22px] font-extrabold tracking-[-.4px]">Dokumen</div>
        <div className="mt-[2px] text-[12.5px] font-semibold text-faint">
          Unduh dokumen umum & buat surat resmi
        </div>
      </div>

      <div className="px-[18px] pb-[6px] pt-[14px]">
        <button
          onClick={() => openModal("gen")}
          className="flex w-full items-center gap-[13px] rounded-2xl border-none p-[15px_16px] text-left text-white shadow"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-ink))" }}
        >
          <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl bg-white/[.16]">
            <Icon name="docCheck" size={21} />
          </span>
          <span className="flex-1">
            <span className="block text-[14.5px] font-extrabold">Buat Dokumen Resmi</span>
            <span className="mt-[2px] block text-xs opacity-90">
              SPKL · SPD · Deklarasi Dinas · Surat Cuti — wajib TTD
            </span>
          </span>
          <Icon name="chevronRight" size={20} strokeWidth={2.2} />
        </button>
      </div>

      <div className="px-[18px] pb-24 pt-4">
        {DOC_CATS.map((cat) => (
          <div key={cat.name} className="mt-4">
            <div className="mb-[10px] text-xs font-bold uppercase tracking-[.5px] text-muted">
              {cat.name}
            </div>
            <div className="flex flex-col gap-[9px]">
              {cat.items.map((d) => (
                <div
                  key={d.judul}
                  className="flex items-center gap-3 rounded-[14px] border border-border bg-surface px-[13px] py-3"
                >
                  <span
                    className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] font-mono text-[10px] font-extrabold"
                    style={{ background: d.bg, color: d.fg }}
                  >
                    {d.ext}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold">{d.judul}</div>
                    <div className="mt-[1px] text-[11px] text-faint">{d.meta}</div>
                  </div>
                  <button
                    onClick={() => showToast("Mengunduh dokumen…")}
                    aria-label="Unduh"
                    className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] border border-border bg-surface-2 text-muted"
                  >
                    <Icon name="download" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
