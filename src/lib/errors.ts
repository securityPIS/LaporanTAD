// Error berkode: respons { code, message } agar UI menampilkan pesan Indonesia
// yang tepat & log mudah dilacak (ARSITEKTUR §8 poin 4).

export type ErrorCode =
  | "TIDAK_LOGIN"
  | "TIDAK_BERHAK"
  | "TIDAK_DITEMUKAN"
  | "VALIDASI_GAGAL"
  | "PERIODE_TERKUNCI"
  | "SALDO_KURANG"
  | "NOPEK_DIPAKAI"
  | "BATAS_LEMBUR"
  | "WAJIB_LAMPIRAN"
  | "WAJIB_TTD"
  | "TANGGAL_DEPAN"
  | "LAYANAN_BELUM_SIAP"
  | "GAGAL";

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  detail?: unknown;
  constructor(code: ErrorCode, message: string, status = 400, detail?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

export const errNotFound = (msg = "Data tidak ditemukan") => new AppError("TIDAK_DITEMUKAN", msg, 404);
export const errForbidden = (msg = "Anda tidak berhak melakukan ini") => new AppError("TIDAK_BERHAK", msg, 403);
export const errUnauth = (msg = "Silakan masuk terlebih dahulu") => new AppError("TIDAK_LOGIN", msg, 401);
