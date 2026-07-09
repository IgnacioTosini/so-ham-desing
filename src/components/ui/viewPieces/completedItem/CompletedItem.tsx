import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRightLong } from 'react-icons/fa6';
import { Product } from '@/types';
import './_completedItem.scss';

interface Props {
  item: Product;
}

export const CompletedItem = ({ item }: Props) => {
  return (
    <div className='viewPiecesItem' key={item.id}>
      <picture className='viewPiecesItemPicture'>
        <Image src={item.imageUrl} className='viewPiecesItemImage' alt={`Pieza ${item.name}`} width={360} height={360} />
      </picture>
      <div className='viewPiecesItemContent'>
        <div className='viewPiecesItemInfo'>
          <div>
            <h3>{item.name}</h3>
            <p className='viewPiecesItemDescription'>{item.description}</p>
          </div>
          <p className='viewPiecesItemPrice'>${item.price}</p>
        </div>
        <Link href={`/piezas/${item.id}`} className='viewPiecesItemButton'>Ver detalle <FaArrowRightLong className='viewPiecesItemButtonIcon' /></Link>
      </div>
    </div>
  )
}
