import { ulid } from "ulid";

/** ID unik terurut waktu (ULID) untuk seluruh baris tabel. */
export function newId(): string {
  return ulid();
}
