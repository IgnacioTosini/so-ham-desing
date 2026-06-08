import type { Metadata } from "next";
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

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);
    const productName = product?.name?.trim();

    return {
        title: productName ? `Editar ${productName}` : "Editar producto",
        description: productName
            ? `Editar el producto ${productName} desde el panel de administración.`
            : "Editar un producto existente desde el panel de administración.",
        robots: {
            index: false,
            follow: false,
        },
    };
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
            <Link href="/admin/products" className="backLink">← Volver</Link>
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
