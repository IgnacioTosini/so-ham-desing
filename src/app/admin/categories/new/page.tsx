import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/adminAuth";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import CategoryForm from "@/components/categoryForm/CategoryForm";
import "@/components/catalogAdmin/_catalogAdmin.scss";

export const metadata: Metadata = {
    title: "Nueva categoría",
    robots: { index: false, follow: false },
};

export default async function NewCategoryPage() {
    await requireAdminSession();
    return (
        <div className="catalogAdminPage">
            <div className="catalogAdminContainer narrow">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">Nueva categoría</span>
                        <h1>Crear categoría</h1>
                        <p>Agrega únicamente los atributos que realmente diferencian a sus insumos.</p>
                    </div>
                    <SmoothRouteLink href="/admin/categories" className="adminSecondaryAction">Cancelar</SmoothRouteLink>
                </div>
                <CategoryForm mode="create" />
            </div>
        </div>
    );
}
