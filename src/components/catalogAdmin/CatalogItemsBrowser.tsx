"use client";

import { useMemo, useState } from "react";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import CatalogItemCard, { type CatalogItemCardData } from "./CatalogItemCard";
import "./_catalogAdmin.scss";

interface CategoryOption {
    id: string;
    name: string;
}

interface CatalogItemsBrowserProps {
    categories: CategoryOption[];
    items: CatalogItemCardData[];
    initialCategoryId?: string;
}

export default function CatalogItemsBrowser({
    categories,
    items,
    initialCategoryId,
}: CatalogItemsBrowserProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState(
        categories.some((category) => category.id === initialCategoryId) ? initialCategoryId : undefined
    );

    const filteredItems = useMemo(
        () => selectedCategoryId
            ? items.filter((item) => item.categoryId === selectedCategoryId)
            : items,
        [items, selectedCategoryId]
    );

    const selectCategory = (categoryId?: string) => {
        setSelectedCategoryId(categoryId);

        const url = new URL(window.location.href);
        if (categoryId) url.searchParams.set("category", categoryId);
        else url.searchParams.delete("category");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
    };

    return (
        <>
            <div className="adminPageHeader">
                <div>
                    <span className="adminEyebrow">{filteredItems.length} insumos</span>
                    <h1>Insumos</h1>
                    <p>Administra las piezas disponibles y completa los atributos definidos por su categoría.</p>
                </div>
                <SmoothRouteLink href="/admin/catalog-items/new" className="adminPrimaryAction">Nuevo insumo</SmoothRouteLink>
            </div>

            <nav className="catalogFilters" aria-label="Filtrar por categoría">
                <button
                    type="button"
                    className={!selectedCategoryId ? "active" : ""}
                    onClick={() => selectCategory()}
                    aria-pressed={!selectedCategoryId}
                >
                    Todos
                </button>
                {categories.map((category) => (
                    <button
                        type="button"
                        className={selectedCategoryId === category.id ? "active" : ""}
                        onClick={() => selectCategory(category.id)}
                        aria-pressed={selectedCategoryId === category.id}
                        key={category.id}
                    >
                        {category.name}
                    </button>
                ))}
            </nav>

            <div className="catalogItemGrid">
                {filteredItems.length ? filteredItems.map((item) => (
                    <CatalogItemCard item={item} key={item.id} />
                )) : (
                    <div className="catalogEmptyPanel">
                        <p>No hay insumos para este filtro.</p>
                        <SmoothRouteLink
                            href={selectedCategoryId
                                ? `/admin/catalog-items/new?category=${selectedCategoryId}`
                                : "/admin/catalog-items/new"}
                            className="adminSecondaryAction"
                        >
                            Crear el primero
                        </SmoothRouteLink>
                    </div>
                )}
            </div>
        </>
    );
}
