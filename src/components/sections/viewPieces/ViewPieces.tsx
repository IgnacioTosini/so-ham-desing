"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateViewPiecesSection } from '@/components/animations/gsap';
import { Title } from '@/components/ui/Title/Title';
import { CompletedItem } from '@/components/ui/viewPieces/completedItem/CompletedItem';
import { Products } from '@/types';
import './_viewPieces.scss';

interface ViewPiecesProps {
  products: Products;
}

export const ViewPieces = ({ products }: ViewPiecesProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      animateViewPiecesSection(sectionRef.current!);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className='viewPieces' id='viewPieces' ref={sectionRef}>
      <div className='viewPiecesContainer'>
        <Title title={'Diseños ya hechos'} subTitle={'Piezas únicas, listas para encontrar a su persona.'} />
        <div className='viewPiecesItems'>
          {products.length === 0 ? (
            <p>No hay piezas disponibles en este momento.</p>
          ) : (
            products.map((product) => (
              <CompletedItem key={product.id} item={product} />
            )))
          }
        </div>
      </div>
    </div>
  )
}
