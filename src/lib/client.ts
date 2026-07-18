"use client";

// Helper fetch sisi klien. Melempar Error berpesan Indonesia dari { code, message }.
import { useCallback, useEffect, useRef, useState } from "react";

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function parse(res: Response) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new ApiError(data.code ?? "GAGAL", data.message ?? "Terjadi kesalahan.");
  }
  return data;
}

export function apiGet<T = unknown>(url: string): Promise<T> {
  return fetch(url, { cache: "no-store" }).then(parse) as Promise<T>;
}

export function apiSend<T = unknown>(
  url: string,
  method: "POST" | "PATCH" | "DELETE" | "PUT",
  body?: unknown,
): Promise<T> {
  return fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then(parse) as Promise<T>;
}

export function apiUpload<T = unknown>(url: string, form: FormData): Promise<T> {
  return fetch(url, { method: "POST", body: form }).then(parse) as Promise<T>;
}

// Cache hasil GET per-URL selama sesi tab (stale-while-revalidate):
// kembali ke menu yang baru dibuka menampilkan data terakhir tanpa spinner,
// sambil revalidasi di belakang layar.
const swrCache = new Map<string, unknown>();

/** Hook pengambilan data ringan dengan status muat/galat + reload. */
export function useData<T>(url: string | null): {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  reload: () => void;
} {
  const [data, setData] = useState<T | undefined>(() =>
    url ? (swrCache.get(url) as T | undefined) : undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url) && !swrCache.has(url ?? ""));
  const [tick, setTick] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    const stale = swrCache.get(url) as T | undefined;
    setData(stale);
    setLoading(stale === undefined);
    setError(null);
    apiGet<T>(url)
      .then((d) => {
        swrCache.set(url, d);
        if (mounted.current) setData(d);
      })
      .catch((e) => mounted.current && setError(e.message))
      .finally(() => mounted.current && setLoading(false));
  }, [url, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}
