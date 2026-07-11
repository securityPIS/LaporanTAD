import { auth } from "./auth";
import { AppError, errForbidden, errUnauth } from "./errors";
import { findUserByEmail } from "@/repositories/users";
import type { UserRow } from "./db/tables";

/** Email login dari sesi Auth.js (atau null). */
export async function getSessionEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email?.toLowerCase() ?? null;
}

/** Baris `users` untuk sesi saat ini — null bila belum login / belum terdaftar. */
export async function getCurrentUser(): Promise<UserRow | null> {
  const email = await getSessionEmail();
  if (!email) return null;
  return findUserByEmail(email);
}

/** Wajib pengguna aktif; melempar AppError bila tidak. */
export async function requireActive(): Promise<UserRow> {
  const email = await getSessionEmail();
  if (!email) throw errUnauth();
  const u = await findUserByEmail(email);
  if (!u) throw new AppError("TIDAK_BERHAK", "Akun belum terdaftar", 403);
  if (u.status !== "active") {
    throw new AppError("TIDAK_BERHAK", `Akun berstatus ${u.status}`, 403);
  }
  return u;
}

/** Wajib admin aktif. */
export async function requireAdmin(): Promise<UserRow> {
  const u = await requireActive();
  if (u.role !== "admin") throw errForbidden("Khusus admin");
  return u;
}

/** Wajib pemilik data atau admin. */
export async function requireOwnerOrAdmin(ownerUserId: string): Promise<UserRow> {
  const u = await requireActive();
  if (u.role !== "admin" && u.id !== ownerUserId) {
    throw errForbidden("Hanya pemilik catatan atau admin");
  }
  return u;
}

export type GateStatus = "unauthenticated" | "unregistered" | "pending" | "rejected" | "inactive" | "active";

/** Path tujuan berdasar status akun (dipakai dispatch onboarding, alur 4.1). */
export function gatePath(user: UserRow | null, loggedIn: boolean): string {
  if (!loggedIn) return "/login";
  if (!user) return "/register";
  switch (user.status) {
    case "pending":
      return "/menunggu";
    case "rejected":
      return "/ditolak";
    case "inactive":
      return "/nonaktif";
    case "active":
      return user.role === "admin" ? "/admin" : "/beranda";
    default:
      return "/login";
  }
}
