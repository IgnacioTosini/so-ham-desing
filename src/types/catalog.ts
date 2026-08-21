export type CatalogAttributeType = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT";
export type CatalogCategoryRole = "BEAD" | "CHARM" | "BASE" | "CLASP";

export interface CatalogItemAttributeView {
    id: string;
    name: string;
    key: string;
    type: CatalogAttributeType;
    unit: string | null;
    value: string;
}

export interface CatalogItemView {
    id: string;
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    categoryRole: CatalogCategoryRole;
    name: string;
    description: string | null;
    imageUrl: string | null;
    attributes: CatalogItemAttributeView[];
}

export interface CatalogCategoryView {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    role: CatalogCategoryRole;
    items: CatalogItemView[];
}

export interface SharedDesignConfiguration {
    baseItemId?: string | null;
    claspItemId?: string | null;
}
