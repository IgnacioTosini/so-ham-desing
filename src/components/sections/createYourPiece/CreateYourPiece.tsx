"use client";

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { animateCreateYourPieceSection } from '@/components/animations/gsap';
import { Title } from '@/components/ui/Title/Title';
import { PieceSelector } from '@/components/ui/createYourPiece/pieceSelector/PieceSelector';
import { StoneItem } from '@/components/ui/createYourPiece/stoneItem/StoneItem';
import { YourOrder } from '@/components/ui/createYourPiece/yourOrder/YourOrder';
import { PieceType, Stones } from '@/types';
import './_createYourPiece.scss';

interface CreateYourPieceProps {
  stones: Stones;
}

export const CreateYourPiece = ({ stones }: CreateYourPieceProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedPiece, setSelectedPiece] = useState<PieceType>('BRACELET');
  const [selectedStoneIds, setSelectedStoneIds] = useState<string[]>(stones[0] ? [stones[0].id] : []);
  const [selectedStoneNames, setSelectedStoneNames] = useState<string[]>(stones[0] ? [stones[0].name] : []);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      animateCreateYourPieceSection(sectionRef.current!);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleStoneSelection = (stoneId: string) => {
    setSelectedStoneIds((currentSelectedStoneIds) =>
      currentSelectedStoneIds.includes(stoneId)
        ? currentSelectedStoneIds.filter((currentStoneId) => currentStoneId !== stoneId)
        : [...currentSelectedStoneIds, stoneId]
    );
    setSelectedStoneNames((currentSelectedStoneNames) => {
      const stoneName = stones.find((s) => s.id === stoneId)?.name || '';
      return currentSelectedStoneNames.includes(stoneName)
        ? currentSelectedStoneNames.filter((name) => name !== stoneName)
        : [...currentSelectedStoneNames, stoneName];
    });
  };

  return (
    <div className="createYourPiece" id='createPiece' ref={sectionRef}>
      <div className='createYourPieceContainer'>
        <Title title={'Creá tu pieza'} subTitle={'Diseñá tu pulsera o collar a medida.'} />
        <p className="description">Elegí las piedras que resuenen con vos. Cada combinación es una intención.</p>
        <PieceSelector selectedPiece={selectedPiece} onPieceChange={setSelectedPiece} />
        <div className='stoneList'>
          {stones.map((stone) => (
            <StoneItem
              key={stone.id}
              stone={stone}
              selectedStoneIds={selectedStoneIds}
              toggleStoneSelection={toggleStoneSelection}
            />
          ))}
        </div>
        <YourOrder selectedPiece={selectedPiece} selectedStoneNames={selectedStoneNames} />
      </div>
    </div>
  );
};
