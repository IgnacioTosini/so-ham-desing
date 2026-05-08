"use client";

import { NecklaceCircle } from "@/components/ui/simulator/necklaceCircle/NecklaceCircle";
import { PieceType, Stone } from "@/types";

interface Props {
    pieceType: PieceType;
    beadStones: Record<number, string>;
    stones: Stone[];
}

export function PreviewCanvas({ pieceType, beadStones, stones }: Props) {
    return (
        <>
            <NecklaceCircle
                selectedPiece={pieceType}
                selectedBeadIndex={null}
                beadStones={beadStones}
                stones={stones}
            />
        </>
    );
}
