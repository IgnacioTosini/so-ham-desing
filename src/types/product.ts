import type { ImageAsset, Stone } from './stone';

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

export interface ProductWithRelations extends Product {
    stones: ProductStoneRelation[];
    images: ProductImageRelation[];
}

export type Products = Product[];
export type ProductsWithRelations = ProductWithRelations[];
export type PieceType = 'BRACELET' | 'NECKLACE';
