import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: "EDA — Evalúa. Descubre. Alcanza.",
  description:
    "Audita tu presencia digital en segundos. Detecta qué está fallando, descubre oportunidades en tu mercado y alcanza más clientes — impulsado por IA.",
  keywords: ["auditoría digital", "SEO", "presencia digital", "PYME", "LATAM", "Core Web Vitals"],
  openGraph: {
    title: "EDA — Evalúa. Descubre. Alcanza.",
    description: "¿Tu negocio existe en internet o solo crees que sí?",
    siteName: "EDA",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${syne.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
