"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { CatalogCategoryRole, CatalogCategoryView, CatalogItemView } from "@/types";
import "./_catalogPanel.scss";

interface CatalogPanelProps {
    categories: CatalogCategoryView[];
    onItemClick: (item: CatalogItemView) => void;
    activePaintItemId: string | null;
    baseItemId: string | null;
    claspItemId: string | null;
}

type PanelGroupId = "BEADS" | "DETAILS" | "STRUCTURE";

const panelGroups: Array<{
    id: PanelGroupId;
    label: string;
    roles: CatalogCategoryRole[];
}> = [
    { id: "BEADS", label: "Cuentas", roles: ["BEAD"] },
    { id: "DETAILS", label: "Detalles", roles: ["CHARM"] },
    { id: "STRUCTURE", label: "Estructura", roles: ["BASE", "CLASP"] },
];

const roleTitles: Record<CatalogCategoryRole, string> = {
    BEAD: "Elegí una cuenta",
    CHARM: "Elegí un dije",
    BASE: "Elegí la base",
    CLASP: "Elegí el cierre",
};

export function CatalogPanel({
    categories,
    onItemClick,
    activePaintItemId,
    baseItemId,
    claspItemId,
}: CatalogPanelProps) {
    const availableGroups = useMemo(
        () => panelGroups.filter((group) => categories.some((category) => group.roles.includes(category.role))),
        [categories]
    );
    const initialGroupId = availableGroups[0]?.id ?? "BEADS";
    const [activeGroupId, setActiveGroupId] = useState<PanelGroupId>(initialGroupId);
    const activeGroup = availableGroups.find((group) => group.id === activeGroupId) ?? availableGroups[0];
    const groupCategories = useMemo(
        () => activeGroup
            ? categories.filter((category) => activeGroup.roles.includes(category.role))
            : [],
        [activeGroup, categories]
    );
    const initialCategoryId = groupCategories.find((category) => category.items.length > 0)?.id
        ?? groupCategories[0]?.id
        ?? "";
    const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
    const activeCategory = useMemo(
        () => groupCategories.find((category) => category.id === activeCategoryId) ?? groupCategories[0],
        [activeCategoryId, groupCategories]
    );
    const activePaintItem = activePaintItemId
        ? categories.flatMap((category) => category.items).find((item) => item.id === activePaintItemId) ?? null
        : null;

    const selectGroup = (groupId: PanelGroupId) => {
        const nextGroup = availableGroups.find((group) => group.id === groupId);
        const nextCategories = nextGroup
            ? categories.filter((category) => nextGroup.roles.includes(category.role))
            : [];
        setActiveGroupId(groupId);
        setActiveCategoryId(nextCategories.find((category) => category.items.length > 0)?.id ?? nextCategories[0]?.id ?? "");
    };

    if (!activeCategory) {
        return <div className="catalogPanel catalogPanelEmpty">Todavía no hay categorías disponibles.</div>;
    }

    const isPlacementCategory = activeCategory.role === "BEAD" || activeCategory.role === "CHARM";
    const activeItemId = activeCategory.role === "BASE"
        ? baseItemId
        : activeCategory.role === "CLASP"
            ? claspItemId
            : activePaintItemId;

    return (
        <aside className="catalogPanel">
            <div className="catalogPanelHeader">
                <div>
                    <span>Materiales</span>
                    <p>{roleTitles[activeCategory.role]}</p>
                </div>
                <span className={activeItemId ? "catalogPanelState isReady" : "catalogPanelState"}>
                    {isPlacementCategory
                        ? activePaintItem ? "Pincel activo" : "Elegí material"
                        : activeItemId ? "Seleccionado" : "Opcional"}
                </span>
            </div>

            {activePaintItem && (
                <div className="catalogPanelActiveMaterial">
                    <div className="catalogPanelActiveMaterialImage">
                        {activePaintItem.imageUrl ? (
                            <Image src={activePaintItem.imageUrl} alt="" width={42} height={42} />
                        ) : (
                            <span>{activePaintItem.name.slice(0, 1)}</span>
                        )}
                    </div>
                    <div>
                        <small>Material seleccionado</small>
                        <strong>{activePaintItem.name}</strong>
                    </div>
                    <button type="button" onClick={() => onItemClick(activePaintItem)}>Quitar</button>
                </div>
            )}

            <div className="catalogPanelGroups" role="tablist" aria-label="Tipo de componente">
                {availableGroups.map((group) => (
                    <button
                        type="button"
                        role="tab"
                        aria-selected={group.id === activeGroup?.id}
                        className={group.id === activeGroup?.id ? "isActive" : ""}
                        onClick={() => selectGroup(group.id)}
                        key={group.id}
                    >
                        {group.label}
                    </button>
                ))}
            </div>

            <div className="catalogPanelTabs" role="tablist" aria-label="Categorías del simulador">
                {groupCategories.map((category) => (
                    <button
                        type="button"
                        role="tab"
                        aria-selected={category.id === activeCategory.id}
                        className={category.id === activeCategory.id ? "isActive" : ""}
                        onClick={() => setActiveCategoryId(category.id)}
                        key={category.id}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {activeCategory.items.length > 0 ? (
                <div className="catalogPanelGrid">
                    {activeCategory.items.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={activeItemId === item.id ? "catalogPanelItem isActive" : "catalogPanelItem"}
                            onClick={() => onItemClick(item)}
                            aria-pressed={activeItemId === item.id}
                        >
                            <div className="catalogPanelImageWrapper">
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt="" width={74} height={74} className="catalogPanelImage" />
                                ) : (
                                    <span aria-hidden="true">{item.name.slice(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <span className="catalogPanelName">{item.name}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="catalogPanelNoItems">
                    Todavía no hay componentes cargados en {activeCategory.name.toLowerCase()}.
                </div>
            )}

            <p className="catalogPanelTip">
                {isPlacementCategory
                    ? activePaintItem
                        ? "Ahora tocá una o varias posiciones de la pieza para aplicar este material."
                        : "Elegí un material y después tocá las posiciones de la pieza."
                    : `La ${activeCategory.role === "BASE" ? "base" : "terminación"} se aplica a toda la pieza.`}
            </p>
        </aside>
    );
}
