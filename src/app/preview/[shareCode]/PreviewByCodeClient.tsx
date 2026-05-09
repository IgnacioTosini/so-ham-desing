'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animatePreviewDetailPage } from '@/components/animations/gsap';

interface Props {
  children: React.ReactNode;
}

export function PreviewByCodeClient({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      animatePreviewDetailPage(containerRef.current!);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}