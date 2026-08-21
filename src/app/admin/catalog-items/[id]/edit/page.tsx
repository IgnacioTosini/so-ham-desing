import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalogItemById, getCategories } from "@/actions/catalog.action";
import { requireAdminSession } from "@/lib/adminAuth";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import CatalogItemForm from "@/components/catalogItemForm/CatalogItemForm";
import "@/components/catalogAdmin/_catalogAdmin.scss";

interface EditCatalogItemPageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: "Editar insumo",
    robots: { index: false, follow: false },
};

export default async function EditCatalogItemPage({ params }: EditCatalogItemPageProps) {
    await requireAdminSession();
    const { id } = await params;
    const [item, categories] = await Promise.all([getCatalogItemById(id), getCategories()]);
    if (!item) notFound();

    return (
        <div className="catalogAdminPage">
            <div className="catalogAdminContainer narrow">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">Editar insumo</span>
                        <h1>{item.name}</h1>
                        <p>Actualiza sus datos generales y atributos específicos.</p>
                    </div>
                    <SmoothRouteLink href="/admin/catalog-items" className="adminSecondaryAction">Cancelar</SmoothRouteLink>
                </div>
                <CatalogItemForm mode="edit" categories={categories} initialData={item} />
            </div>
        </div>
    );
}
