import Image from 'next/image';
import { Stone } from '@/types';
import './_stoneItem.scss';

interface Props {
    stone: Stone;
    selectedStoneIds: string[];
    toggleStoneSelection: (stoneId: string) => void;
}

export const StoneItem = ({ stone, selectedStoneIds, toggleStoneSelection }: Props) => {
    return (
        <button
            key={stone.id}
            type='button'
            className={selectedStoneIds.includes(stone.id) ? 'stoneItem isSelected' : 'stoneItem'}
            aria-pressed={selectedStoneIds.includes(stone.id)}
            onClick={() => toggleStoneSelection(stone.id)}
        >
            <picture className='stoneImageWrapper'>
                <Image className='stoneImage' src={stone.imageUrl} alt={stone.name} width={270} height={270} />
            </picture>
            <div className='stoneInfo'>
                <div className='stoneHeader'>
                    <h3 className='stoneName'>{stone.name}</h3>
                    <span className='stoneMarker' aria-hidden='true'>
                        <span className='stoneMarkerCheck'>✓</span>
                    </span>
                </div>
                <p className='stoneCharacteristics'>{stone.energyTags.join(', ')}</p>
            </div>
        </button>
    )
}
