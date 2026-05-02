import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/next";
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
});

const metadataBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://so-ham-desing.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: {
    default: "So Ham Design | Joyas artesanales con piedras naturales",
    template: "%s | So Ham Design",
  },
  description: "Diseño de joyas artesanales con piedras naturales. Crea tu pieza personalizada y descubre colecciones con intención.",
  applicationName: "So Ham Design",
  keywords: [
    "joyas artesanales",
    "piedras naturales",
    "pulseras",
    "collares",
    "joyería personalizada",
    "So Ham Design",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/soHamDesign.png", type: "image/png" },
      { url: "/soHamDesign.png", type: "image/png" },
    ],
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
        url: `${metadataBaseUrl}/soHamDesign.png`,
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
    images: [`${metadataBaseUrl}/soHamDesign.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body>
        <Navbar />
        {children}
        <ToastContainer position="top-right" autoClose={2500} />
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
