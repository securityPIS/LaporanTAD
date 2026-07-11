import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

/** Bungkus handler route: tangkap AppError/ZodError → respons { code, message } Indonesia. */
export function route<C = unknown>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

/** Baca body JSON dengan aman (objek kosong bila gagal parse). */
export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

export function qp(req: Request, key: string): string | undefined {
  const v = new URL(req.url).searchParams.get(key);
  return v && v.length > 0 ? v : undefined;
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
