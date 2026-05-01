import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/actions/product.action";
import { getStones } from "@/actions/stone.action";
import { requireAdminSession } from "@/lib/adminAuth";
import ProductForm from "@/components/productForm/ProductForm";
import "../../_adminProductPage.scss";

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    await requireAdminSession();
    const { id } = await params;
    const [product, stones] = await Promise.all([
        getProductById(id),
        getStones(),
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="adminProductsPage">
            <Link href="/admin/products" className="backLink">← Volver a productos</Link>
            <div className="adminProductsPageContainer">
                <h1>Admin - Editar producto</h1>
                <ProductForm
                    mode="edit"
                    initialData={{
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        imageUrl: product.imageUrl,
                        price: product.price,
                        type: product.type,
                        stones: product.stones.map((ps) => ({
                            id: ps.stone.id,
                            name: ps.stone.name,
                        })),
                    }}
                    availableStones={stones.map((s) => ({ id: s.id, name: s.name }))}
                />
            </div>
        </div>
    );
}
