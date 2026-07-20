import { Card } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";

// Panduan visual (SVG ber-label) untuk menyusun template dokumen di Google Docs.
// Warna memakai CSS variable tema → otomatis menyesuaikan mode terang/gelap.

function Ph({ children }: { children: string }) {
  return (
    <code className="rounded bg-accent-weak px-1 py-[1px] font-mono text-[11px] text-accent-ink">{children}</code>
  );
}

function Fig({ n, title, caption, children }: { n: number; title: string; caption: string; children: React.ReactNode }) {
  return (
    <figure className="mt-4">
      <figcaption className="mb-1 flex items-center gap-2">
        <span className="flex h-5 w-5 flex-none items-center justify-center rounded-md bg-accent text-[11px] font-extrabold text-white">{n}</span>
        <span className="text-[12.5px] font-extrabold text-text">{title}</span>
      </figcaption>
      <p className="mb-2 text-[11.5px] text-muted">{caption}</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface p-3">{children}</div>
    </figure>
  );
}

const S = "fill-[var(--surface)] stroke-[var(--border)]";
const S2 = "fill-[var(--surface-2)]";
const BD = "fill-none stroke-[var(--border)]";
const T = "fill-[var(--text)]";
const M = "fill-[var(--muted)]";
const A = "fill-[var(--accent)]";
const AW = "fill-[var(--accent-weak)]";
const AI = "fill-[var(--accent-ink)]";

export function TemplateGuide() {
  return (
    <Card className="mt-4 p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-accent-weak text-accent-ink">
          <Icon name="docCheck" size={19} />
        </span>
        <div>
          <div className="text-[14px] font-extrabold text-text">Panduan Membuat Template</div>
          <div className="text-[11.5px] text-muted">Cara menyusun Google Docs + placeholder menjadi PDF</div>
        </div>
      </div>

      <div className="text-[12.5px] leading-relaxed text-muted">
          <p>
            Format dokumen diatur lewat <b className="text-text">Google Docs</b>, bukan kode. Anda mengatur kop surat &amp; tata letak
            langsung di Google Docs; sistem hanya mengisi data ke <b className="text-text">placeholder</b> <Ph>{"{{...}}"}</Ph>.
          </p>

          {/* Gambar 1 — Alur */}
          <Fig n={1} title="Alur pembuatan" caption="Empat langkah dari Google Docs hingga template terdaftar.">
            <svg viewBox="0 0 728 132" className="h-auto w-full min-w-[560px]" role="img" aria-label="Alur: tulis di Google Docs, sisipkan placeholder, salin ID, daftarkan">
              {[
                { x: 8, n: "1", l1: "Tulis di", l2: "Google Docs", mono: false, cx: 36, lx: 108 },
                { x: 192, n: "2", l1: "Sisipkan", l2: "{{placeholder}}", mono: true, cx: 220, lx: 292 },
                { x: 376, n: "3", l1: "Salin", l2: "Google Docs ID", mono: false, cx: 404, lx: 476 },
                { x: 560, n: "4", l1: "Daftarkan", l2: "di sini", mono: false, cx: 588, lx: 660 },
              ].map((b, i) => (
                <g key={b.n}>
                  <rect className={S} x={b.x} y={26} width={160} height={80} rx={12} strokeWidth={1.5} />
                  <circle className={A} cx={b.cx} cy={66} r={13} />
                  <text className="fill-white" x={b.cx} y={70} textAnchor="middle" fontSize={13} fontWeight={800}>{b.n}</text>
                  <text textAnchor="middle" fontSize={11.5} fontWeight={700}>
                    <tspan className={T} x={b.lx} y={61}>{b.l1}</tspan>
                    <tspan className={b.mono ? `${A} font-mono` : T} x={b.lx} y={b.mono ? 78 : 77} fontSize={b.mono ? 11 : 11.5}>{b.l2}</tspan>
                  </text>
                  {i < 3 && <polygon className={M} points={`${b.x + 166},60 ${b.x + 178},66 ${b.x + 166},72`} />}
                </g>
              ))}
            </svg>
          </Fig>
          <p className="mt-2 text-[11.5px]">Setelah terdaftar, dokumen dibuat dari menu <b className="text-text">Dokumen → Buat Dokumen Resmi</b>.</p>

          {/* Gambar 2 — Anatomi */}
          <Fig n={2} title="Anatomi template" caption="Letak placeholder pada dokumen (contoh: SPKL).">
            <svg viewBox="0 0 580 430" className="h-auto w-full min-w-[520px]" role="img" aria-label="Anatomi template: identitas, tabel baris berulang, dan tanda tangan">
              <rect className={S} x={20} y={16} width={300} height={398} rx={12} strokeWidth={1.5} />
              <text className={T} x={170} y={44} textAnchor="middle" fontSize={9.5} fontWeight={800} letterSpacing=".4">SURAT PERINTAH KERJA LEMBUR</text>
              <line className={BD} x1={40} y1={54} x2={300} y2={54} strokeWidth={1.2} />
              {[
                { y: 80, label: "Nama", ph: "{{nama}}" },
                { y: 99, label: "Nopek", ph: "{{nopek}}" },
                { y: 118, label: "Divisi", ph: "{{divisi}}" },
              ].map((r) => (
                <text key={r.label} fontSize={11}>
                  <tspan className={M} x={44} y={r.y}>{r.label}</tspan>
                  <tspan className={M} x={96} y={r.y}>:</tspan>
                  <tspan className={`${A} font-mono`} x={106} y={r.y}>{r.ph}</tspan>
                </text>
              ))}
              {/* tabel */}
              <rect className={S2} x={44} y={150} width={264} height={24} />
              <rect className={AW} x={44} y={174} width={264} height={26} />
              <rect className={BD} x={44} y={150} width={264} height={50} strokeWidth={1.2} />
              <line className={BD} x1={78} y1={150} x2={78} y2={200} strokeWidth={1.2} />
              <line className={BD} x1={170} y1={150} x2={170} y2={200} strokeWidth={1.2} />
              <line className={BD} x1={244} y1={150} x2={244} y2={200} strokeWidth={1.2} />
              <line className={BD} x1={44} y1={174} x2={308} y2={174} strokeWidth={1.2} />
              <g className={M} fontSize={8.5} fontWeight={700} textAnchor="middle">
                <text x={61} y={166}>No</text><text x={124} y={166}>Tanggal</text><text x={207} y={166}>Jam</text><text x={276} y={166}>Total</text>
              </g>
              <g className={`${A} font-mono`} fontSize={7.5} textAnchor="middle">
                <text x={61} y={191}>{"{{@no}}"}</text><text x={124} y={191}>{"{{@tanggal}}"}</text><text x={207} y={191}>{"{{@jam}}"}</text><text x={276} y={191}>{"{{@total_jam}}"}</text>
              </g>
              {/* ttd */}
              <text className={M} x={200} y={248} fontSize={10}>Hormat saya,</text>
              <rect className={`${AW} stroke-[var(--accent)]`} x={200} y={256} width={104} height={46} rx={6} strokeDasharray="4 3" />
              <text className={`${A} font-mono`} x={252} y={284} textAnchor="middle" fontSize={12}>{"{{ttd}}"}</text>
              <text className={`${A} font-mono`} x={200} y={320} fontSize={9}>{"{{nama}}"}</text>
              {/* callouts */}
              {[
                { tx: 320, ty: 90, ry: 74, rh: 32, l1: "Identitas & unit kerja", l2: "pekerja", t1: 88, t2: 100 },
                { tx: 308, ty: 187, ry: 167, rh: 42, l1: "Baris ini digandakan", l2: "otomatis tiap lembur (SPKL)", t1: 184, t2: 197 },
                { tx: 304, ty: 279, ry: 263, rh: 32, l1: "Tanda tangan disisipkan", l2: "di posisi {{ttd}}", t1: 277, t2: 289 },
              ].map((c, i) => (
                <g key={i}>
                  <circle className={A} cx={c.tx} cy={c.ty} r={2.6} />
                  <line className={BD} x1={c.tx} y1={c.ty} x2={356} y2={c.ty} strokeWidth={1.2} />
                  <rect className={AW} x={356} y={c.ry} width={204} height={c.rh} rx={7} />
                  <text className={AI} fontSize={10} fontWeight={700}>
                    <tspan x={366} y={c.t1}>{c.l1}</tspan>
                    <tspan x={366} y={c.t2}>{c.l2}</tspan>
                  </text>
                </g>
              ))}
            </svg>
          </Fig>

          {/* Gambar 3 — Google Docs ID */}
          <Fig n={3} title="Menyalin Google Docs ID" caption="ID ada di URL dokumen, di antara /d/ dan /edit.">
            <svg viewBox="0 0 700 130" className="h-auto w-full min-w-[560px]" role="img" aria-label="URL Google Docs dengan bagian ID disorot">
              <rect className={S} x={10} y={28} width={680} height={46} rx={23} strokeWidth={1.5} />
              <circle cx={38} cy={51} r={8} className="fill-none stroke-[var(--faint)]" strokeWidth={1.5} />
              <rect className={AW} x={348} y={40} width={144} height={22} rx={4} />
              <text y={56} fontSize={13} className="font-mono"><tspan className={M} x={58}>https://docs.google.com/document/d/</tspan></text>
              <text x={353} y={56} fontSize={13} className={`${AI} font-mono`} fontWeight={700}>1A2b3C4d5E6f7G8h</text>
              <text x={498} y={56} fontSize={13} className={`${M} font-mono`}>/edit</text>
              <polygon className={A} points="414,70 426,70 420,62" />
              <line x1={420} y1={98} x2={420} y2={70} className="stroke-[var(--accent)]" strokeWidth={1.6} />
              <text className={A} x={420} y={114} textAnchor="middle" fontSize={11} fontWeight={700}>Google Docs ID — salin bagian yang disorot</text>
            </svg>
          </Fig>

          {/* Gambar 4 — Baris berulang */}
          <Fig n={4} title="Baris berulang (khusus SPKL)" caption="Satu baris {{@...}} di template menjadi banyak baris di PDF.">
            <svg viewBox="0 0 700 175" className="h-auto w-full min-w-[560px]" role="img" aria-label="Satu baris template menjadi banyak baris hasil">
              {/* kiri */}
              <text className={T} x={16} y={20} fontSize={11} fontWeight={800}>Di template (1 baris)</text>
              <rect className={S2} x={16} y={30} width={300} height={24} />
              <rect className={AW} x={16} y={54} width={300} height={28} />
              <rect className={BD} x={16} y={30} width={300} height={52} strokeWidth={1.2} />
              <line className={BD} x1={56} y1={30} x2={56} y2={82} strokeWidth={1.2} />
              <line className={BD} x1={152} y1={30} x2={152} y2={82} strokeWidth={1.2} />
              <line className={BD} x1={240} y1={30} x2={240} y2={82} strokeWidth={1.2} />
              <line className={BD} x1={16} y1={54} x2={316} y2={54} strokeWidth={1.2} />
              <g className={M} fontSize={8.5} fontWeight={700} textAnchor="middle">
                <text x={36} y={46}>No</text><text x={104} y={46}>Tanggal</text><text x={196} y={46}>Jam</text><text x={278} y={46}>Total</text>
              </g>
              <g className={`${A} font-mono`} fontSize={8} textAnchor="middle">
                <text x={36} y={72}>{"{{@no}}"}</text><text x={104} y={72}>{"{{@tanggal}}"}</text><text x={196} y={72}>{"{{@jam}}"}</text><text x={278} y={72}>{"{{@total_jam}}"}</text>
              </g>
              <text className={M} x={16} y={104} fontSize={10}>Cukup 1 baris ber-awalan @</text>
              {/* panah */}
              <text className={A} x={356} y={52} textAnchor="middle" fontSize={9.5} fontWeight={700}>generate</text>
              <line x1={330} y1={64} x2={380} y2={64} className="stroke-[var(--accent)]" strokeWidth={2} />
              <polygon className={A} points="380,58 392,64 380,70" />
              <text className={M} x={358} y={80} textAnchor="middle" fontSize={9}>jadi PDF</text>
              {/* kanan */}
              <text className={T} x={400} y={20} fontSize={11} fontWeight={800}>Hasil di PDF</text>
              <rect className={S2} x={400} y={30} width={288} height={22} />
              <rect className={BD} x={400} y={30} width={288} height={94} strokeWidth={1.2} />
              <line className={BD} x1={434} y1={30} x2={434} y2={124} strokeWidth={1.2} />
              <line className={BD} x1={530} y1={30} x2={530} y2={124} strokeWidth={1.2} />
              <line className={BD} x1={628} y1={30} x2={628} y2={124} strokeWidth={1.2} />
              <line className={BD} x1={400} y1={52} x2={688} y2={52} strokeWidth={1.2} />
              <line className={BD} x1={400} y1={76} x2={688} y2={76} strokeWidth={1.2} />
              <line className={BD} x1={400} y1={100} x2={688} y2={100} strokeWidth={1.2} />
              <g className={M} fontSize={8.5} fontWeight={700} textAnchor="middle">
                <text x={417} y={45}>No</text><text x={482} y={45}>Tanggal</text><text x={579} y={45}>Jam</text><text x={658} y={45}>Total</text>
              </g>
              <g className={T} fontSize={8.5} textAnchor="middle">
                <text x={417} y={68}>1</text><text x={482} y={68}>2 Jul 2026</text><text x={579} y={68}>18:00–21:00</text><text x={658} y={68}>3:00</text>
                <text x={417} y={92}>2</text><text x={482} y={92}>5 Jul 2026</text><text x={579} y={92}>22:00–06:00</text><text x={658} y={92}>8:00</text>
                <text x={417} y={116}>3</text><text x={482} y={116}>8 Jul 2026</text><text x={579} y={116}>19:00–21:30</text><text x={658} y={116}>2:30</text>
              </g>
              <text className={M} x={400} y={146} fontSize={10}>Tergandakan otomatis per catatan lembur</text>
            </svg>
          </Fig>

          {/* Referensi placeholder */}
          <div className="mt-5 rounded-xl border border-border bg-surface-2 p-3">
            <p className="font-bold text-text">Daftar placeholder per jenis</p>
            <p className="mt-1"><b>Umum (semua):</b> <Ph>{"{{nama}}"}</Ph> <Ph>{"{{nopek}}"}</Ph> <Ph>{"{{divisi}}"}</Ph> <Ph>{"{{bagian}}"}</Ph> <Ph>{"{{lokasi_kerja}}"}</Ph> <Ph>{"{{tanggal_cetak}}"}</Ph> <Ph>{"{{ttd}}"}</Ph></p>
            <p className="mt-1"><b>Surat Cuti:</b> <Ph>{"{{jenis_cuti}}"}</Ph> <Ph>{"{{tanggal_mulai}}"}</Ph> <Ph>{"{{tanggal_selesai}}"}</Ph> <Ph>{"{{durasi}}"}</Ph> <Ph>{"{{jumlah_hari}}"}</Ph> <Ph>{"{{keterangan}}"}</Ph></p>
            <p className="mt-1"><b>SPD:</b> <Ph>{"{{tujuan}}"}</Ph> <Ph>{"{{tanggal_mulai}}"}</Ph> <Ph>{"{{tanggal_selesai}}"}</Ph> <Ph>{"{{durasi}}"}</Ph> <Ph>{"{{keperluan}}"}</Ph> <Ph>{"{{transportasi}}"}</Ph> <Ph>{"{{keterangan}}"}</Ph></p>
            <p className="mt-1"><b>Deklarasi Dinas (header):</b> <Ph>{"{{keperluan}}"}</Ph> <Ph>{"{{dari}}"}</Ph> <Ph>{"{{tujuan}}"}</Ph> <Ph>{"{{realisasi_mulai}}"}</Ph> <Ph>{"{{realisasi_selesai}}"}</Ph> <Ph>{"{{lama_hari}}"}</Ph> <Ph>{"{{catatan}}"}</Ph> <Ph>{"{{total_biaya}}"}</Ph> — lalu tabel Rincian <Ph>{"{{@no}}"}</Ph> <Ph>{"{{@komponen}}"}</Ph> <Ph>{"{{@vol}}"}</Ph> <Ph>{"{{@nilai}}"}</Ph> <Ph>{"{{@mata_uang}}"}</Ph> <Ph>{"{{@jumlah}}"}</Ph>.</p>
            <p className="mt-1"><b>SPKL (header):</b> <Ph>{"{{periode}}"}</Ph> <Ph>{"{{total_catatan}}"}</Ph> <Ph>{"{{total_jam}}"}</Ph> — lalu tabel baris <Ph>{"{{@no}}"}</Ph> <Ph>{"{{@tanggal}}"}</Ph> <Ph>{"{{@jenis}}"}</Ph> <Ph>{"{{@jam}}"}</Ph> <Ph>{"{{@total_jam}}"}</Ph> <Ph>{"{{@keterangan}}"}</Ph>.</p>
          </div>

          <p className="mt-3 rounded-xl border border-dinas bg-dinas-weak px-3 py-2 text-[11.5px] text-dinas">
            <b>Template Deklarasi Dinas otomatis:</b> jalankan fungsi <code className="font-mono">createDeklarasiTemplate</code> di
            editor Apps Script — sistem membuat Google Docs Deklarasi (format Pengeluaran Dinas sesuai ketentuan) beserta seluruh
            placeholder di atas, lalu tinggal daftarkan ID-nya di sini.
          </p>

          <p className="mt-4 rounded-xl bg-accent-weak px-3 py-2 text-[11.5px] text-accent-ink">
            <b>Catatan akses:</b> dokumen Google Docs harus dapat diakses akun yang menjalankan docgen (bagikan sebagai <b>Editor</b> bila dibuat dari akun berbeda), agar sistem dapat menyalinnya saat generate.
          </p>
      </div>
    </Card>
  );
}
