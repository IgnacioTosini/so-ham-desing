"use client";

import { useMemo } from "react";
import { PieceType, Stone } from "@/types";
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
    stones: Stone[];
}

const PIECE_RADIUS: Record<PieceType, { rx: number; ry: number }> = {
    BRACELET: { rx: 180, ry: 180 }, // círculo perfecto
    NECKLACE:  { rx: 200, ry: 320 }, // elipse vertical: más ancho que pulsera, más alto que ancho
};

export const NecklaceCircle = ({ selectedPiece, selectedBeadIndex, onBeadClick = () => {}, beadStones, stones }: Props) => {
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
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="necklaceCircleSvg"
        >
            {/* Definimos un clipPath circular por cada bolita */}
            <defs>
                {beads.map((bead) => (
                    <clipPath key={`clip-${bead.id}`} id={`clip-bead-${bead.id}`}>
                        <circle cx={bead.x} cy={bead.y} r={BEAD_RADIUS} />
                    </clipPath>
                ))}
            </defs>

            {beads.map((bead) => {
                // beadStones guarda { índice: stoneId }
                const assignedStoneId = beadStones[bead.id];
                const assignedStone = assignedStoneId
                    ? stones.find(s => s.id === assignedStoneId)
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
                                stroke="#000000"
                                strokeWidth={2}
                                opacity={0.6}
                            />
                        )}

                        {/* Bolita base (siempre visible) */}
                        <circle
                            cx={bead.x}
                            cy={bead.y}
                            r={BEAD_RADIUS}
                            fill="#D4C5B0"
                            stroke={isSelected ? "#000000" : "#C4B49F"}
                            strokeWidth={isSelected ? 2 : 1}
                        />

                        {/* Imagen de la piedra encima, recortada al círculo */}
                        {assignedStone && (
                            <image
                                href={assignedStone.imageUrl}
                                x={bead.x - BEAD_RADIUS}
                                y={bead.y - BEAD_RADIUS}
                                width={BEAD_RADIUS * 2}
                                height={BEAD_RADIUS * 2}
                                clipPath={`url(#clip-bead-${bead.id})`}
                                preserveAspectRatio="xMidYMid slice"
                            />
                        )}
                    </g>
                );
            })}

            {/* Contador dinámico */}
            <text
                x={CENTER}
                y={SVG_SIZE - 30}
                textAnchor="middle"
                className="necklaceCircleCounter"
                fill="#9CA3AF"
                fontSize={13}
                fontFamily="system-ui, sans-serif"
            >
                {assignedCount} / {totalBeads} PIEDRAS
            </text>
        </svg>
    );
};
