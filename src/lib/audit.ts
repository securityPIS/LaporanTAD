import { db } from "./db";
import { newId } from "./id";
import { nowWIB } from "./wib";

/**
 * Pintu tunggal penulisan log audit (ARSITEKTUR §8 poin 3). Semua mutasi
 * (buat/ubah/hapus/verifikasi/kunci) memanggil ini. Append-only dari aplikasi.
 */
export async function writeAudit(params: {
  actorEmail: string;
  aksi: string; // mis. "buat", "ubah", "hapus", "approve", "kunci"
  entitas: string; // mis. "overtime", "users", "period_locks"
  entitasId: string;
  detail?: unknown;
}): Promise<void> {
  await db.insert("audit_log", {
    id: newId(),
    timestamp: nowWIB(),
    actor_email: params.actorEmail,
    aksi: params.aksi,
    entitas: params.entitas,
    entitas_id: params.entitasId,
    detail_json: params.detail ? JSON.stringify(params.detail) : "",
  });
}

export async function listAudit(filter?: {
  actor?: string;
  entitas?: string;
  from?: string;
  to?: string;
}) {
  let rows = await db.all("audit_log");
  if (filter?.actor) rows = rows.filter((r) => r.actor_email.includes(filter.actor!));
  if (filter?.entitas) rows = rows.filter((r) => r.entitas === filter.entitas);
  if (filter?.from) rows = rows.filter((r) => r.timestamp >= filter.from!);
  if (filter?.to) rows = rows.filter((r) => r.timestamp <= filter.to! + "T23:59:59+07:00");
  return rows.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}
