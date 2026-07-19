import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon, type IconName } from "@/components/shared/Icons";
import { BULANS, fmtLong, fmtRange, fmtTgl } from "@/lib/date";
import { fmtJamHHMM } from "@/lib/overtime-calc";
import { listOvertimeByUser } from "@/repositories/overtime";
import { listTripsByUser } from "@/repositories/trips";
import { hitungSaldo } from "@/repositories/leaves";
import { listDocuments } from "@/repositories/documents";
import { todayWIB } from "@/lib/wib";

function greeting(): string {
  const h = Number(new Date(Date.now() + 7 * 3600_000).toISOString().slice(11, 13));
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

function extOf(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word")) return "DOC";
  if (mime.includes("sheet")) return "XLS";
  if (mime.includes("image")) return "IMG";
  return "FILE";
}

export default async function BerandaPage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const today = todayWIB();
  const month = today.slice(0, 7);
  const tahun = Number(today.slice(0, 4));

  const [overtime, trips, saldo, allDocs] = await Promise.all([
    listOvertimeByUser(me.id),
    listTripsByUser(me.id),
    hitungSaldo(me.id, tahun),
    listDocuments("generated"),
  ]);

  const bulanRows = overtime.filter((o) => o.tanggal.slice(0, 7) === month);
  const totalBulan = bulanRows.reduce((a, o) => a + o.total_jam, 0);

  const upcoming = trips
    .filter((t) => t.tanggal_selesai >= today)
    .sort((a, b) => (a.tanggal_mulai < b.tanggal_mulai ? -1 : 1))[0];

  // Dokumen yang telah digenerate milik pekerja ini — terbaru di atas (repo sudah sort desc).
  const myDocs = allDocs
    .filter((d) => d.signed_by === me.email || d.uploaded_by === me.email)
    .slice(0, 4);

  const boxes: { label: string; icon: IconName; bg: string; fg: string; href: string; value: string; sub: string }[] = [
    { label: "Lembur", icon: "clock", bg: "var(--lembur-weak)", fg: "var(--lembur)", href: "/lembur", value: `${fmtJamHHMM(totalBulan)} jam`, sub: `${BULANS[Number(month.slice(5)) - 1]} · ${bulanRows.length} catatan` },
    { label: "Cuti", icon: "calendar", bg: "var(--cuti-weak)", fg: "var(--cuti)", href: "/cuti", value: `${saldo.sisa} hari`, sub: `sisa dari ${saldo.kuota + saldo.penyesuaian} hari` },
    { label: "Dinas", icon: "plane", bg: "var(--dinas-weak)", fg: "var(--dinas)", href: "/dinas", value: upcoming ? upcoming.tujuan : "Tidak ada", sub: upcoming ? fmtRange(upcoming.tanggal_mulai, upcoming.tanggal_selesai) : "agenda terdekat" },
    { label: "Kalender", icon: "calendarDots", bg: "var(--accent-weak)", fg: "var(--accent)", href: "/kalender", value: "Jadwal", sub: "lembur, cuti & libur" },
  ];

  return (
    <div className={PHONE_SCROLL}>
      <div className="px-[18px] pb-2 pt-[22px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold text-muted">{greeting()},</div>
            <div className="mt-[1px] text-[22px] font-extrabold tracking-[-.4px]">{me.nama_lengkap}</div>
            <div className="mt-[3px] text-xs font-semibold text-faint">{fmtLong(today)}</div>
          </div>
          <div className="clay-3d flex h-[46px] w-[46px] flex-none items-center justify-center rounded-2xl bg-accent-weak text-base font-extrabold text-accent">
            {me.nama_lengkap.split(" ").slice(0, 2).map((s) => s[0]).join("")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-[18px] pb-1 pt-[14px]">
        {boxes.map((b) => (
          <Link key={b.label} href={b.href} className="clay-sm clay-press flex flex-col rounded-3xl bg-surface p-[15px] text-text transition-all">
            <div className="flex items-center gap-[8px]" style={{ color: b.fg }}>
              <span className="clay-3d flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: b.bg }}>
                <Icon name={b.icon} size={16} />
              </span>
              <span className="text-xs font-bold">{b.label}</span>
            </div>
            <div className="mt-[9px] truncate text-[17px] font-extrabold tracking-[-.2px]">{b.value}</div>
            <div className="mt-[2px] truncate text-[11px] text-faint">{b.sub}</div>
          </Link>
        ))}
      </div>

      <div className="px-[18px] pb-28 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[.5px] text-muted">Dokumen Terakhir</div>
          <Link href="/dokumen" className="text-xs font-bold text-accent">Lihat semua</Link>
        </div>
        <div className="flex flex-col gap-[11px]">
          {myDocs.length === 0 && <div className="clay-sm rounded-2xl bg-surface px-[13px] py-4 text-center text-[12.5px] text-faint">Belum ada dokumen yang dibuat.</div>}
          {myDocs.map((d) => {
            const ext = extOf(d.mime);
            const row = (
              <>
                <span className="clay-3d flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-accent-weak font-mono text-[10px] font-extrabold text-accent">
                  {ext}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold">{d.judul}</div>
                  <div className="mt-[1px] text-[11.5px] text-faint">{ext} · {fmtTgl(d.created_at.slice(0, 10))}</div>
                </div>
              </>
            );
            return d.file_id ? (
              <a key={d.id} href={`/api/files/${d.file_id}`} target="_blank" rel="noreferrer" className="clay-sm flex items-center gap-3 rounded-2xl bg-surface px-[14px] py-3">
                {row}
                <Icon name="download" size={16} className="flex-none text-muted" />
              </a>
            ) : (
              <div key={d.id} className="clay-sm flex items-center gap-3 rounded-2xl bg-surface px-[14px] py-3">
                {row}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
