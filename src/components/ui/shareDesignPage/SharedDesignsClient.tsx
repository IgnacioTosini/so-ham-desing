'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animatePreviewListPage } from '@/components/animations/gsap';

interface Props {
  children: React.ReactNode;
}

export function SharedDesignsClient({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      animatePreviewListPage(containerRef.current!);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
