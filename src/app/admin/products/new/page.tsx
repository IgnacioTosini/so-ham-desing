import type { Metadata } from "next";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { getCatalogItems } from "@/actions/catalog.action";
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
    const catalogItems = await getCatalogItems();

    return (
        <div className="adminProductsPage">
            <div className="adminProductsPageContainer">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">Nuevo producto</span>
                        <h1>Crear producto</h1>
                        <p>Agrega una pieza terminada y detalla los insumos que la componen.</p>
                    </div>
                    <SmoothRouteLink href="/admin/products" className="adminSecondaryAction">Cancelar</SmoothRouteLink>
                </div>
                <ProductForm
                    mode="create"
                    availableCatalogItems={catalogItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        categoryId: item.categoryId,
                        categoryName: item.category.name,
                        isActive: item.isActive,
                    }))}
                />
            </div>
        </div>
    );
}
