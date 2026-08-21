import type { Metadata } from "next";
import { getProducts } from "@/actions/product.action";
import { getPublicCatalog } from "@/actions/catalog.action";
import { AboutBrand, Hero, MaterialsCatalog, ViewPieces } from "@/components/sections";
import { Simulator } from "@/components/sections/simulator/Simulator";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "So Ham Design | Joyas artesanales con piedras naturales",
  description: "Descubre piezas artesanales y crea tu joya personalizada con piedras naturales en So Ham Design.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getPublicCatalog(),
  ]);
  return (
    <main className='main' id='top'>
        <Hero />
        <ViewPieces products={products} />
        <MaterialsCatalog categories={categories} />
        <Simulator categories={categories} />
        <AboutBrand />
    </main>
  );
}
