import type { Metadata } from "next";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { notFound } from "next/navigation";
import { getProductById } from "@/actions/product.action";
import { getCatalogItems } from "@/actions/catalog.action";
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
    const [product, catalogItems] = await Promise.all([
        getProductById(id),
        getCatalogItems(),
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="adminProductsPage">
            <div className="adminProductsPageContainer">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">Editar producto</span>
                        <h1>{product.name}</h1>
                        <p>Actualiza precio, tipo, composición e imagen principal.</p>
                    </div>
                    <SmoothRouteLink href="/admin/products" className="adminSecondaryAction">Cancelar</SmoothRouteLink>
                </div>
                <ProductForm
                    mode="edit"
                    initialData={{
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        imageUrl: product.imageUrl,
                        images: product.images,
                        price: product.price,
                        type: product.type,
                        catalogItems: product.catalogItems.map(({ item }) => ({
                            id: item.id,
                            name: item.name,
                        })),
                    }}
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
