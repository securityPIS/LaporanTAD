"use client";

import { useApp } from "@/lib/store";
import { useData } from "@/lib/client";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { fmtTgl } from "@/lib/date";
import { Skeleton } from "@/components/shared/Skeleton";

interface Doc {
  id: string; judul: string; kategori: string; jenis_dok: string; sumber_entitas: string;
  file_id: string; mime: string; ukuran: number; created_at: string;
}

function extOf(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word")) return "DOC";
  if (mime.includes("sheet")) return "XLS";
  if (mime.includes("image")) return "IMG";
  return "FILE";
}
function sizeOf(n: number): string {
  if (!n) return "";
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export default function DokumenPage() {
  const { openModal } = useApp();
  const umum = useData<{ items: Doc[] }>("/api/documents?kategori=umum");
  const generated = useData<{ items: Doc[] }>("/api/documents?kategori=generated");

  const cats = groupByCat(umum.data?.items ?? []);

  return (
    <div className={PHONE_SCROLL}>
      <div className="px-[18px] pb-[6px] pt-5">
        <div className="text-[22px] font-extrabold tracking-[-.4px]">Dokumen</div>
        <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Unduh dokumen umum & buat surat resmi</div>
      </div>

      <div className="px-[18px] pb-[6px] pt-[14px]">
        <button
          onClick={() => openModal("gen", undefined, () => generated.reload())}
          className="flex w-full items-center gap-[13px] rounded-2xl border-none p-[15px_16px] text-left text-white shadow"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-ink))" }}
        >
          <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl bg-white/[.16]">
            <Icon name="docCheck" size={21} />
          </span>
          <span className="flex-1">
            <span className="block text-[14.5px] font-extrabold">Buat Dokumen Resmi</span>
            <span className="mt-[2px] block text-xs opacity-90">SPKL · SPD · Deklarasi Dinas · Surat Cuti — wajib TTD</span>
          </span>
          <Icon name="chevronRight" size={20} strokeWidth={2.2} />
        </button>
      </div>

      <div className="px-[18px] pb-24 pt-4">
        {generated.data && generated.data.items.length > 0 && (
          <div className="mt-1">
            <div className="mb-[10px] text-xs font-bold uppercase tracking-[.5px] text-muted">Dokumen Saya (bertanda tangan)</div>
            <div className="flex flex-col gap-[9px]">
              {generated.data.items.map((d) => (
                <DocRow key={d.id} d={d} />
              ))}
            </div>
          </div>
        )}

        {umum.loading && <Skeleton rows={2} />}
        {cats.map((cat) => (
          <div key={cat.name} className="mt-4">
            <div className="mb-[10px] text-xs font-bold uppercase tracking-[.5px] text-muted">{cat.name}</div>
            <div className="flex flex-col gap-[9px]">
              {cat.items.map((d) => (
                <DocRow key={d.id} d={d} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocRow({ d }: { d: Doc }) {
  const ext = extOf(d.mime);
  const color =
    ext === "PDF" ? ["var(--libur-weak)", "var(--libur)"] :
    ext === "XLS" ? ["var(--lembur-weak)", "var(--lembur)"] :
    ext === "DOC" ? ["var(--accent-weak)", "var(--accent)"] : ["var(--dinas-weak)", "var(--dinas)"];
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface px-[13px] py-3">
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] font-mono text-[10px] font-extrabold" style={{ background: color[0], color: color[1] }}>
        {ext}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{d.judul}</div>
        <div className="mt-[1px] text-[11px] text-faint">
          {ext} {sizeOf(d.ukuran) && `· ${sizeOf(d.ukuran)}`} · {fmtTgl(d.created_at.slice(0, 10))}
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
  );
}

function groupByCat(items: Doc[]): { name: string; items: Doc[] }[] {
  const by: Record<string, Doc[]> = {};
  items.forEach((d) => {
    const k = d.sumber_entitas || "Lainnya";
    (by[k] = by[k] || []).push(d);
  });
  return Object.keys(by).map((name) => ({ name, items: by[name] }));
}
