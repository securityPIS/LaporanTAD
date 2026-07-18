import { db } from "./db";
import { AppError } from "./errors";
import { newId } from "./id";
import { nowWIB, periodeOf } from "./wib";

/**
 * Pintu tunggal pengecekan kunci periode (ARSITEKTUR §8 poin 3). Bulan yang
 * rekapnya sudah diserahkan dikunci admin → tambah/ubah/hapus catatan
 * bertanggal pada bulan itu ditolak (termasuk oleh admin).
 */
export async function isPeriodeTerkunci(periode: string): Promise<boolean> {
  const locks = await db.all("period_locks");
  return locks.some((l) => l.periode === periode);
}

/** Lempar error bila periode tanggal terkunci. Dipanggil semua mutasi transaksi. */
export async function assertPeriodeTerbuka(tanggalISO: string): Promise<void> {
  const periode = periodeOf(tanggalISO);
  if (await isPeriodeTerkunci(periode)) {
    throw new AppError(
      "PERIODE_TERKUNCI",
      `Periode ${periode} sudah dikunci admin — catatan tidak dapat diubah. Minta admin membuka kunci terlebih dahulu.`,
      409,
    );
  }
}

export async function listLocks() {
  return db.all("period_locks");
}

export async function lockPeriode(periode: string, actorEmail: string) {
  const existing = await db.findOne("period_locks", (l) => l.periode === periode);
  if (existing) return existing;
  const row = { id: newId(), periode, locked_by: actorEmail, locked_at: nowWIB() };
  return db.insert("period_locks", row);
}

export async function unlockPeriode(periode: string) {
  const existing = await db.findOne("period_locks", (l) => l.periode === periode);
  if (!existing) return false;
  return db.deleteById("period_locks", existing.id);
}
