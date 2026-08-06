import type { Metadata } from "next";
import { Zilla_Slab, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const zillaSlab = Zilla_Slab({
  variable: "--font-titre",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-texte",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Cantine CFA — Registre d'appel",
  description: "Gestion des présences et absences des apprentis à la cantine",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${zillaSlab.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
