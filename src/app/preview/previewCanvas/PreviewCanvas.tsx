"use client";

import { NecklaceCircle } from "@/components/ui/simulator/necklaceCircle/NecklaceCircle";
import { CatalogItemView, PieceType } from "@/types";

interface Props {
    pieceType: PieceType;
    beadStones: Record<number, string>;
    items: CatalogItemView[];
}

export function PreviewCanvas({ pieceType, beadStones, items }: Props) {
    return (
        <>
            <NecklaceCircle
                selectedPiece={pieceType}
                selectedBeadIndex={null}
                beadStones={beadStones}
                items={items}
            />
        </>
    );
}
