import type { Metadata } from "next";
import { getProducts } from "@/actions/product.action";
import { getStones } from "@/actions/stone.action";
import { AboutBrand, CreateYourPiece, Hero, ViewPieces } from "@/components/sections";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "So Ham Design | Joyas artesanales con piedras naturales",
  description: "Descubre piezas artesanales y crea tu joya personalizada con piedras naturales en So Ham Design.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const products = await getProducts();
  const stones = await getStones();
  return (
    <main className='main' id='top'>
        <Hero />
        <ViewPieces products={products} />
        <CreateYourPiece stones={stones} />
        <AboutBrand />
    </main>
  );
}
