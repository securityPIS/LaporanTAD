"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { useData } from "@/lib/client";
import { FAB_CLASS, PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { PhaseBadge, DocPill } from "@/components/shared/TripStatus";
import { fmtRange } from "@/lib/date";
import { fmtRupiahShort } from "@/lib/rupiah";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";
import type { TripView } from "@/lib/trip-view";

export default function DinasPage() {
  const { openModal } = useApp();
  const { data, loading, reload } = useData<{ items: TripView[] }>("/api/trips");
  const items = data?.items ?? [];

  return (
    <>
      <div className={PHONE_SCROLL}>
        <div className="px-[18px] pb-[6px] pt-5">
          <div className="text-[22px] font-extrabold tracking-[-.4px]">Dinas</div>
          <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Perjalanan dinas & kelengkapan dokumen</div>
        </div>

        <div className="px-[18px] pb-24 pt-[10px]">
          {loading && <Skeleton rows={2} />}
          {!loading && items.length === 0 && (
            <EmptyState icon="plane" title="Belum ada dinas" hint="Ketuk + untuk merencanakan perjalanan dinas & membuat SPD." />
          )}
          <div className="flex flex-col gap-[10px]">
            {items.map((t) => (
              <Link
                key={t.id}
                href={`/dinas/${t.id}`}
                className="block rounded-2xl border border-border bg-surface px-[14px] py-[13px] shadow-sm transition active:scale-[.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dinas-weak text-dinas">
                      <Icon name="plane" size={16} />
                    </span>
                    <div>
                      <div className="text-[14px] font-extrabold">{t.tujuan}</div>
                      <div className="text-[11.5px] text-faint">{fmtRange(t.tanggal_mulai, t.tanggal_selesai)}</div>
                    </div>
                  </div>
                  <PhaseBadge phase={t.phase} label={t.phase_label} tone={t.phase_tone} />
                </div>
                <div className="mt-[8px] text-[12.5px] text-muted">{t.keperluan}</div>
                <div className="mt-[10px] flex gap-2">
                  <DocPill nama="SPD" state={t.spd_state} />
                  <DocPill
                    nama="Deklarasi"
                    state={t.deklarasi_state}
                    note={
                      t.deklarasi_state === "terbit"
                        ? `Terbit · ${fmtRupiahShort(t.total_biaya)}`
                        : t.deklarasi_state === "terkunci"
                          ? "Setelah pulang"
                          : undefined
                    }
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => openModal("dinas", undefined, reload)} className={FAB_CLASS}>
        <Icon name="plus" size={18} strokeWidth={2.6} />
        Rencanakan
      </button>
    </>
  );
}
