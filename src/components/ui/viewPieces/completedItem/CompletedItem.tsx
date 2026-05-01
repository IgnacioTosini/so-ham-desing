import Image from 'next/image';
import { FaArrowRightLong } from 'react-icons/fa6';
import { buildWhatsappMessageCompletePiece } from '@/utils';
import { Product } from '@/types';
import './_completedItem.scss';

interface Props {
  item: Product;
}

export const CompletedItem = ({ item }: Props) => {
  const whatsappUrl = buildWhatsappMessageCompletePiece({
    type: item.type,
    completedPiece: item,
  });
  return (
    <div className='viewPiecesItem' key={item.id}>
      <picture className='viewPiecesItemPicture'>
        <Image src={item.imageUrl} className='viewPiecesItemImage' alt={`Pieza ${item.name}`} width={360} height={360} />
      </picture>
      <div className='viewPiecesItemContent'>
        <div className='viewPiecesItemInfo'>
          <div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
          <p className='viewPiecesItemPrice'>${item.price}</p>
        </div>
        <a href={whatsappUrl} target='_blank'
          rel='noopener noreferrer' className='viewPiecesItemButton'>Consultar por Whatsapp <FaArrowRightLong className='viewPiecesItemButtonIcon' /></a>
      </div>
    </div>
  )
}
