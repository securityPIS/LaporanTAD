import { db } from "./db";
import { cached, invalidate } from "./cache";
import { AppError } from "./errors";
import { newId } from "./id";
import { nowWIB, periodeOf } from "./wib";

/**
 * Pintu tunggal pengecekan kunci periode (ARSITEKTUR §8 poin 3). Bulan yang
 * rekapnya sudah diserahkan dikunci admin → tambah/ubah/hapus catatan
 * bertanggal pada bulan itu ditolak (termasuk oleh admin).
 */
export async function isPeriodeTerkunci(periode: string): Promise<boolean> {
  const locks = await cached("period_locks", 30_000, () => db.all("period_locks"));
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
  const saved = await db.insert("period_locks", row);
  invalidate("period_locks");
  return saved;
}

export async function unlockPeriode(periode: string) {
  const existing = await db.findOne("period_locks", (l) => l.periode === periode);
  if (!existing) return false;
  const ok = await db.deleteById("period_locks", existing.id);
  invalidate("period_locks");
  return ok;
}
