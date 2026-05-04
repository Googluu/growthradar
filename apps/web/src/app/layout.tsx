import type { Metadata } from "next";
import { Syne, DM_Sans, Caveat, Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDA — Evalúa. Descubre. Alcanza.",
  description:
    "Audita tu presencia digital en segundos. Detecta qué está fallando, descubre oportunidades en tu mercado y alcanza más clientes — impulsado por IA.",
  keywords: ["auditoría digital", "SEO", "Core Web Vitals", "presencia digital", "PYME", "LATAM"],
  openGraph: {
    title: "EDA — Evalúa. Descubre. Alcanza.",
    description: "¿Tu negocio existe en internet o solo crees que sí?",
    siteName: "EDA",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" className={`${syne.variable} ${dmSans.variable} ${caveat.variable} ${inter.variable}`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
