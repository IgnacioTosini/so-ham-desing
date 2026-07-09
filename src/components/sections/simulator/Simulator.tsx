'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { animateSimulatorSection } from '@/components/animations/gsap';
import { Title } from '@/components/ui/Title/Title';
import { NecklaceCircle } from '@/components/ui/simulator/necklaceCircle/NecklaceCircle';
import { PieceSelector } from '@/components/ui/createYourPiece/pieceSelector/PieceSelector';
import { PieceType, Stone } from '@/types';
import { StonePanel } from '@/components/ui/simulator/stonePanel/StonePanel';
import { BraceletSizeGuide } from '@/components/ui/braceletSizeGuide/BraceletSizeGuide';
import { buildWhatsappMessagePreview } from '@/utils';
import { getSiteUrl } from '@/utils/siteUrl';
import { IoLogoWhatsapp } from 'react-icons/io';
import { BEAD_COUNT } from '@/utils/bead_count';
import { createSharedDesign } from '@/actions/design.action';
import './_simulator.scss';
import { toast } from 'react-toastify';

interface Props {
    stones: Stone[];
}

export const Simulator = ({ stones = [] }: Props) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [selectedPiece, setSelectedPiece] = useState<PieceType>('NECKLACE');
    const [selectedBeadIndex, setSelectedBeadIndex] = useState<number | null>(0);
    const [beadStones, setBeadStones] = useState<Record<number, string>>({});
    const [isSending, setIsSending] = useState(false);
    const [designName, setDesignName] = useState('');
    const totalBeads = BEAD_COUNT[selectedPiece];
    const assignedCount = Object.keys(beadStones).length;
    const remainingBeads = Math.max(totalBeads - assignedCount, 0);
    const completionPercent = Math.round((assignedCount / totalBeads) * 100);
    const hasDesignName = designName.trim().length > 0;
    const isDesignComplete = assignedCount >= totalBeads;
    const canSend = !isSending && isDesignComplete && hasDesignName;
    const sendButtonLabel = isSending
        ? 'Generando...'
        : !isDesignComplete
            ? `Faltan ${remainingBeads} ${remainingBeads === 1 ? 'piedra' : 'piedras'}`
            : !hasDesignName
                ? 'Agregá un nombre'
                : 'Enviar diseño por WhatsApp';

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            animateSimulatorSection(sectionRef.current!);
        }, sectionRef);

        return () => ctx.revert();
    }, []);

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
        const nextIndex = (selectedBeadIndex + 1) % totalBeads; // +1 porque aún no se actualiza el estado
        setSelectedBeadIndex(nextIndex); // Deseleccionamos la bolita después de asignarle una piedra
    }

    const handleSendWhatsapp = async () => {
        // iOS Safari can block popups opened after an async gap.
        // Open the tab immediately from the click event, then navigate it later.
        const whatsappTab = window.open('', '_blank', 'noopener,noreferrer');

        setIsSending(true);
        try {
            const design = await createSharedDesign({ type: selectedPiece, beadStones, name: designName.trim() || 'Diseño sin nombre' });
            const siteUrl = getSiteUrl();
            const previewUrl = `${siteUrl}/preview/${design.shareCode}`;
            const whatsappUrl = buildWhatsappMessagePreview({ piece: selectedPiece, previewUrl });

            if (whatsappTab) {
                whatsappTab.location.href = whatsappUrl;
            } else {
                window.location.href = whatsappUrl;
            }

            setDesignName('');
            setBeadStones({});
            setSelectedBeadIndex(0);
        } catch {
            whatsappTab?.close();
            toast.error('No se pudo crear/enviar el diseño por WhatsApp');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className='simulator' ref={sectionRef} id='simulator'>
            <div className='simulatorContainer'>
                <Title title={'Simulador'} subTitle={'Armá tu pieza piedra por piedra.'} />
                <div className="simulatorPieceSelector">
                    <PieceSelector selectedPiece={selectedPiece} onPieceChange={handlePieceChange} />
                    <div className="simulatorProgress" aria-live="polite">
                        <div className="simulatorProgressText">
                            <span>{assignedCount} / {totalBeads}</span>
                            <p>{isDesignComplete ? 'Diseño completo' : 'piedras colocadas'}</p>
                        </div>
                        <div className="simulatorProgressTrack" aria-hidden="true">
                            <span style={{ width: `${completionPercent}%` }} />
                        </div>
                    </div>
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
                        isBeadSelected={selectedBeadIndex !== null}
                        activeStoneId={selectedBeadIndex === null ? null : beadStones[selectedBeadIndex] ?? null}
                    />
                </div>
                {selectedPiece === 'BRACELET' && <BraceletSizeGuide variant="compact" />}
                <div className="simulatorFooter">
                    <div className="designNameContainer">
                        <label htmlFor="designName">Nombra el diseño o pon tu nombre!</label>
                        <input
                            type="text"
                            name="designName"
                            id="designName"
                            className="designNameInput"
                            value={designName}
                            placeholder="Ej: pulsera calma"
                            onChange={(e) => setDesignName(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className={`simulatorWhatsappButton ${!canSend ? 'disabled' : ''}`}
                        onClick={handleSendWhatsapp}
                        disabled={!canSend}
                    >
                        <span>{sendButtonLabel}</span>
                        <IoLogoWhatsapp />
                    </button>
                </div>
            </div>
        </div>
    );
};
