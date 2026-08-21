import type { Metadata } from "next";
import { getCategories } from "@/actions/catalog.action";
import { requireAdminSession } from "@/lib/adminAuth";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import CategoryCard from "@/components/catalogAdmin/CategoryCard";
import "@/components/catalogAdmin/_catalogAdmin.scss";

export const metadata: Metadata = {
    title: "Categorías del catálogo",
    description: "Gestión de categorías y atributos del catálogo.",
    robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
    await requireAdminSession();
    const categories = await getCategories();

    return (
        <div className="catalogAdminPage">
            <div className="catalogAdminContainer">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">{categories.length} categorías</span>
                        <h1>Categorías y atributos</h1>
                        <p>Define las familias de insumos y los datos específicos que se pedirán en cada una.</p>
                    </div>
                    <SmoothRouteLink href="/admin/categories/new" className="adminPrimaryAction">Nueva categoría</SmoothRouteLink>
                </div>

                <div className="catalogCategoryGrid">
                    {categories.length ? categories.map((category) => (
                        <CategoryCard category={category} key={category.id} />
                    )) : (
                        <div className="catalogEmptyPanel"><p>No hay categorías cargadas.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
}
