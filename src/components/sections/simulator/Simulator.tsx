'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { animateSimulatorSection } from '@/components/animations/gsap';
import { Title } from '@/components/ui/Title/Title';
import { NecklaceCircle } from '@/components/ui/simulator/necklaceCircle/NecklaceCircle';
import { PieceSelector } from '@/components/ui/createYourPiece/pieceSelector/PieceSelector';
import { CatalogCategoryView, CatalogItemView, PieceType } from '@/types';
import { CatalogPanel } from '@/components/ui/simulator/catalogPanel/CatalogPanel';
import { BraceletSizeGuide } from '@/components/ui/braceletSizeGuide/BraceletSizeGuide';
import { buildWhatsappMessagePreview } from '@/utils';
import { getSiteUrl } from '@/utils/siteUrl';
import { IoLogoWhatsapp } from 'react-icons/io';
import { IoPeopleOutline } from 'react-icons/io5';
import { SmoothRouteLink } from '@/components/ui/SmoothRouteLink';
import { BEAD_COUNT } from '@/utils/bead_count';
import { createSharedDesign } from '@/actions/design.action';
import './_simulator.scss';
import { toast } from 'react-toastify';

interface Props {
    categories: CatalogCategoryView[];
}

interface DesignSnapshot {
    beadStones: Record<number, string>;
    baseItemId: string | null;
    claspItemId: string | null;
}

export const Simulator = ({ categories = [] }: Props) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [selectedPiece, setSelectedPiece] = useState<PieceType>('NECKLACE');
    const [selectedBeadIndex, setSelectedBeadIndex] = useState<number | null>(null);
    const [beadStones, setBeadStones] = useState<Record<number, string>>({});
    const [baseItemId, setBaseItemId] = useState<string | null>(null);
    const [claspItemId, setClaspItemId] = useState<string | null>(null);
    const [activePaintItemId, setActivePaintItemId] = useState<string | null>(null);
    const [designHistory, setDesignHistory] = useState<DesignSnapshot[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [designName, setDesignName] = useState('');
    const totalBeads = BEAD_COUNT[selectedPiece];
    const assignedCount = Object.keys(beadStones).length;
    const remainingBeads = Math.max(totalBeads - assignedCount, 0);
    const completionPercent = Math.round((assignedCount / totalBeads) * 100);
    const hasDesignName = designName.trim().length > 0;
    const isDesignComplete = assignedCount >= totalBeads;
    const canSend = !isSending && isDesignComplete && hasDesignName;
    const catalogItems = categories.flatMap((category) => category.items);
    const selectedBase = baseItemId ? catalogItems.find((item) => item.id === baseItemId) : null;
    const selectedClasp = claspItemId ? catalogItems.find((item) => item.id === claspItemId) : null;
    const activePaintItem = activePaintItemId
        ? catalogItems.find((item) => item.id === activePaintItemId) ?? null
        : null;
    const hasAnyDesign = assignedCount > 0 || Boolean(baseItemId) || Boolean(claspItemId);
    const canFillEmpty = Boolean(activePaintItem) && !isDesignComplete;
    const sendButtonLabel = isSending
        ? 'Generando...'
        : !isDesignComplete
            ? `Faltan ${remainingBeads} ${remainingBeads === 1 ? 'posición' : 'posiciones'}`
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

    const saveSnapshot = () => {
        setDesignHistory((history) => [
            ...history,
            { beadStones, baseItemId, claspItemId },
        ].slice(-40));
    };

    const handleBeadClick = (index: number) => {
        setSelectedBeadIndex(index);

        if (!activePaintItemId || beadStones[index] === activePaintItemId) return;
        saveSnapshot();
        setBeadStones((current) => ({ ...current, [index]: activePaintItemId }));
    };

    const handlePieceChange = (piece: PieceType) => {
        setSelectedPiece(piece);
        setSelectedBeadIndex(null);
        setBeadStones({}); // Reseteamos las piedras asignadas al cambiar de pieza
        setBaseItemId(null);
        setClaspItemId(null);
        setActivePaintItemId(null);
        setDesignHistory([]);
    };

    const handleCatalogItemClick = (item: CatalogItemView) => {
        if (item.categoryRole === 'BASE') {
            saveSnapshot();
            setBaseItemId((current) => current === item.id ? null : item.id);
            return;
        }
        if (item.categoryRole === 'CLASP') {
            saveSnapshot();
            setClaspItemId((current) => current === item.id ? null : item.id);
            return;
        }
        setActivePaintItemId((current) => current === item.id ? null : item.id);
    };

    const handleUndo = () => {
        const previousDesign = designHistory.at(-1);
        if (!previousDesign) return;

        setBeadStones(previousDesign.beadStones);
        setBaseItemId(previousDesign.baseItemId);
        setClaspItemId(previousDesign.claspItemId);
        setDesignHistory((history) => history.slice(0, -1));
    };

    const handleFillEmpty = () => {
        if (!activePaintItemId || isDesignComplete) return;
        saveSnapshot();
        setBeadStones((current) => {
            const completed = { ...current };
            for (let index = 0; index < totalBeads; index += 1) {
                if (!completed[index]) completed[index] = activePaintItemId;
            }
            return completed;
        });
    };

    const handleRemoveSelected = () => {
        if (selectedBeadIndex === null || !beadStones[selectedBeadIndex]) return;
        saveSnapshot();
        setBeadStones((current) => {
            const next = { ...current };
            delete next[selectedBeadIndex];
            return next;
        });
    };

    const handleClearDesign = () => {
        if (!hasAnyDesign) return;
        saveSnapshot();
        setBeadStones({});
        setBaseItemId(null);
        setClaspItemId(null);
        setSelectedBeadIndex(null);
    };

    const handleSendWhatsapp = async () => {
        // iOS Safari requires the new tab to be opened directly from the click.
        // A local waiting page keeps it useful while the design is being saved.
        const whatsappTab = window.open('/preparando-whatsapp', 'so-ham-whatsapp');

        if (!whatsappTab) {
            toast.error('El navegador bloqueó la pestaña de WhatsApp. Habilitá las ventanas emergentes e intentá nuevamente.');
            return;
        }

        setIsSending(true);
        try {
            const design = await createSharedDesign({
                type: selectedPiece,
                beadStones,
                name: designName.trim() || 'Diseño sin nombre',
                configuration: { baseItemId, claspItemId },
            });
            const siteUrl = getSiteUrl();
            const previewUrl = `${siteUrl}/preview/${design.shareCode}`;
            const whatsappUrl = buildWhatsappMessagePreview({ piece: selectedPiece, previewUrl });

            setDesignName('');
            setBeadStones({});
            setBaseItemId(null);
            setClaspItemId(null);
            setActivePaintItemId(null);
            setDesignHistory([]);
            setSelectedBeadIndex(null);

            // Remove access to the store tab before leaving our origin, then
            // replace the waiting page so Back cannot return to it.
            whatsappTab.opener = null;
            whatsappTab.location.replace(whatsappUrl);
        } catch {
            whatsappTab.close();
            toast.error('No se pudo crear/enviar el diseño por WhatsApp');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className='simulator' ref={sectionRef} id='simulator'>
            <div className='simulatorContainer'>
                <div className="simulatorHeader">
                    <Title title={'Simulador'} subTitle={'Armá tu pieza componente por componente.'} />
                    <SmoothRouteLink href="/disenos" className="simulatorSharedDesignsButton">
                        <IoPeopleOutline aria-hidden="true" />
                        Ver diseños compartidos
                    </SmoothRouteLink>
                </div>
                <div className="simulatorPieceSelector">
                    <PieceSelector selectedPiece={selectedPiece} onPieceChange={handlePieceChange} />
                    <div className="simulatorProgress" aria-live="polite">
                        <div className="simulatorProgressText">
                            <span>{assignedCount} / {totalBeads}</span>
                            <p>{isDesignComplete ? 'Diseño completo' : 'posiciones completas'}</p>
                        </div>
                        <div className="simulatorProgressTrack" aria-hidden="true">
                            <span style={{ width: `${completionPercent}%` }} />
                        </div>
                    </div>
                </div>
                <div className="simulatorLayout">
                    <div className={`simulatorPreview ${selectedPiece === 'NECKLACE' ? 'isNecklace' : 'isBracelet'}`}>
                        <div className="simulatorPaintStatus" aria-live="polite">
                            <span className={activePaintItem ? "simulatorPaintSwatch isActive" : "simulatorPaintSwatch"}>
                                {activePaintItem?.name.slice(0, 1) ?? "+"}
                            </span>
                            <div>
                                <small>{activePaintItem ? "Material seleccionado" : "Paso 1"}</small>
                                <strong>{activePaintItem?.name ?? "Elegí un material"}</strong>
                            </div>
                            <span className="simulatorPositionLabel">
                                {selectedBeadIndex === null
                                    ? `Tocá la pieza · ${assignedCount}/${totalBeads}`
                                    : `Posición ${selectedBeadIndex + 1} · ${assignedCount}/${totalBeads}`}
                            </span>
                        </div>

                        <NecklaceCircle
                            selectedPiece={selectedPiece}
                            selectedBeadIndex={selectedBeadIndex}
                            onBeadClick={handleBeadClick}
                            beadStones={beadStones}
                            items={catalogItems}
                        />

                        <div className="simulatorCanvasTools" aria-label="Herramientas del diseño">
                            <button type="button" onClick={handleUndo} disabled={designHistory.length === 0}>Deshacer</button>
                            <button type="button" onClick={handleFillEmpty} disabled={!canFillEmpty}>Rellenar vacías</button>
                            <button
                                type="button"
                                onClick={handleRemoveSelected}
                                disabled={selectedBeadIndex === null || !beadStones[selectedBeadIndex]}
                            >
                                Vaciar posición
                            </button>
                            <button type="button" onClick={handleClearDesign} disabled={!hasAnyDesign}>Limpiar</button>
                        </div>
                    </div>
                    <CatalogPanel
                        categories={categories}
                        onItemClick={handleCatalogItemClick}
                        activePaintItemId={activePaintItemId}
                        baseItemId={baseItemId}
                        claspItemId={claspItemId}
                    />
                </div>
                {selectedPiece === 'BRACELET' && <BraceletSizeGuide variant="compact" />}
                <div className="simulatorFooter">
                    {(selectedBase || selectedClasp) && (
                        <div className="simulatorStructureSummary" aria-label="Estructura seleccionada">
                            {selectedBase ? <span><strong>Base</strong>{selectedBase.name}</span> : null}
                            {selectedClasp ? <span><strong>Cierre</strong>{selectedClasp.name}</span> : null}
                        </div>
                    )}
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
