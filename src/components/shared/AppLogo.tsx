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

      {/* Logo Pertamina: mark resmi tiga anak panah (merah, hijau, biru) */}
      <g filter="url(#alMarkShadow)">
        <g
          transform="translate(118.3 152.2) scale(3.5)"
          stroke="#ffffff"
          strokeOpacity="0.30"
          strokeWidth="0.7"
          strokeLinejoin="round"
        >
          <path
            fill="#E50021"
            d="M78.7,20H59.4c0,0-4.7,0.1-7.2-3.7C49.7,12.6,41.6,0,41.6,0h19.8c0,0,3.9,0.1,6.3,3.4C70.2,6.8,78.7,20,78.7,20"
          />
          <path
            fill="#B8C900"
            d="M78.7,25.2H59.4c0,0-4.7-0.1-7.2,3.7S41.6,45.2,41.6,45.2h19.8c0,0,3.9-0.1,6.3-3.4C70.2,38.5,78.7,25.2,78.7,25.2"
          />
          <path
            fill="#0061B0"
            d="M44.1,28.6c1.3-2.1,3.4-3.4,3.4-3.4H27.1c0,0-4.7-0.1-7.2,3.7S0,59.3,0,59.3h19.8c0,0,3.9-0.1,6.3-3.4C28,53.3,39.3,36,44.1,28.6"
          />
        </g>
      </g>
    </svg>
  );
}
