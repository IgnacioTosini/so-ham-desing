"use client";

import { PieceType } from '@/types';
import './_pieceSelector.scss';

interface PieceSelectorProps {
    selectedPiece: PieceType;
    onPieceChange: (piece: PieceType) => void;
}

export const PieceSelector = ({ selectedPiece, onPieceChange }: PieceSelectorProps) => {

    return (
        <div className="pieceSelector" role="tablist" aria-label="Tipo de pieza">
            <button
                type="button"
                role="tab"
                aria-selected={selectedPiece === 'BRACELET'}
                className={selectedPiece === 'BRACELET' ? 'selectorButton isActive' : 'selectorButton'}
                onClick={() => onPieceChange('BRACELET')}
            >
                Pulsera
            </button>

            <button
                type="button"
                role="tab"
                aria-selected={selectedPiece === 'NECKLACE'}
                className={selectedPiece === 'NECKLACE' ? 'selectorButton isActive' : 'selectorButton'}
                onClick={() => onPieceChange('NECKLACE')}
            >
                Collar
            </button>
        </div>
    )
}
