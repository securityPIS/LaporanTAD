import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Toast } from "@/components/shared/Toast";
import { getCurrentUser } from "@/lib/session";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LaporanTAD — Administrasi Pekerja",
  description:
    "Aplikasi administrasi pekerja Tenaga Alih Daya: lembur, cuti, dinas, kalender, dan dokumen.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Warna status bar (jam/sinyal/baterai) mengikuti latar aplikasi (--bg):
// terang #e8ecf7 · gelap #12151f. Diset sedini mungkin agar tidak berkedip.
const NO_FLASH = `(function(){try{var t=localStorage.getItem('ltad-theme')||'light';document.documentElement.setAttribute('data-theme',t);var c=t==='dark'?'#12151f':'#e8ecf7';var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m);}m.setAttribute('content',c);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  return (
    <html lang="id" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>
        <AppProvider initialMe={me}>
          {children}
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
