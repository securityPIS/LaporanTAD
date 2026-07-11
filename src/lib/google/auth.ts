import { google } from "googleapis";
import { env } from "@/lib/env";

/**
 * Klien Google terautentikasi via service account (JWT). Scope minimal:
 * spreadsheets + drive. Key hanya dibaca dari environment variable Vercel.
 */
export function googleAuth() {
  const key = (env.saPrivateKey ?? "").replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email: env.saEmail,
    key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

export function sheetsClient() {
  return google.sheets({ version: "v4", auth: googleAuth() });
}

export function driveClient() {
  return google.drive({ version: "v3", auth: googleAuth() });
}
