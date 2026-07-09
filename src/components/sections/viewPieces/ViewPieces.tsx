"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { animateViewPiecesSection } from '@/components/animations/gsap';
import { Title } from '@/components/ui/Title/Title';
import { CompletedItem } from '@/components/ui/viewPieces/completedItem/CompletedItem';
import { PieceType, Products } from '@/types';
import './_viewPieces.scss';

interface ViewPiecesProps {
  products: Products;
}

type ProductFilter = 'ALL' | PieceType;

const filterOptions: Array<{ id: ProductFilter; label: string }> = [
  { id: 'ALL', label: 'Todas' },
  { id: 'BRACELET', label: 'Pulseras' },
  { id: 'NECKLACE', label: 'Collares' },
];

export const ViewPieces = ({ products }: ViewPiecesProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<ProductFilter>('ALL');
  const filteredProducts = useMemo(
    () => products.filter((product) => activeFilter === 'ALL' || product.type === activeFilter),
    [activeFilter, products]
  );

  const getFilterCount = (filter: ProductFilter) => {
    if (filter === 'ALL') return products.length;
    return products.filter((product) => product.type === filter).length;
  };

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
        <div className="viewPiecesFilters" role="tablist" aria-label="Filtrar piezas">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter.id}
              className={activeFilter === filter.id ? 'viewPiecesFilter isActive' : 'viewPiecesFilter'}
              onClick={() => setActiveFilter(filter.id)}
            >
              <span>{filter.label}</span>
              <strong>{getFilterCount(filter.id)}</strong>
            </button>
          ))}
        </div>
        <div className='viewPiecesItems'>
          {products.length === 0 ? (
            <div className="viewPiecesEmpty">
              <p>No hay piezas disponibles en este momento.</p>
              <span>Cuando haya nuevos diseños, van a aparecer acá.</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="viewPiecesEmpty">
              <p>No hay piezas para este filtro.</p>
              <span>Probá con otra categoría o volvé a ver todas.</span>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <CompletedItem key={product.id} item={product} />
            )))
          }
        </div>
      </div>
    </div>
  )
}
