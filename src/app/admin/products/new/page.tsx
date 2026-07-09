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
            <div className="adminProductsPageContainer">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">Nuevo producto</span>
                        <h1>Crear producto</h1>
                        <p>Agrega una pieza lista para mostrar en la tienda.</p>
                    </div>
                    <Link href="/admin/products" className="adminSecondaryAction">Cancelar</Link>
                </div>
                <ProductForm
                    mode="create"
                    availableStones={stones.map((s) => ({ id: s.id, name: s.name }))}
                />
            </div>
        </div>
    );
}
