import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { getSiteUrl } from "@/utils/siteUrl";
import "./globals.css";

const metadataBaseUrl = getSiteUrl();
const ogImageUrl = "/soHamDesign.png?v=2";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: {
    default: "So Ham Design | Joyas artesanales con piedras naturales",
    template: "%s | So Ham Design",
  },
  description: "Diseño de joyas artesanales con piedras naturales. Crea tu pieza personalizada y descubre colecciones con intención.",
  applicationName: "So Ham Design",
  icons: {
    icon: [{ url: "/soHamDesign.png", type: "image/png" }],
    shortcut: "/soHamDesign.png",
    apple: "/soHamDesign.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: metadataBaseUrl,
    siteName: "So Ham Design",
    title: "So Ham Design | Joyas artesanales con piedras naturales",
    description: "Descubre piezas únicas y crea joyas personalizadas con piedras naturales.",
    images: [
      {
        url: ogImageUrl,
        width: 1215,
        height: 630,
        alt: "Logo de So Ham Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "So Ham Design | Joyas artesanales con piedras naturales",
    description: "Descubre piezas únicas y crea joyas personalizadas con piedras naturales.",
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body>{children}</body>
    </html>
  );
}
