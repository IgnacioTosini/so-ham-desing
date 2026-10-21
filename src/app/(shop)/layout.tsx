import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import ProjectToasts from "@/components/ui/toast/ProjectToasts";
import { Analytics } from "@vercel/analytics/next";
import { getSiteUrl } from "@/utils/siteUrl";

const metadataBaseUrl = getSiteUrl();
const ogImageUrl = "/soHamDesign.png?v=2";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: {
    default: "So Ham by Pato | Joyas artesanales con piedras naturales",
    template: "%s | So Ham by Pato",
  },
  description: "Diseño de joyas artesanales con piedras naturales. Crea tu pieza personalizada y descubre colecciones con intención.",
  applicationName: "So Ham by Pato",
  keywords: [
    "joyas artesanales",
    "piedras naturales",
    "pulseras",
    "collares",
    "joyería personalizada",
    "So Ham by Pato",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/soHamDesign.png", type: "image/png" }],
    shortcut: "/soHamDesign.png",
    apple: "/soHamDesign.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: metadataBaseUrl,
    siteName: "So Ham by Pato",
    title: "So Ham by Pato | Joyas artesanales con piedras naturales",
    description: "Descubre piezas únicas y crea joyas personalizadas con piedras naturales.",
    images: [
      {
        url: ogImageUrl,
        width: 1215,
        height: 630,
        alt: "Logo de So Ham by Pato",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "So Ham by Pato | Joyas artesanales con piedras naturales",
    description: "Descubre piezas únicas y crea joyas personalizadas con piedras naturales.",
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <ProjectToasts />
      <Analytics />
      <Footer />
    </>
  );
}
