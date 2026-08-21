import type { Metadata } from "next";
import { getCatalogItems, getCategories } from "@/actions/catalog.action";
import { requireAdminSession } from "@/lib/adminAuth";
import CatalogItemsBrowser from "@/components/catalogAdmin/CatalogItemsBrowser";
import "@/components/catalogAdmin/_catalogAdmin.scss";

export const metadata: Metadata = {
    title: "Insumos del catálogo",
    description: "Gestión de piedras, dijes, cadenas y otros insumos.",
    robots: { index: false, follow: false },
};

interface CatalogItemsPageProps {
    searchParams: Promise<{ category?: string }>;
}

export default async function AdminCatalogItemsPage({ searchParams }: CatalogItemsPageProps) {
    await requireAdminSession();
    const { category: selectedCategoryId } = await searchParams;
    const [categories, items] = await Promise.all([
        getCategories(),
        getCatalogItems(),
    ]);

    return (
        <div className="catalogAdminPage">
            <div className="catalogAdminContainer">
                <CatalogItemsBrowser
                    categories={categories.map((category) => ({ id: category.id, name: category.name }))}
                    items={items.map((item) => ({
                        id: item.id,
                        categoryId: item.categoryId,
                        name: item.name,
                        description: item.description,
                        imageUrl: item.imageUrl,
                        isActive: item.isActive,
                        category: { name: item.category.name },
                        attributeValues: item.attributeValues.map((value) => ({
                            id: value.id,
                            value: value.value,
                            attribute: {
                                name: value.attribute.name,
                                unit: value.attribute.unit,
                                type: value.attribute.type,
                            },
                        })),
                    }))}
                    initialCategoryId={selectedCategoryId}
                />
            </div>
        </div>
    );
}
