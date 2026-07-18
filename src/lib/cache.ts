// Cache in-memory sederhana ber-TTL untuk master data (ARSITEKTUR §10):
// mengurangi baca berulang ke Sheets. Aman untuk skala < 100 pengguna.

interface Entry<T> {
  value: T | Promise<T>;
  expires: number;
}

const g = globalThis as unknown as { __ltadCache?: Map<string, Entry<unknown>> };
if (!g.__ltadCache) g.__ltadCache = new Map();
const store = g.__ltadCache;

/**
 * Ambil dari cache atau isi via loader; TTL default 60 detik.
 * Promise loader disimpan langsung agar pemanggil paralel pada key yang sama
 * berbagi satu pemuatan (dedupe in-flight), bukan masing-masing memanggil API.
 */
export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = loader();
  store.set(key, { value, expires: Date.now() + ttlMs });
  try {
    return await value;
  } catch (e) {
    if (store.get(key)?.value === value) store.delete(key); // gagal → jangan cache error
    throw e;
  }
}

/** Hapus entri cache berdasarkan prefix tag (mis. "users"). */
export function invalidate(tag: string): void {
  for (const key of store.keys()) {
    if (key === tag || key.startsWith(tag + ":")) store.delete(key);
  }
}
