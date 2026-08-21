"use client";

import { useId, useMemo } from "react";
import { CatalogItemView, PieceType } from "@/types";
import { BEAD_COUNT } from "@/utils/bead_count";
import "./_necklaceCircle.scss";

const SVG_SIZE = 800;
const CENTER = SVG_SIZE / 2;
const BEAD_RADIUS = 30;

interface Props {
    selectedPiece: PieceType;
    selectedBeadIndex: number | null;
    onBeadClick?: (index: number) => void;
    beadStones: Record<number, string>;
    items: CatalogItemView[];
}

const PIECE_RADIUS: Record<PieceType, { rx: number; ry: number }> = {
    BRACELET: { rx: 180, ry: 180 }, // círculo perfecto
    NECKLACE:  { rx: 200, ry: 320 }, // elipse vertical: más ancho que pulsera, más alto que ancho
};

const PIECE_VIEWBOX: Record<PieceType, string> = {
    BRACELET: "120 105 560 590",
    NECKLACE: "90 25 620 750",
};

const COUNTER_Y: Record<PieceType, number> = {
    BRACELET: 675,
    NECKLACE: 755,
};

export const NecklaceCircle = ({ selectedPiece, selectedBeadIndex, onBeadClick = () => {}, beadStones, items }: Props) => {
    const clipPathPrefix = useId().replace(/:/g, "");
    const totalBeads = BEAD_COUNT[selectedPiece];
    const { rx, ry } = PIECE_RADIUS[selectedPiece];

    const beads = useMemo(() => {
        const normalize = (value: number) => Number(value.toFixed(4));

        return Array.from({ length: totalBeads }, (_, i) => {
            const angle = (2 * Math.PI * i) / totalBeads - Math.PI / 2;
            return {
                id: i,
                x: normalize(CENTER + rx * Math.cos(angle)),
                y: normalize(CENTER + ry * Math.sin(angle)),
            };
        });
    }, [totalBeads, rx, ry]);

    const assignedCount = Object.keys(beadStones).length;

    return (
        <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={PIECE_VIEWBOX[selectedPiece]}
            className="necklaceCircleSvg"
        >
            {/* Definimos un clipPath circular por cada bolita */}
            <defs>
                {beads.map((bead) => (
                    <clipPath key={`clip-${bead.id}`} id={`${clipPathPrefix}-clip-bead-${bead.id}`}>
                        <circle cx={bead.x} cy={bead.y} r={BEAD_RADIUS} />
                    </clipPath>
                ))}
            </defs>

            {beads.map((bead) => {
                // beadStones guarda { índice: stoneId }
                const assignedStoneId = beadStones[bead.id];
                const assignedStone = assignedStoneId
                    ? items.find((item) => item.id === assignedStoneId)
                    : null;
                const isSelected = selectedBeadIndex === bead.id;

                return (
                    <g key={bead.id} className="necklaceCircleBead" onClick={() => onBeadClick(bead.id)}>
                        {/* Aro de selección — detrás de todo */}
                        {isSelected && (
                            <circle
                                cx={bead.x}
                                cy={bead.y}
                                r={BEAD_RADIUS + 6}
                                fill="none"
                                stroke="#E4C49E"
                                strokeWidth={4}
                                opacity={0.9}
                            />
                        )}

                        {/* Bolita base (siempre visible) */}
                        <circle
                            cx={bead.x}
                            cy={bead.y}
                            r={BEAD_RADIUS}
                            fill="#D4C5B0"
                            stroke={isSelected ? "#E4C49E" : "#C4B49F"}
                            strokeWidth={isSelected ? 3 : 1}
                        />

                        {/* Imagen de la piedra encima, recortada al círculo */}
                        {assignedStone?.imageUrl && (
                            <image
                                href={assignedStone.imageUrl}
                                x={bead.x - BEAD_RADIUS}
                                y={bead.y - BEAD_RADIUS}
                                width={BEAD_RADIUS * 2}
                                height={BEAD_RADIUS * 2}
                                clipPath={`url(#${clipPathPrefix}-clip-bead-${bead.id})`}
                                preserveAspectRatio="xMidYMid slice"
                            />
                        )}
                    </g>
                );
            })}

            {/* Contador dinámico */}
            <text
                x={CENTER}
                y={COUNTER_Y[selectedPiece]}
                textAnchor="middle"
                className="necklaceCircleCounter"
                fill="#9CA3AF"
                fontSize={13}
                fontFamily="system-ui, sans-serif"
            >
                {assignedCount} / {totalBeads} COMPONENTES
            </text>
        </svg>
    );
};
