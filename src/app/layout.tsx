import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Chrome } from "@/components/layout/Chrome";
import { Toast } from "@/components/shared/Toast";

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
  themeColor: "#2a6fdb",
};

// Set tema sebelum paint agar tidak ada kedip (no-flash).
const NO_FLASH = `(function(){try{var t=localStorage.getItem('ltad-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>
        <AppProvider>
          <Chrome>{children}</Chrome>
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
