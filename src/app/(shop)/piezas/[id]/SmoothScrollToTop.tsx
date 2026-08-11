'use client';

import { useEffect } from 'react';

interface Props {
    routeKey: string;
}

export function SmoothScrollToTop({ routeKey }: Props) {
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
            });
        });

        return () => cancelAnimationFrame(frame);
    }, [routeKey]);

    return null;
}
