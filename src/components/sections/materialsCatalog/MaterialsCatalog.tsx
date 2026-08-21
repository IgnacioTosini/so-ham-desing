"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Title } from "@/components/ui/Title/Title";
import type { CatalogCategoryRole, CatalogCategoryView, CatalogItemAttributeView } from "@/types";
import "./_materialsCatalog.scss";

interface MaterialsCatalogProps {
    categories: CatalogCategoryView[];
}

const roleLabels: Record<CatalogCategoryRole, string> = {
    BEAD: "Cuentas para combinar",
    CHARM: "Piezas protagonistas",
    BASE: "Estructura de la pieza",
    CLASP: "Cierres y terminaciones",
};

const formatAttributeValue = (attribute: CatalogItemAttributeView) => {
    if (attribute.type === "BOOLEAN") return attribute.value === "true" ? "Sí" : "No";
    return `${attribute.value}${attribute.unit ? ` ${attribute.unit}` : ""}`;
};

export function MaterialsCatalog({ categories }: MaterialsCatalogProps) {
    const initialCategoryId = categories.find((category) => category.items.length > 0)?.id ?? categories[0]?.id ?? "";
    const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
    const activeCategory = useMemo(
        () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
        [activeCategoryId, categories]
    );

    if (!activeCategory) return null;

    return (
        <section className="materialsCatalog" id="materials">
            <div className="materialsCatalogContainer">
                <header className="materialsCatalogHeader">
                    <Title title="Nuestros materiales" subTitle="Cada componente aporta forma, textura e intención." />
                    <p>
                        Explorá los insumos que usamos para crear cada pulsera y collar. No se venden por separado:
                        forman parte de las piezas terminadas y del simulador.
                    </p>
                </header>

                <div className="materialsCategoryTabs" role="tablist" aria-label="Categorías de materiales">
                    {categories.map((category) => (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={category.id === activeCategory.id}
                            className={category.id === activeCategory.id ? "isActive" : ""}
                            onClick={() => setActiveCategoryId(category.id)}
                            key={category.id}
                        >
                            <span>{category.name}</span>
                            <small>{category.items.length}</small>
                        </button>
                    ))}
                </div>

                <div className="materialsCategoryIntro">
                    <div>
                        <span>{roleLabels[activeCategory.role]}</span>
                        <h3>{activeCategory.name}</h3>
                    </div>
                    <p>{activeCategory.description || "Componentes disponibles para personalizar tu pieza."}</p>
                </div>

                {activeCategory.items.length > 0 ? (
                    <div className="materialsGrid">
                        {activeCategory.items.map((item) => (
                            <article className="materialCard" key={item.id}>
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt={item.name} width={320} height={260} className="materialCardImage" />
                                ) : (
                                    <div className="materialCardImage placeholder" aria-hidden="true">
                                        {item.name.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="materialCardContent">
                                    <span className="materialCardCategory">{item.categoryName}</span>
                                    <h4>{item.name}</h4>
                                    {item.description ? <p>{item.description}</p> : null}
                                    {item.attributes.length > 0 ? (
                                        <dl>
                                            {item.attributes.map((attribute) => (
                                                <div key={attribute.id}>
                                                    <dt>{attribute.name}</dt>
                                                    <dd>{formatAttributeValue(attribute)}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : null}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="materialsEmpty">
                        <p>Estamos preparando los componentes de esta categoría.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
