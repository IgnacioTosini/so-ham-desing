"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { deleteCatalogItem } from "@/actions/catalog.action";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import "./_catalogAdmin.scss";

export interface CatalogItemCardData {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    category: { name: string };
    attributeValues: Array<{
        id: string;
        value: string;
        attribute: { name: string; unit: string | null; type: string };
    }>;
}

interface CatalogItemCardProps {
    item: CatalogItemCardData;
}

const formatAttributeValue = (value: CatalogItemCardProps["item"]["attributeValues"][number]) => {
    const displayValue = value.attribute.type === "BOOLEAN"
        ? value.value === "true" ? "Sí" : "No"
        : value.value;
    return `${displayValue}${value.attribute.unit ? ` ${value.attribute.unit}` : ""}`;
};

export default function CatalogItemCard({ item }: CatalogItemCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting || !confirm(`¿Eliminar el insumo "${item.name}"?`)) return;
        setIsDeleting(true);
        try {
            await deleteCatalogItem(item.id);
            toast.success("Insumo eliminado.");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo eliminar el insumo.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <article className="catalogItemCard">
            {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} width={320} height={220} className="catalogItemImage" />
            ) : (
                <div className="catalogItemImage placeholder">Sin imagen</div>
            )}
            <div className="catalogItemContent">
                <div className="catalogItemMeta">
                    <span>{item.category.name}</span>
                    <span className={`catalogStatus ${item.isActive ? "active" : "inactive"}`}>{item.isActive ? "Disponible" : "Oculto"}</span>
                </div>
                <h2>{item.name}</h2>
                {item.description ? <p>{item.description}</p> : null}
                <dl className="catalogItemAttributes">
                    {item.attributeValues.slice(0, 5).map((value) => (
                        <div key={value.id}>
                            <dt>{value.attribute.name}</dt>
                            <dd>{formatAttributeValue(value)}</dd>
                        </div>
                    ))}
                </dl>
            </div>
            <div className="catalogCardActions">
                <SmoothRouteLink href={`/admin/catalog-items/${item.id}/edit`} className="catalogCardButton">Editar</SmoothRouteLink>
                <button type="button" className="catalogCardButton danger" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
            </div>
        </article>
    );
}
