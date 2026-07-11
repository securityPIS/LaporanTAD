import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

/** Bungkus handler route: tangkap AppError/ZodError → respons { code, message } Indonesia. */
export function handle(
  fn: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export function errorResponse(e: unknown): NextResponse {
  if (e instanceof AppError) {
    return NextResponse.json({ code: e.code, message: e.message, detail: e.detail }, { status: e.status });
  }
  if (e instanceof ZodError) {
    const first = e.issues[0];
    return NextResponse.json(
      { code: "VALIDASI_GAGAL", message: first?.message ?? "Data tidak valid", detail: e.issues },
      { status: 422 },
    );
  }
  console.error("[API] kesalahan tak terduga:", e);
  return NextResponse.json(
    { code: "GAGAL", message: "Terjadi kesalahan pada server. Coba lagi." },
    { status: 500 },
  );
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
