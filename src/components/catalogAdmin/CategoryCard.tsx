"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { deleteCategory } from "@/actions/catalog.action";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import "./_catalogAdmin.scss";

interface CategoryCardProps {
    category: {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        role: "BEAD" | "CHARM" | "BASE" | "CLASP";
        attributes: Array<{ id: string; name: string; unit: string | null; isRequired: boolean }>;
        _count: { items: number };
    };
}

const roleLabels = {
    BEAD: "Cuenta",
    CHARM: "Dije",
    BASE: "Base",
    CLASP: "Cierre",
} as const;

export default function CategoryCard({ category }: CategoryCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting || !confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
        setIsDeleting(true);
        try {
            await deleteCategory(category.id);
            toast.success("Categoría eliminada.");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo eliminar la categoría.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <article className="catalogAdminCard">
            <div className="catalogCardHeading">
                <div>
                    <span className={`catalogStatus ${category.isActive ? "active" : "inactive"}`}>
                        {category.isActive ? "Visible" : "Oculta"}
                    </span>
                    <h2>{category.name}</h2>
                </div>
                <span className="catalogCount">{category._count.items} insumos</span>
            </div>
            <span className="catalogRoleLabel">Uso en simulador: {roleLabels[category.role]}</span>
            <p>{category.description || "Sin descripción."}</p>
            <div className="catalogAttributeChips">
                {category.attributes.length ? category.attributes.map((attribute) => (
                    <span key={attribute.id}>
                        {attribute.name}{attribute.unit ? ` · ${attribute.unit}` : ""}{attribute.isRequired ? " *" : ""}
                    </span>
                )) : <span>Sin atributos propios</span>}
            </div>
            <div className="catalogCardActions">
                <SmoothRouteLink href={`/admin/catalog-items/new?category=${category.id}`} className="catalogCardButton">Agregar insumo</SmoothRouteLink>
                <SmoothRouteLink href={`/admin/categories/${category.id}/edit`} className="catalogCardButton">Editar</SmoothRouteLink>
                <button type="button" className="catalogCardButton danger" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
            </div>
        </article>
    );
}
