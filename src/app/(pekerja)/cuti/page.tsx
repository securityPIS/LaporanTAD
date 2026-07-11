"use client";

import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { FAB_CLASS, PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { fmtRange } from "@/lib/date";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";

interface Balance { kuota: number; penyesuaian: number; terpakai: number; sisa: number }
interface LeaveType { id: string; nama: string; potong_saldo: boolean }
interface Leave {
  id: string; leave_type_id: string; tanggal_mulai: string; tanggal_selesai: string;
  jumlah_hari: number; keterangan: string; lampiran_file_id: string;
}

export default function CutiPage() {
  const { openModal, showToast } = useApp();
  const bal = useData<Balance>("/api/leaves/balance");
  const leaves = useData<{ items: Leave[] }>("/api/leaves");
  const types = useData<{ items: LeaveType[] }>("/api/leave-types");

  const typeMap = new Map((types.data?.items ?? []).map((t) => [t.id, t]));
  const saldo = bal.data ?? { kuota: 12, penyesuaian: 0, terpakai: 0, sisa: 12 };
  const deg = `${Math.round((saldo.terpakai / Math.max(saldo.kuota + saldo.penyesuaian, 1)) * 360)}deg`;

  function reloadAll() {
    bal.reload();
    leaves.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan cuti ini? Saldo akan dikoreksi otomatis.")) return;
    try {
      await apiSend(`/api/leaves/${id}`, "DELETE");
      showToast("Cuti dihapus");
      reloadAll();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  const list = (leaves.data?.items ?? []).map((c) => {
    const t = typeMap.get(c.leave_type_id);
    const potong = t?.potong_saldo ?? false;
    return {
      id: c.id,
      jenis: t?.nama ?? "Cuti",
      tag: potong ? "Potong saldo" : "Tidak potong",
      badgeBg: potong ? "var(--cuti-weak)" : "var(--lembur-weak)",
      badgeFg: potong ? "var(--cuti)" : "var(--lembur)",
      hari: c.jumlah_hari,
      rentang: fmtRange(c.tanggal_mulai, c.tanggal_selesai),
      ket: c.keterangan,
      lampiran: c.lampiran_file_id,
    };
  });

  return (
    <>
      <div className={PHONE_SCROLL}>
        <div className="px-[18px] pb-[6px] pt-5">
          <div className="text-[22px] font-extrabold tracking-[-.4px]">Cuti</div>
          <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Saldo & riwayat tahun {new Date().getFullYear()}</div>
        </div>

        <div className="px-[18px] pb-[6px] pt-[14px]">
          <div className="flex items-center gap-[18px] rounded-[18px] border border-border bg-surface p-[18px] shadow-sm">
            <div
              className="relative flex h-24 w-24 flex-none items-center justify-center rounded-full"
              style={{ background: `conic-gradient(var(--accent) ${deg}, var(--surface-3) 0)` }}
            >
              <div className="flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full bg-surface">
                <span className="font-mono text-2xl font-bold leading-none">{saldo.sisa}</span>
                <span className="text-[10px] font-bold text-faint">SISA HARI</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-muted">Kuota tahunan</span>
                <span className="font-mono text-sm font-bold">{saldo.kuota + saldo.penyesuaian} hari</span>
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
          <div className="mt-2 text-center text-[11px] text-faint">Saldo hangus pada pergantian tahun kalender.</div>
        </div>

        <div className="px-[18px] pb-24 pt-[14px]">
          <div className="mb-3 text-xs font-bold uppercase tracking-[.5px] text-muted">Riwayat</div>
          {leaves.loading && <Skeleton rows={2} />}
          {!leaves.loading && list.length === 0 && (
            <EmptyState icon="calendar" title="Belum ada cuti" hint="Ketuk + untuk mengajukan cuti." />
          )}
          <div className="flex flex-col gap-[10px]">
            {list.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-surface px-[14px] py-[13px] shadow-sm">
                <div className="flex items-center justify-between gap-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-extrabold">{c.jenis}</span>
                    <span className="rounded-md px-2 py-[2.5px] text-[10px] font-extrabold" style={{ background: c.badgeBg, color: c.badgeFg }}>
                      {c.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{c.hari} hari</span>
                    <button onClick={() => handleDelete(c.id)} aria-label="Hapus" className="flex h-[28px] w-[28px] items-center justify-center rounded-lg border border-border bg-surface-2 text-faint">
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-[6px] text-xs text-muted">{c.rentang}</div>
                {c.ket && <div className="mt-[3px] text-xs text-faint">{c.ket}</div>}
                {c.lampiran && (
                  <a href={`/api/files/${c.lampiran}`} target="_blank" rel="noreferrer" className="mt-[6px] inline-flex items-center gap-1 text-[11.5px] font-bold text-accent">
                    <Icon name="doc" size={13} /> Lihat lampiran
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => openModal("cuti", undefined, reloadAll)} className={FAB_CLASS}>
        <Icon name="plus" size={18} strokeWidth={2.6} />
        Ajukan
      </button>
    </>
  );
}
