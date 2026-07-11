"use client";

import { useApp } from "@/lib/store";
import { FAB_CLASS, PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { groupOvertime } from "@/lib/overtime";

export default function LemburPage() {
  const { overtime, deleteOvertime, openModal, showToast } = useApp();
  const groups = groupOvertime(overtime);

  function handleDelete(id: string) {
    deleteOvertime(id);
    showToast("Catatan dihapus");
  }

  return (
    <>
      <div className={PHONE_SCROLL}>
        <div className="sticky top-0 z-[5] bg-surface px-[18px] pb-[6px] pt-5">
          <div className="text-[22px] font-extrabold tracking-[-.4px]">Lembur</div>
          <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Catatan lembur milik Anda</div>
        </div>

        <div className="px-[18px] pb-24 pt-[6px]">
          {groups.map((g) => (
            <div key={g.key} className="mt-[18px]">
              <div className="mb-[10px] flex items-center justify-between">
                <span className="text-[13px] font-extrabold tracking-[-.2px]">{g.label}</span>
                <span className="rounded-[20px] bg-surface-3 px-[9px] py-1 font-mono text-[11.5px] font-bold text-muted">
                  {g.total} jam
                </span>
              </div>

              <div className="flex flex-col gap-[10px]">
                {g.items.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-border bg-surface px-[14px] py-[13px] shadow-sm"
                    style={{ animation: "ltUp .3s ease both" }}
                  >
                    <div className="flex items-start justify-between gap-[10px]">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-extrabold">{it.hari}</span>
                          <span
                            className="rounded-md px-2 py-[2.5px] text-[10.5px] font-extrabold tracking-[.2px]"
                            style={{ background: it.jw, color: it.jc }}
                          >
                            {it.jenisLabel}
                          </span>
                        </div>
                        <div className="mt-[6px] text-[12.5px] leading-[1.4] text-muted">{it.ket}</div>
                        {it.replaced && (
                          <div className="mt-[5px] text-[11.5px] font-semibold text-cuti">
                            ↳ menggantikan {it.replaced}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(it.id)}
                        aria-label="Hapus catatan"
                        className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border border-border bg-surface-2 text-faint"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>

                    <div className="mt-[11px] flex items-center gap-[14px] border-t border-dashed border-border pt-[11px]">
                      <div className="flex items-center gap-[6px] font-mono text-[12.5px] font-medium text-muted">
                        <Icon name="clock" size={14} />
                        {it.jam}
                      </div>
                      <div className="ml-auto font-mono text-[15px] font-bold text-text">
                        {it.total} <span className="font-sans text-[11px] text-faint">jam</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => openModal("lembur")} className={FAB_CLASS}>
        <Icon name="plus" size={18} strokeWidth={2.6} />
        Catat
      </button>
    </>
  );
}
