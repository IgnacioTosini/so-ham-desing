import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/actions/catalog.action";
import { requireAdminSession } from "@/lib/adminAuth";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import CategoryForm from "@/components/categoryForm/CategoryForm";
import "@/components/catalogAdmin/_catalogAdmin.scss";

interface EditCategoryPageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: "Editar categoría",
    robots: { index: false, follow: false },
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
    await requireAdminSession();
    const { id } = await params;
    const category = await getCategoryById(id);
    if (!category) notFound();

    return (
        <div className="catalogAdminPage">
            <div className="catalogAdminContainer narrow">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">Editar categoría</span>
                        <h1>{category.name}</h1>
                        <p>Al quitar un atributo también se eliminan sus valores en los insumos existentes.</p>
                    </div>
                    <SmoothRouteLink href="/admin/categories" className="adminSecondaryAction">Cancelar</SmoothRouteLink>
                </div>
                <CategoryForm mode="edit" initialData={category} />
            </div>
        </div>
    );
}
