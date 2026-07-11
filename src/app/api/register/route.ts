import { ok, readJson, route } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getSessionEmail } from "@/lib/session";
import { registrationSchema } from "@/schemas";
import { createUser, findUserByEmail, nopekTaken, updateUser } from "@/repositories/users";
import { newId } from "@/lib/id";
import { nowWIB } from "@/lib/wib";
import { writeAudit } from "@/lib/audit";
import type { UserRow } from "@/lib/db/tables";

// POST /api/register — simpan registrasi (status pending). Pendaftar `rejected`
// yang mengisi ulang kembali ke `pending` (FR-REG-03).
export const POST = route(async (req) => {
  const email = await getSessionEmail();
  if (!email) throw new AppError("TIDAK_LOGIN", "Silakan masuk dengan Google terlebih dahulu", 401);

  const body = await readJson(req);
  const data = registrationSchema.parse(body);

  if (await nopekTaken(data.nopek)) {
    const existing = await findUserByEmail(email);
    if (!existing || existing.nopek !== data.nopek) {
      throw new AppError("NOPEK_DIPAKAI", "Nopek sudah dipakai akun lain.", 409);
    }
  }

  const existing = await findUserByEmail(email);
  const now = nowWIB();

  if (existing) {
    if (existing.status === "active" || existing.status === "pending") {
      throw new AppError("TIDAK_BERHAK", "Akun sudah terdaftar.", 409);
    }
    // rejected/inactive → ajukan ulang
    const saved = await updateUser(existing.id, {
      ...data,
      status: "pending",
      alasan_tolak: "",
      updated_at: now,
    });
    await writeAudit({ actorEmail: email, aksi: "registrasi-ulang", entitas: "users", entitasId: existing.id });
    return ok({ status: "pending", user_id: saved!.id });
  }

  const row: UserRow = {
    id: newId(),
    email,
    ...data,
    nama_shift: data.nama_shift ?? "",
    foto_url: "",
    ttd_file_id: "",
    role: "pekerja",
    status: "pending",
    alasan_tolak: "",
    approved_by: "",
    approved_at: "",
    created_at: now,
    updated_at: now,
  };
  const saved = await createUser(row);
  await writeAudit({ actorEmail: email, aksi: "registrasi", entitas: "users", entitasId: saved.id, detail: { nama: saved.nama_lengkap } });
  return ok({ status: "pending", user_id: saved.id }, 201);
});
