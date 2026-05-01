import { getProducts } from "@/actions/product.action";
import { requireAdminSession } from "@/lib/adminAuth";
import ProductCard from "../../../components/productCard/ProductCard";
import Link from "next/link";
import "./_adminProductPage.scss";

export default async function AdminProductsPage() {
    await requireAdminSession();
    const products = await getProducts();

    return (
        <div className="adminProductsPage">
            <Link href="/admin" className="backLink">← Volver al panel de administración</Link>
            <div className="adminProductsPageContainer">
                <h1>Admin - Gestión de productos</h1>

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
