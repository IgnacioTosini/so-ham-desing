import type { Metadata } from "next";
import { getProducts } from "@/actions/product.action";
import { requireAdminSession } from "@/lib/adminAuth";
import ProductCard from "../../../components/productCard/ProductCard";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import "./_adminProductPage.scss";

export const metadata: Metadata = {
    title: "Admin productos",
    description: "Listado y gestión de productos en el panel de administración.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminProductsPage() {
    await requireAdminSession();
    const products = await getProducts();

    return (
        <div className="adminProductsPage">
            <div className="adminProductsPageContainer">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">{products.length} productos cargados</span>
                        <h1>Productos</h1>
                        <p>Gestiona pulseras y collares listos para consultar por WhatsApp.</p>
                    </div>
                    <SmoothRouteLink href="/admin/products/new" className="adminPrimaryAction">Nuevo producto</SmoothRouteLink>
                </div>

                <div className="productListContainer">
                    {products.length === 0 ? (
                        <p>No hay productos disponibles. Agrega un nuevo producto para comenzar.</p>
                    ) : (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
