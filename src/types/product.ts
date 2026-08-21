import type { ImageAsset, Stone } from './stone';
import type { CatalogAttributeType, CatalogCategoryRole } from './catalog';

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string;
    type: PieceType;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductStoneRelation {
    id: string;
    productId: string;
    stoneId: string;
    stone: Stone;
}

export interface ProductImageRelation {
    id: string;
    productId: string;
    imageId: string;
    image: ImageAsset;
}

export interface ProductCatalogItemRelation {
    id: string;
    productId: string;
    itemId: string;
    item: {
        id: string;
        categoryId: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
        isActive: boolean;
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            order: number;
            role: CatalogCategoryRole;
        };
        attributeValues: Array<{
            id: string;
            value: string;
            attribute: {
                id: string;
                name: string;
                key: string;
                type: CatalogAttributeType;
                unit: string | null;
            };
        }>;
    };
}

export interface ProductWithRelations extends Product {
    stones: ProductStoneRelation[];
    catalogItems: ProductCatalogItemRelation[];
    images: ProductImageRelation[];
}

export type Products = Product[];
export type ProductsWithRelations = ProductWithRelations[];
export type PieceType = 'BRACELET' | 'NECKLACE';
