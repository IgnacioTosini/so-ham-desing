'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MouseEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowRightLong } from 'react-icons/fa6';
import { Product } from '@/types';
import './_completedItem.scss';

interface Props {
  item: Product;
}

export const CompletedItem = ({ item }: Props) => {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const productHref = `/piezas/${item.id}`;

  const handleViewDetail = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (isOpening) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || window.scrollY <= 4) {
      window.scrollTo({ top: 0, left: 0 });
      router.push(productHref, { scroll: false });
      return;
    }

    setIsOpening(true);

    let fallbackTimer = 0;
    const openProduct = () => {
      window.removeEventListener('scrollend', openProduct);
      window.clearTimeout(fallbackTimer);
      router.push(productHref, { scroll: false });
    };

    window.addEventListener('scrollend', openProduct, { once: true });
    fallbackTimer = window.setTimeout(openProduct, 900);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

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
          <p className='viewPiecesItemPrice'>${item.price.toLocaleString("es-AR")}</p>
        </div>
        <Link
          href={productHref}
          className='viewPiecesItemButton'
          scroll={false}
          onClick={handleViewDetail}
          aria-busy={isOpening}
        >
          {isOpening ? 'Abriendo...' : 'Ver detalle'}
          <FaArrowRightLong className='viewPiecesItemButtonIcon' />
        </Link>
      </div>
    </div>
  )
}
