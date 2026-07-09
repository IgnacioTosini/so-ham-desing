import type { MouseEvent } from 'react';
import { IoLogoWhatsapp } from 'react-icons/io';
import { buildWhatsappMessageCreatePiece } from '@/utils/buildWhatsappMessage';
import { PieceType } from '@/types';
import './_yourOrder.scss';

interface Props {
    selectedPiece: PieceType;
    selectedStoneNames: string[];
}

export const YourOrder = ({ selectedPiece, selectedStoneNames }: Props) => {
    const whatsappUrl = buildWhatsappMessageCreatePiece({
        type: selectedPiece,
        stones: selectedStoneNames,
    });
    const selectedPieceLabel = selectedPiece === 'NECKLACE' ? 'Collar' : 'Pulsera';
    const hasSelectedStones = selectedStoneNames.length > 0;

    const handleSubmit = (event: MouseEvent<HTMLAnchorElement>) => {
        if (hasSelectedStones) return;
        event.preventDefault();
    };

    return (
        <div className={`yourOrder ${hasSelectedStones ? 'isReady' : 'isEmpty'}`}>
            <div className='yourOrderContainerHeader'>
                <div className='yourOrderTitleGroup'>
                    <p className='yourOrderEyebrow'>{hasSelectedStones ? 'Pedido listo' : 'Pedido pendiente'}</p>
                    <h3 className='yourOrderTitle'>Tu pieza personalizada</h3>
                </div>
                <div className='selectedPiece'>
                    <p className='piece'>{selectedPieceLabel}</p>
                    <div className='selectedStones'>
                        {hasSelectedStones ? (
                            selectedStoneNames.map((stoneName, index) => (
                                <p key={index} className='stone'>{stoneName}</p>
                            ))
                        ) : (
                            <p>No has seleccionado ninguna piedra.</p>
                        )}
                    </div>
                </div>
            </div>
            <a
                className='yourOrderButton'
                href={whatsappUrl}
                target='_blank'
                rel='noopener noreferrer'
                aria-disabled={!hasSelectedStones}
                onClick={handleSubmit}
            >
                <span>{hasSelectedStones ? 'Enviar pedido por WhatsApp' : 'Elegí al menos una piedra'}</span> <IoLogoWhatsapp />
            </a>
        </div>
    )
}
