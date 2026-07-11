"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/client";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { waLink } from "@/lib/phone";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";

interface Entry {
  id: string; nama_lengkap: string; nopek: string; company_id: string;
  lokasi_kerja: string; divisi: string; bagian: string; tipe_kerja: string; nama_shift: string; no_telp: string;
}
interface Company { id: string; nama: string }

function initials(n: string) {
  return n.split(" ").slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
}

export default function PekerjaPage() {
  const { data, loading } = useData<{ items: Entry[] }>("/api/users");
  const companies = useData<{ items: Company[] }>("/api/companies");
  const [q, setQ] = useState("");
  const [lokasi, setLokasi] = useState("");

  const compMap = new Map((companies.data?.items ?? []).map((c) => [c.id, c.nama]));
  const lokasiOpts = useMemo(
    () => Array.from(new Set((data?.items ?? []).map((e) => e.lokasi_kerja))).sort(),
    [data],
  );

  const filtered = (data?.items ?? []).filter((e) => {
    const matchQ = !q || e.nama_lengkap.toLowerCase().includes(q.toLowerCase()) || e.nopek.toLowerCase().includes(q.toLowerCase());
    const matchLok = !lokasi || e.lokasi_kerja === lokasi;
    return matchQ && matchLok;
  });

  return (
    <div className={PHONE_SCROLL}>
      <div className="sticky top-0 z-[5] bg-surface px-[18px] pb-3 pt-5">
        <div className="text-[22px] font-extrabold tracking-[-.4px]">Data Pekerja</div>
        <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Direktori rekan kerja aktif</div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3">
          <Icon name="search" size={16} className="text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau nopek…"
            className="h-11 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          <Chip active={!lokasi} onClick={() => setLokasi("")}>Semua</Chip>
          {lokasiOpts.map((l) => (
            <Chip key={l} active={lokasi === l} onClick={() => setLokasi(l)}>{l}</Chip>
          ))}
        </div>
      </div>

      <div className="px-[18px] pb-24 pt-1">
        {loading && <Skeleton rows={3} />}
        {!loading && filtered.length === 0 && <EmptyState icon="usersMulti" title="Tidak ada pekerja" />}
        <div className="flex flex-col gap-[10px]">
          {filtered.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-[13px] py-3 shadow-sm">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-accent-weak text-[13px] font-extrabold text-accent">
                {initials(e.nama_lengkap)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-extrabold">{e.nama_lengkap}</div>
                <div className="truncate text-[11.5px] text-faint">
                  {e.nopek} · {compMap.get(e.company_id) ?? ""}
                </div>
                <div className="truncate text-[11px] text-faint">
                  {e.lokasi_kerja} · {e.divisi}/{e.bagian} · {e.tipe_kerja === "shift" ? `Shift ${e.nama_shift}` : "Non-shift"}
                </div>
              </div>
              <a
                href={waLink(e.no_telp)}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] border border-border bg-lembur-weak text-lembur"
              >
                <Icon name="whatsapp" size={17} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-bold"
      style={{
        background: active ? "var(--accent)" : "var(--surface-3)",
        color: active ? "#fff" : "var(--muted)",
      }}
    >
      {children}
    </button>
  );
}
