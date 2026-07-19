// Logo aplikasi — markup identik dengan favicon (src/app/icon.svg) agar
// ikon di pojok kiri-atas sama persis dengan favicon.
export function AppLogo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LaporanTAD"
    >
      <defs>
        <linearGradient id="alClayBg" x1="70" y1="52" x2="452" y2="470" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6f92ff" />
          <stop offset="0.52" stopColor="#4a72f0" />
          <stop offset="1" stopColor="#2c50c4" />
        </linearGradient>
        <linearGradient id="alMarkGrad" x1="150" y1="180" x2="392" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe6ff" />
        </linearGradient>
        <radialGradient
          id="alTopGlow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(150 118) rotate(52) scale(300 300)"
        >
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="alBotShade"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(388 402) rotate(-130) scale(280 280)"
        >
          <stop offset="0" stopColor="#1a2f7a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#1a2f7a" stopOpacity="0" />
        </radialGradient>
        <filter id="alMarkShadow" x="100" y="100" width="360" height="360" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="9" stdDeviation="12" floodColor="#0c1a52" floodOpacity="0.40" />
        </filter>
      </defs>

      <rect x="24" y="24" width="464" height="464" rx="132" fill="url(#alClayBg)" />
      <rect x="24" y="24" width="464" height="464" rx="132" fill="url(#alTopGlow)" />
      <rect x="24" y="24" width="464" height="464" rx="132" fill="url(#alBotShade)" />
      <rect
        x="30"
        y="30"
        width="452"
        height="452"
        rx="126"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.20"
        strokeWidth="3"
      />

      {/* Logo Pertamina: tiga anak panah (biru, hijau, merah) menanjak ke kanan */}
      <g filter="url(#alMarkShadow)" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="4" strokeLinejoin="round">
        <path d="M302 330 L152 284 L196 330 L152 376 Z" fill="#00A0E3" />
        <path d="M342 256 L192 210 L236 256 L192 302 Z" fill="#1AA64C" />
        <path d="M382 182 L232 136 L276 182 L232 228 Z" fill="#ED1C24" />
      </g>
    </svg>
  );
}
