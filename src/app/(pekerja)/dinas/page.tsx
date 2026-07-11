"use client";

import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { FAB_CLASS, PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { fmtRange } from "@/lib/date";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";

interface Trip {
  id: string; tujuan: string; tanggal_mulai: string; tanggal_selesai: string;
  keperluan: string; transportasi: string; keterangan: string; lampiran_file_id: string;
}

export default function DinasPage() {
  const { openModal, showToast } = useApp();
  const { data, loading, reload } = useData<{ items: Trip[] }>("/api/trips");
  const items = data?.items ?? [];

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan dinas ini?")) return;
    try {
      await apiSend(`/api/trips/${id}`, "DELETE");
      showToast("Dinas dihapus");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  return (
    <>
      <div className={PHONE_SCROLL}>
        <div className="px-[18px] pb-[6px] pt-5">
          <div className="text-[22px] font-extrabold tracking-[-.4px]">Dinas</div>
          <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Catatan perjalanan dinas Anda</div>
        </div>

        <div className="px-[18px] pb-24 pt-[10px]">
          {loading && <Skeleton rows={2} />}
          {!loading && items.length === 0 && (
            <EmptyState icon="globe" title="Belum ada dinas" hint="Ketuk + untuk mencatat perjalanan dinas." />
          )}
          <div className="flex flex-col gap-[10px]">
            {items.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border bg-surface px-[14px] py-[13px] shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dinas-weak text-dinas">
                      <Icon name="globe" size={16} />
                    </span>
                    <div>
                      <div className="text-[14px] font-extrabold">{t.tujuan}</div>
                      <div className="text-[11.5px] text-faint">{fmtRange(t.tanggal_mulai, t.tanggal_selesai)}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(t.id)} aria-label="Hapus" className="flex h-[28px] w-[28px] items-center justify-center rounded-lg border border-border bg-surface-2 text-faint">
                    <Icon name="trash" size={14} />
                  </button>
                </div>
                <div className="mt-[8px] text-[12.5px] text-muted">{t.keperluan}</div>
                {t.transportasi && <div className="mt-[3px] text-[11.5px] text-faint">Transportasi: {t.transportasi}</div>}
                {t.lampiran_file_id && (
                  <a href={`/api/files/${t.lampiran_file_id}`} target="_blank" rel="noreferrer" className="mt-[6px] inline-flex items-center gap-1 text-[11.5px] font-bold text-accent">
                    <Icon name="doc" size={13} /> Lihat lampiran
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => openModal("dinas", undefined, reload)} className={FAB_CLASS}>
        <Icon name="plus" size={18} strokeWidth={2.6} />
        Catat
      </button>
    </>
  );
}
