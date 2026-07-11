"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/client";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { BULAN, fmtLong } from "@/lib/date";
import { todayWIB } from "@/lib/wib";

type CalType = "libur" | "cuti" | "dinas" | "lembur";
interface CalEvent { iso: string; type: CalType; label: string; own: boolean }

const DOWS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const TODAY = todayWIB();
const TYPE_COLOR: Record<CalType, string> = {
  libur: "var(--libur)",
  cuti: "var(--cuti)",
  dinas: "var(--dinas)",
  lembur: "var(--lembur)",
};
const LEGEND: { label: string; type: CalType }[] = [
  { label: "Libur", type: "libur" },
  { label: "Cuti", type: "cuti" },
  { label: "Dinas", type: "dinas" },
  { label: "Lembur", type: "lembur" },
];

export default function KalenderPage() {
  const now = new Date();
  const [calY, setCalY] = useState(now.getFullYear());
  const [calM, setCalM] = useState(now.getMonth());
  const [calSel, setCalSel] = useState(TODAY);
  const [events, setEvents] = useState<CalEvent[]>([]);

  const month = `${calY}-${String(calM + 1).padStart(2, "0")}`;
  useEffect(() => {
    apiGet<{ events: CalEvent[] }>(`/api/calendar?month=${month}`).then((d) => setEvents(d.events)).catch(() => setEvents([]));
  }, [month]);

  const evByDay = useMemo(() => {
    const map: Record<string, CalType[]> = {};
    events.forEach((e) => {
      (map[e.iso] = map[e.iso] || []).push(e.type);
    });
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(calY, calM, 1);
    const startDow = first.getDay();
    const dim = new Date(calY, calM + 1, 0).getDate();
    const out: { day: string; iso: string | null }[] = [];
    for (let i = 0; i < startDow; i++) out.push({ day: "", iso: null });
    for (let d = 1; d <= dim; d++) {
      const iso = `${calY}-${String(calM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      out.push({ day: String(d), iso });
    }
    return out;
  }, [calY, calM]);

  function prev() {
    setCalM((m) => (m === 0 ? (setCalY((y) => y - 1), 11) : m - 1));
  }
  function next() {
    setCalM((m) => (m === 11 ? (setCalY((y) => y + 1), 0) : m + 1));
  }

  const selEvents = events.filter((e) => e.iso === calSel);
  const navBtn = "flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-surface text-muted";

  return (
    <div className={PHONE_SCROLL}>
      <div className="px-[18px] pb-[6px] pt-5">
        <div className="text-[22px] font-extrabold tracking-[-.4px]">Kalender</div>
        <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Libur, cuti, dinas & lembur satu bagian</div>
      </div>

      <div className="px-[18px] pb-24 pt-[14px]">
        <div className="mb-[14px] flex items-center justify-between">
          <button onClick={prev} aria-label="Bulan sebelumnya" className={navBtn}>
            <Icon name="chevronLeft" size={16} strokeWidth={2.2} />
          </button>
          <span className="text-[15px] font-extrabold tracking-[-.2px]">{BULAN[calM]} {calY}</span>
          <button onClick={next} aria-label="Bulan berikutnya" className={navBtn}>
            <Icon name="chevronRight" size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="mb-[6px] grid grid-cols-7 gap-[3px]">
          {DOWS.map((d) => (
            <div key={d} className="py-1 text-center text-[10.5px] font-bold text-faint">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[3px]">
          {cells.map((c, i) => {
            if (!c.iso) return <div key={`b${i}`} className="aspect-square" />;
            const isSel = c.iso === calSel;
            const isToday = c.iso === TODAY;
            const types = Array.from(new Set(evByDay[c.iso] || []));
            return (
              <button
                key={c.iso}
                onClick={() => setCalSel(c.iso!)}
                className="flex aspect-square flex-col items-center justify-center rounded-[11px] p-[2px] font-mono text-[13px] font-bold"
                style={{
                  background: isSel ? "var(--accent)" : isToday ? "var(--accent-weak)" : "transparent",
                  color: isSel ? "#fff" : isToday ? "var(--accent)" : "var(--text)",
                }}
              >
                <span>{c.day}</span>
                <span className="mt-[3px] flex h-[5px] gap-[2px]">
                  {types.map((t) => (
                    <span key={t} className="h-[5px] w-[5px] rounded-full" style={{ background: isSel ? "rgba(255,255,255,.9)" : TYPE_COLOR[t] }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 rounded-[14px] border border-border bg-surface-2 px-[14px] py-3">
          {LEGEND.map((l) => (
            <div key={l.type} className="flex items-center gap-[6px]">
              <span className="h-[9px] w-[9px] rounded-full" style={{ background: TYPE_COLOR[l.type] }} />
              <span className="text-[11.5px] font-semibold text-muted">{l.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-[18px]">
          <div className="mb-[10px] text-[13px] font-extrabold">{fmtLong(calSel)}</div>
          <div className="flex flex-col gap-2">
            {selEvents.length === 0 ? (
              <div className="p-[22px] text-center text-[12.5px] text-faint">Tidak ada kejadian pada tanggal ini.</div>
            ) : (
              selEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-[11px] rounded-[13px] border border-border bg-surface px-[13px] py-[11px]">
                  <span className="w-1 self-stretch rounded" style={{ background: TYPE_COLOR[e.type] }} />
                  <div className="flex-1">
                    <div className="text-[12.5px] font-bold">{e.label}</div>
                    <div className="mt-[1px] text-[11px] capitalize text-faint">{e.type}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
