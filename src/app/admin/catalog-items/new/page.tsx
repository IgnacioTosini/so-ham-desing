import type { Metadata } from "next";
import { getCategories } from "@/actions/catalog.action";
import { requireAdminSession } from "@/lib/adminAuth";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import CatalogItemForm from "@/components/catalogItemForm/CatalogItemForm";
import "@/components/catalogAdmin/_catalogAdmin.scss";

export const metadata: Metadata = {
    title: "Nuevo insumo",
    robots: { index: false, follow: false },
};

interface NewCatalogItemPageProps {
    searchParams: Promise<{ category?: string }>;
}

export default async function NewCatalogItemPage({ searchParams }: NewCatalogItemPageProps) {
    await requireAdminSession();
    const [{ category }, categories] = await Promise.all([searchParams, getCategories()]);

    return (
        <div className="catalogAdminPage">
            <div className="catalogAdminContainer narrow">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">Nuevo insumo</span>
                        <h1>Cargar insumo</h1>
                        <p>La categoría seleccionada determina los atributos que se muestran.</p>
                    </div>
                    <SmoothRouteLink href="/admin/catalog-items" className="adminSecondaryAction">Cancelar</SmoothRouteLink>
                </div>
                <CatalogItemForm mode="create" categories={categories} initialCategoryId={category} />
            </div>
        </div>
    );
}
