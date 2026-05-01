import { getProducts } from "@/actions/product.action";
import { getStones } from "@/actions/stone.action";
import { AboutBrand, CreateYourPiece, Hero, ViewPieces } from "@/components/sections";

export const dynamic = 'force-dynamic';

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
