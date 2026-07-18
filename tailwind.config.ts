import type { Config } from "tailwindcss";

/**
 * Warna dipetakan ke variabel CSS yang didefinisikan di globals.css.
 * Nilai aktual berganti otomatis antara tema terang (:root) & gelap
 * ([data-theme="dark"]), jadi kelas seperti `bg-surface` / `text-muted`
 * ikut bertema tanpa perlu varian `dark:`.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        stage: "var(--stage)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        "accent-weak": "var(--accent-weak)",
        libur: "var(--libur)",
        "libur-weak": "var(--libur-weak)",
        cuti: "var(--cuti)",
        "cuti-weak": "var(--cuti-weak)",
        dinas: "var(--dinas)",
        "dinas-weak": "var(--dinas-weak)",
        lembur: "var(--lembur)",
        "lembur-weak": "var(--lembur-weak)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
        inset: "var(--shadow-inset)",
      },
      // Radius lebih membulat → kesan "clay" yang empuk.
      borderRadius: {
        lg: "0.85rem",
        xl: "1.1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      screens: {
        // ambang responsif desain: sempit < 860px, lebar >= 860px
        wide: "860px",
      },
      keyframes: {
        ltFade: { from: { opacity: "0" }, to: { opacity: "1" } },
        ltUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ltSheet: {
          from: { opacity: "0", transform: "translateY(24px) scale(.99)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        ltSpin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        ltFade: "ltFade .3s ease both",
        ltUp: "ltUp .3s ease both",
        ltSheet: "ltSheet .28s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
