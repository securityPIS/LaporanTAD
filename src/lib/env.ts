// Akses environment variable terpusat + deteksi mode backend.
// Produksi memakai Google Sheets/Drive/GAS; bila kredensial tak ada, aplikasi
// jatuh ke driver in-memory (dev/demo) agar tetap dapat dijalankan & diuji.

function opt(key: string): string | undefined {
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

export const env = {
  authSecret: opt("AUTH_SECRET"),
  googleId: opt("AUTH_GOOGLE_ID"),
  googleSecret: opt("AUTH_GOOGLE_SECRET"),
  saEmail: opt("GOOGLE_SA_EMAIL"),
  saPrivateKey: opt("GOOGLE_SA_PRIVATE_KEY"),
  sheetsDatabaseId: opt("SHEETS_DATABASE_ID"),
  driveRootFolderId: opt("DRIVE_ROOT_FOLDER_ID"),
  gasWebappUrl: opt("GAS_WEBAPP_URL"),
  gasSharedSecret: opt("GAS_SHARED_SECRET"),
  // Daftar email admin awal (dipisah koma) untuk seeding/penunjukan admin.
  adminEmails: (opt("ADMIN_EMAILS") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
} as const;

/** true bila kredensial Google Sheets tersedia (mode produksi). */
export function isSheetsConfigured(): boolean {
  return Boolean(env.sheetsDatabaseId && env.saEmail && env.saPrivateKey);
}

/** true bila Google Drive tersedia. */
export function isDriveConfigured(): boolean {
  return Boolean(env.driveRootFolderId && env.saEmail && env.saPrivateKey);
}

/** true bila Google OAuth (login sungguhan) dikonfigurasi. */
export function isGoogleAuthConfigured(): boolean {
  return Boolean(env.googleId && env.googleSecret);
}

/** true bila GAS docgen tersedia. */
export function isGasConfigured(): boolean {
  return Boolean(env.gasWebappUrl && env.gasSharedSecret);
}
