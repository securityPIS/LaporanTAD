import { Icon, type IconName } from "@/components/shared/Icons";
import { cn } from "@/lib/cn";
import type { DocState, Tone, TripPhase } from "@/lib/trip-view";

const TONE_CLASS: Record<Tone, string> = {
  dinas: "bg-dinas-weak text-dinas",
  cuti: "bg-cuti-weak text-cuti",
  lembur: "bg-lembur-weak text-lembur",
  faint: "bg-surface-3 text-faint",
};

const TONE_TEXT: Record<Tone, string> = {
  dinas: "text-dinas",
  cuti: "text-cuti",
  lembur: "text-lembur",
  faint: "text-faint",
};

const PHASE_ICON: Record<TripPhase, IconName> = {
  draft: "clock",
  spd_terbit: "plane",
  menunggu_deklarasi: "clock",
  selesai: "check",
};

/** Lencana fase perjalanan (Perlu SPD / Sedang dinas / Perlu Deklarasi / Selesai). */
export function PhaseBadge({ phase, label, tone }: { phase: TripPhase; label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-[9px] py-1 text-[10.5px] font-extrabold",
        TONE_CLASS[tone],
      )}
    >
      <Icon name={PHASE_ICON[phase]} size={11} strokeWidth={2.4} />
      {label}
    </span>
  );
}

const DOC_META: Record<DocState, { tone: Tone; icon: IconName; label: string }> = {
  terbit: { tone: "lembur", icon: "check", label: "Terbit" },
  menunggu: { tone: "cuti", icon: "clock", label: "Menunggu" },
  terkunci: { tone: "faint", icon: "lock", label: "Terkunci" },
};

/** Pil status satu dokumen (SPD / Deklarasi) pada kartu dinas. */
export function DocPill({ nama, state, note }: { nama: string; state: DocState; note?: string }) {
  const m = DOC_META[state];
  return (
    <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface-2 px-[10px] py-2">
      <span className={cn("flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md", TONE_CLASS[m.tone])}>
        <Icon name={m.icon} size={13} strokeWidth={2.4} />
      </span>
      <div className="leading-tight">
        <div className="text-[11px] font-extrabold">{nama}</div>
        <div className={cn("text-[9.5px] font-bold", TONE_TEXT[m.tone])}>{note || m.label}</div>
      </div>
    </div>
  );
}
