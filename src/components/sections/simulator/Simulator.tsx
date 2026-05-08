'use client';

import { useState } from 'react';
import { Title } from '@/components/ui/Title/Title';
import { NecklaceCircle } from '@/components/ui/simulator/necklaceCircle/NecklaceCircle';
import { PieceSelector } from '@/components/ui/createYourPiece/pieceSelector/PieceSelector';
import { PieceType, Stone } from '@/types';
import { StonePanel } from '@/components/ui/simulator/stonePanel/StonePanel';
import { buildWhatsappMessagePreview } from '@/utils';
import { IoLogoWhatsapp } from 'react-icons/io';
import { BEAD_COUNT } from '@/utils/bead_count';
import { createSharedDesign } from '@/actions/design.action';
import Link from 'next/link';
import './_simulator.scss';

interface Props {
    stones: Stone[];
}

export const Simulator = ({ stones = [] }: Props) => {
    const [selectedPiece, setSelectedPiece] = useState<PieceType>('NECKLACE');
    const [selectedBeadIndex, setSelectedBeadIndex] = useState<number | null>(0);
    const [beadStones, setBeadStones] = useState<Record<number, string>>({});
    const [isSending, setIsSending] = useState(false);

    const handleBeadClick = (index: number) => {
        // Si clickeás la misma bolita dos veces, la deseleccionás
        setSelectedBeadIndex(prev => prev === index ? null : index);
    };

    const handlePieceChange = (piece: PieceType) => {
        setSelectedPiece(piece);
        setSelectedBeadIndex(0); // Reseteamos la selección de bolita al cambiar de pieza
        setBeadStones({}); // Reseteamos las piedras asignadas al cambiar de pieza
    };

    const handleStoneClick = (stoneName: string) => {
        if (selectedBeadIndex === null) return; // Si no hay ninguna bolita seleccionada, no hacemos nada
        setBeadStones(prev => ({ ...prev, [selectedBeadIndex]: stoneName }));
        const total = BEAD_COUNT[selectedPiece];
        const nextIndex = (selectedBeadIndex + 1) % total; // +1 porque aún no se actualiza el estado
        setSelectedBeadIndex(nextIndex); // Deseleccionamos la bolita después de asignarle una piedra
    }

    const handleSendWhatsapp = async () => {
        setIsSending(true);
        try {
            const design = await createSharedDesign({ type: selectedPiece, beadStones });
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://so-ham-desing.vercel.app';
            const previewUrl = `${siteUrl}/preview/${design.shareCode}`;
            const whatsappUrl = buildWhatsappMessagePreview({ piece: selectedPiece, previewUrl });
            window.open(whatsappUrl, '_blank');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className='simulator'>
            <div className='simulatorContainer'>
                <Title title={'Simulador'} subTitle={'Armá tu pieza piedra por piedra.'} />
                <div className="simulatorPieceSelector">
                    <PieceSelector selectedPiece={selectedPiece} onPieceChange={handlePieceChange} />
                    <Link href="/preview" className='simulatorPreviewLink'>Ver diseños personalizados</Link>
                </div>
                <div className="simulatorLayout">
                    <NecklaceCircle
                        selectedPiece={selectedPiece}
                        selectedBeadIndex={selectedBeadIndex}
                        onBeadClick={handleBeadClick}
                        beadStones={beadStones}
                        stones={stones}
                    />
                    <StonePanel
                        stones={stones}
                        onStoneClick={handleStoneClick}
                    />
                </div>
                <button
                    type="button"
                    className={`simulatorWhatsappButton ${isSending || Object.keys(beadStones).length < BEAD_COUNT[selectedPiece] ? 'disabled' : ''}`}
                    onClick={handleSendWhatsapp}
                    disabled={isSending || Object.keys(beadStones).length < BEAD_COUNT[selectedPiece]}
                >
                    <span>{isSending ? 'Generando...' : 'Enviar diseño por WhatsApp'}</span>
                    <IoLogoWhatsapp />
                </button>
            </div>
        </div>
    );
};