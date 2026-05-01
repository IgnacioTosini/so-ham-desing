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

    return (
        <div className='yourOrder'>
            <div className='yourOrderContainerHeader'>
                <h3 className='yourOrderTitle'>Tu pedido</h3>
                <div className='selectedPiece'>
                    <p className='piece'>{selectedPieceLabel} ·</p>
                    <div className='selectedStones'>
                        {selectedStoneNames.length > 0 ? (
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
            >
                <span>Enviar pedido por WhatsApp</span> <IoLogoWhatsapp />
            </a>
        </div>
    )
}
