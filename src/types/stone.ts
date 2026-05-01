export interface ImageAsset {
    id: string;
    url: string;
    alt: string | null;
    order: number;
}

export interface Stone {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    energyTags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface StoneImageRelation {
    id: string;
    stoneId: string;
    imageId: string;
    image: ImageAsset;
}

export interface StoneWithImages extends Stone {
    images: StoneImageRelation[];
}

export type Stones = Stone[];
export type StonesWithImages = StoneWithImages[];