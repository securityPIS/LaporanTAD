// Turunan tampilan untuk satu perjalanan dinas. Sumber kebenaran fase adalah
// kolom `status` (dipelihara saat SPD/Deklarasi terbit) + tanggal selesai:
// "menunggu_deklarasi" bukan disimpan melainkan diturunkan saat SPD sudah
// terbit dan tanggal dinas telah lewat. Fungsi murni agar mudah diuji.

import type { TripCostRow, TripRow } from "./db/tables";

export type TripPhase = "draft" | "spd_terbit" | "menunggu_deklarasi" | "selesai";

/** Status satu dokumen pada kartu dinas. */
export type DocState = "terbit" | "menunggu" | "terkunci";

/** Nada warna (dipetakan ke token Tailwind oleh komponen). */
export type Tone = "dinas" | "cuti" | "lembur" | "faint";

export interface TripView extends TripRow {
  phase: TripPhase;
  phase_label: string;
  phase_tone: Tone;
  /** Langkah aktif pada stepper 3-fase (1..3). */
  langkah: 1 | 2 | 3;
  spd_state: DocState;
  deklarasi_state: DocState;
  /** True bila realisasi & rincian biaya sudah diisi (Deklarasi siap digenerate). */
  deklarasi_terisi: boolean;
  total_biaya: number;
}

const PHASE_META: Record<TripPhase, { label: string; tone: Tone; langkah: 1 | 2 | 3 }> = {
  draft: { label: "Perlu SPD", tone: "cuti", langkah: 1 },
  spd_terbit: { label: "Sedang dinas", tone: "dinas", langkah: 2 },
  menunggu_deklarasi: { label: "Perlu Deklarasi", tone: "cuti", langkah: 2 },
  selesai: { label: "Selesai", tone: "lembur", langkah: 3 },
};

/** Fase dinas dari status tersimpan + tanggal hari ini (WIB, "YYYY-MM-DD"). */
export function tripPhase(
  trip: Pick<TripRow, "status" | "tanggal_selesai">,
  today: string,
): TripPhase {
  if (trip.status === "selesai") return "selesai";
  if (trip.status === "spd_terbit" || trip.status === "menunggu_deklarasi") {
    return today > trip.tanggal_selesai ? "menunggu_deklarasi" : "spd_terbit";
  }
  return "draft"; // termasuk data lama yang belum bermigrasi
}

/** Status pill SPD: terbit setelah SPD dibuat, jika belum → menunggu. */
export function spdState(phase: TripPhase): DocState {
  return phase === "draft" ? "menunggu" : "terbit";
}

/** Status pill Deklarasi: terkunci sampai SPD terbit, terbit saat dinas ditutup. */
export function deklarasiState(phase: TripPhase): DocState {
  if (phase === "selesai") return "terbit";
  if (phase === "draft") return "terkunci";
  return "menunggu";
}

export function totalBiaya(costs: Pick<TripCostRow, "jumlah">[]): number {
  return costs.reduce((s, c) => s + (Number(c.jumlah) || 0), 0);
}

/** Rakit tampilan lengkap satu dinas dari baris trip + biayanya. */
export function buildTripView(trip: TripRow, costs: TripCostRow[], today: string): TripView {
  const phase = tripPhase(trip, today);
  const meta = PHASE_META[phase];
  return {
    ...trip,
    phase,
    phase_label: meta.label,
    phase_tone: meta.tone,
    langkah: meta.langkah,
    spd_state: spdState(phase),
    deklarasi_state: deklarasiState(phase),
    deklarasi_terisi: Boolean(trip.tanggal_realisasi_mulai) || costs.length > 0,
    total_biaya: totalBiaya(costs),
  };
}
