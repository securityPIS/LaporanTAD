import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon, type IconName } from "@/components/shared/Icons";
import { BULANS, HARI, fmtLong, fmtRange, parseISO } from "@/lib/date";
import { fmtJamHHMM } from "@/lib/overtime-calc";
import { jenisMeta } from "@/lib/overtime-view";
import { listOvertimeByUser } from "@/repositories/overtime";
import { listTripsByUser } from "@/repositories/trips";
import { hitungSaldo } from "@/repositories/leaves";
import { getNumberSetting } from "@/lib/settings";
import { todayWIB } from "@/lib/wib";
import { seninMingguIni } from "@/lib/overtime-calc";

const MENU: { label: string; icon: IconName; bg: string; fg: string; href: string }[] = [
  { label: "Lembur", icon: "clock", bg: "var(--lembur-weak)", fg: "var(--lembur)", href: "/lembur" },
  { label: "Cuti", icon: "calendar", bg: "var(--cuti-weak)", fg: "var(--cuti)", href: "/cuti" },
  { label: "Dinas", icon: "globe", bg: "var(--dinas-weak)", fg: "var(--dinas)", href: "/dinas" },
  { label: "Dokumen", icon: "doc", bg: "var(--accent-weak)", fg: "var(--accent)", href: "/dokumen" },
];

function greeting(): string {
  const h = Number(new Date(Date.now() + 7 * 3600_000).toISOString().slice(11, 13));
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function BerandaPage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const today = todayWIB();
  const month = today.slice(0, 7);
  const tahun = Number(today.slice(0, 4));

  const [overtime, trips, saldo, batasMinggu] = await Promise.all([
    listOvertimeByUser(me.id),
    listTripsByUser(me.id),
    hitungSaldo(me.id, tahun),
    getNumberSetting("batas_lembur_mingguan"),
  ]);

  const bulanRows = overtime.filter((o) => o.tanggal.slice(0, 7) === month);
  const totalBulan = bulanRows.reduce((a, o) => a + o.total_jam, 0);

  const senin = seninMingguIni(today);
  const totalMinggu = overtime.filter((o) => o.tanggal >= senin && o.tanggal <= today).reduce((a, o) => a + o.total_jam, 0);
  const sisaMinggu = Math.max(batasMinggu - totalMinggu, 0);

  const recent = overtime.slice(0, 3).map((o) => {
    const m = jenisMeta(o.jenis);
    const dt = parseISO(o.tanggal);
    return {
      id: o.id,
      ket: o.keterangan,
      sub: `${HARI[dt.getDay()]}, ${dt.getDate()} ${BULANS[dt.getMonth()]} · ${m.label}`,
      jam: fmtJamHHMM(o.total_jam),
      dot: m.c,
    };
  });

  const upcoming = trips
    .filter((t) => t.tanggal_selesai >= today)
    .sort((a, b) => (a.tanggal_mulai < b.tanggal_mulai ? -1 : 1))[0];

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
        <div className="clay relative col-span-2 overflow-hidden rounded-3xl p-[18px] text-white" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-ink))" }}>
          <div className="absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full bg-white/10" />
          <div className="text-xs font-semibold opacity-90">Total lembur {BULANS[Number(month.slice(5)) - 1]} {tahun}</div>
          <div className="mt-[6px] flex items-baseline gap-[6px]">
            <span className="font-mono text-[34px] font-bold tracking-[-1px]">{fmtJamHHMM(totalBulan)}</span>
            <span className="text-sm font-semibold opacity-90">jam</span>
          </div>
          <div className="mt-1 text-[11.5px] opacity-80">dari {bulanRows.length} catatan · sisa kuota mingguan {fmtJamHHMM(sisaMinggu)} jam</div>
        </div>

        <div className="clay-sm rounded-3xl bg-surface p-[15px]">
          <div className="flex items-center gap-[8px] text-cuti">
            <span className="clay-3d flex h-8 w-8 items-center justify-center rounded-xl bg-cuti-weak">
              <Icon name="calendar" size={16} />
            </span>
            <span className="text-xs font-bold">Sisa cuti</span>
          </div>
          <div className="mt-[9px] font-mono text-[26px] font-bold">
            {saldo.sisa} <span className="font-sans text-[13px] text-faint">hari</span>
          </div>
          <div className="mt-[2px] text-[11px] text-faint">dari {saldo.kuota + saldo.penyesuaian} hari / tahun</div>
        </div>

        <div className="clay-sm rounded-3xl bg-surface p-[15px]">
          <div className="flex items-center gap-[8px] text-dinas">
            <span className="clay-3d flex h-8 w-8 items-center justify-center rounded-xl bg-dinas-weak">
              <Icon name="globe" size={16} />
            </span>
            <span className="text-xs font-bold">Terdekat</span>
          </div>
          {upcoming ? (
            <>
              <div className="mt-[7px] text-[15px] font-extrabold tracking-[-.2px]">Dinas · {upcoming.tujuan}</div>
              <div className="mt-[2px] text-[11px] text-faint">{fmtRange(upcoming.tanggal_mulai, upcoming.tanggal_selesai)}</div>
            </>
          ) : (
            <div className="mt-[7px] text-[13px] font-semibold text-faint">Tidak ada agenda</div>
          )}
        </div>
      </div>

      <div className="px-[18px] pb-1 pt-5">
        <div className="mb-3 text-xs font-bold uppercase tracking-[.5px] text-muted">Menu Cepat</div>
        <div className="grid grid-cols-4 gap-[10px]">
          {MENU.map((m) => (
            <Link key={m.label} href={m.href} className="clay-sm clay-press flex flex-col items-center gap-[9px] rounded-2xl bg-surface p-[14px_4px] text-text transition-all">
              <span className="clay-3d flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: m.bg, color: m.fg }}>
                <Icon name={m.icon} size={21} />
              </span>
              <span className="text-[11px] font-bold">{m.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-[18px] pb-28 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[.5px] text-muted">Aktivitas Terakhir</div>
          <Link href="/lembur" className="text-xs font-bold text-accent">Lihat semua</Link>
        </div>
        <div className="flex flex-col gap-[11px]">
          {recent.length === 0 && <div className="clay-sm rounded-2xl bg-surface px-[13px] py-4 text-center text-[12.5px] text-faint">Belum ada aktivitas lembur.</div>}
          {recent.map((r) => (
            <div key={r.id} className="clay-sm flex items-center gap-3 rounded-2xl bg-surface px-[14px] py-3">
              <span className="h-2 w-2 flex-none rounded-full" style={{ background: r.dot }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold">{r.ket}</div>
                <div className="mt-[1px] text-[11.5px] text-faint">{r.sub}</div>
              </div>
              <div className="font-mono text-[13px] font-semibold text-muted">{r.jam}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
