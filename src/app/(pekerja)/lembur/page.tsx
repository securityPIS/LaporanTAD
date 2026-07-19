"use client";

import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { FAB_CLASS, PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { groupOvertimeRows, summarizeMonth, type OvertimeApiRow } from "@/lib/overtime-view";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";
import { fmtTgl } from "@/lib/date";

interface Doc {
  id: string;
  judul: string;
  jenis_dok: string;
  file_id: string;
  ukuran: number;
  created_at: string;
}

function sizeOf(n: number): string {
  if (!n) return "";
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export default function LemburPage() {
  const { openModal, showToast } = useApp();
  const { data, loading, error, reload } = useData<{ items: OvertimeApiRow[] }>("/api/overtime");
  const docs = useData<{ items: Doc[] }>("/api/documents?kategori=generated");

  const groups = groupOvertimeRows(data?.items ?? []);
  const summary = summarizeMonth(groups[0]);
  const spklDocs = (docs.data?.items ?? []).filter((d) => d.jenis_dok === "spkl");

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan lembur ini?")) return;
    try {
      await apiSend(`/api/overtime/${id}`, "DELETE");
      showToast("Catatan dihapus");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  function openSpkl() {
    openModal("gen", { jenis: "spkl", spklOnly: true }, () => docs.reload());
  }

  return (
    <>
      <div className={PHONE_SCROLL}>
        <div className="sticky top-0 z-[5] bg-surface px-[18px] pb-[6px] pt-5">
          <div className="text-[22px] font-extrabold tracking-[-.4px]">Lembur</div>
          <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Catatan lembur milik Anda</div>
        </div>

        <div className="px-[18px] pb-24 pt-[6px]">
          {loading && <Skeleton rows={3} />}
          {error && <div className="mt-6 rounded-xl bg-libur-weak px-3 py-2 text-[12.5px] font-semibold text-libur">{error}</div>}

          {/* Ringkasan bulan terbaru */}
          {!loading && !error && summary && (
            <div className="clay-sm mt-[14px] rounded-3xl bg-surface p-[16px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[.5px] text-muted">Ringkasan</span>
                <span className="rounded-[20px] bg-surface-3 px-[10px] py-1 text-[11px] font-bold text-muted">{summary.monthLabel}</span>
              </div>
              <div className="mt-[10px] flex items-end gap-2">
                <span className="clay-3d flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-lembur-weak text-lembur">
                  <Icon name="clock" size={18} />
                </span>
                <div className="ml-1 leading-none">
                  <span className="font-mono text-[26px] font-extrabold tracking-[-.5px]">{summary.total}</span>
                  <span className="ml-1 text-[12px] font-bold text-faint">jam</span>
                </div>
                <span className="ml-auto text-[12px] font-semibold text-faint">{summary.count} catatan</span>
              </div>

              {summary.totalNum > 0 && summary.breakdown.length > 0 && (
                <>
                  <div className="mt-[13px] flex h-[7px] overflow-hidden rounded-full bg-surface-3">
                    {summary.breakdown.map((b) => (
                      <span
                        key={b.jenis}
                        style={{ width: `${(b.num / summary.totalNum) * 100}%`, background: b.jc }}
                        title={`${b.label} · ${b.jam} jam`}
                      />
                    ))}
                  </div>
                  <div className="mt-[11px] flex flex-wrap gap-x-[14px] gap-y-[7px]">
                    {summary.breakdown.map((b) => (
                      <div key={b.jenis} className="flex items-center gap-[6px]">
                        <span className="h-[9px] w-[9px] flex-none rounded-full" style={{ background: b.jc }} />
                        <span className="text-[11.5px] font-semibold text-muted">{b.label}</span>
                        <span className="font-mono text-[11.5px] font-bold text-text">{b.jam}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Aksi: buat dokumen SPKL */}
          {!loading && !error && (
            <button
              onClick={openSpkl}
              className="mt-3 flex w-full items-center gap-[13px] rounded-2xl border-none p-[14px_16px] text-left text-white shadow"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-ink))" }}
            >
              <span className="flex h-[40px] w-[40px] flex-none items-center justify-center rounded-xl bg-white/[.16]">
                <Icon name="docCheck" size={20} />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-extrabold">Buat Dokumen SPKL</span>
                <span className="mt-[2px] block text-[11.5px] opacity-90">Surat Perintah Kerja Lembur — wajib TTD</span>
              </span>
              <Icon name="chevronRight" size={20} strokeWidth={2.2} />
            </button>
          )}

          {/* Dokumen SPKL yang sudah dibuat */}
          {!loading && !error && (docs.loading || spklDocs.length > 0) && (
            <div className="mt-[22px]">
              <div className="mb-[10px] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[.5px] text-muted">Dokumen SPKL</span>
                {spklDocs.length > 0 && (
                  <span className="rounded-[20px] bg-surface-3 px-[9px] py-1 text-[11px] font-bold text-muted">{spklDocs.length}</span>
                )}
              </div>
              {docs.loading && spklDocs.length === 0 ? (
                <Skeleton rows={2} />
              ) : (
                <div className="flex flex-col gap-[9px]">
                  {spklDocs.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-[14px] border border-border bg-surface px-[13px] py-3">
                      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-libur-weak font-mono text-[10px] font-extrabold text-libur">
                        PDF
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold">{d.judul}</div>
                        <div className="mt-[1px] text-[11px] text-faint">
                          SPKL{sizeOf(d.ukuran) && ` · ${sizeOf(d.ukuran)}`} · {fmtTgl(d.created_at.slice(0, 10))}
                        </div>
                      </div>
                      {d.file_id ? (
                        <a href={`/api/files/${d.file_id}`} target="_blank" rel="noreferrer" aria-label="Unduh" className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] border border-border bg-surface-2 text-muted">
                          <Icon name="download" size={16} />
                        </a>
                      ) : (
                        <span className="text-[10.5px] text-faint">tidak tersedia</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Catatan lembur */}
          {!loading && !error && groups.length === 0 && (
            <EmptyState icon="clock" title="Belum ada lembur" hint="Ketuk + untuk mencatat lembur pertama Anda." />
          )}

          {groups.length > 0 && (
            <div className="mb-[10px] mt-[22px] text-xs font-bold uppercase tracking-[.5px] text-muted">Catatan Lembur</div>
          )}

          {groups.map((g) => (
            <div key={g.key} className="mt-[18px] first:mt-0">
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
                          <div className="mt-[5px] text-[11.5px] font-semibold text-cuti">↳ menggantikan {it.replaced}</div>
                        )}
                        {it.evidence && (
                          <a href={`/api/files/${it.evidence}`} target="_blank" rel="noreferrer" className="mt-[6px] inline-flex items-center gap-1 text-[11.5px] font-bold text-accent">
                            <Icon name="doc" size={13} /> Lihat evidence
                          </a>
                        )}
                      </div>
                      <div className="flex flex-none gap-1.5">
                        <button
                          onClick={() => openModal("lembur", { record: it }, reload)}
                          aria-label="Ubah"
                          className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-border bg-surface-2 text-faint"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(it.id)}
                          aria-label="Hapus"
                          className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-border bg-surface-2 text-faint"
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
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

      <button onClick={() => openModal("lembur", undefined, reload)} className={FAB_CLASS}>
        <Icon name="plus" size={18} strokeWidth={2.6} />
        Catat
      </button>
    </>
  );
}
