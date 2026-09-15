'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { Product } from '@/types';
import './_completedItem.scss';

interface Props {
  item: Product;
}

export const CompletedItem = ({ item }: Props) => {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  const productHref = `/piezas/${item.id}`;

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
          aria-busy={isOpening}
          onNavigate={event => {
            event.preventDefault();
            if (cleanup.current) return;
            setIsOpening(true);
            let timer = 0;
            const clear = () => {
              window.removeEventListener('scrollend', onScrollEnd);
              window.clearTimeout(timer);
            };
            const navigate = () => {
              clear();
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              router.push(productHref, { scroll: false });
            };
            const onScrollEnd = () => { if (window.scrollY <= 4) navigate(); };
            cleanup.current = clear;
            if (window.scrollY <= 4 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              navigate();
              return;
            }
            window.addEventListener('scrollend', onScrollEnd);
            timer = window.setTimeout(navigate, 600);
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }}
        >
          {isOpening ? 'Abriendo...' : 'Ver detalle'}
          <FaArrowRightLong className='viewPiecesItemButtonIcon' />
        </Link>
      </div>
    </div>
  )
}
