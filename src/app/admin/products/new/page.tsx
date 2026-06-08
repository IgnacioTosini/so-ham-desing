import type { Metadata } from "next";
import Link from "next/link";
import { getStones } from "@/actions/stone.action";
import { requireAdminSession } from "@/lib/adminAuth";
import ProductForm from "@/components/productForm/ProductForm";
import "../_adminProductPage.scss";

export const metadata: Metadata = {
    title: "Nuevo producto",
    description: "Crear un nuevo producto en el panel de administración.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function NewProductPage() {
    await requireAdminSession();
    const stones = await getStones();

    return (
        <div className="adminProductsPage">
            <Link href="/admin/products" className="backLink">← Volver</Link>
            <div className="adminProductsPageContainer">
                <h1>Admin - Nuevo producto</h1>
                <ProductForm
                    mode="create"
                    availableStones={stones.map((s) => ({ id: s.id, name: s.name }))}
                />
            </div>
        </div>
    );
}
