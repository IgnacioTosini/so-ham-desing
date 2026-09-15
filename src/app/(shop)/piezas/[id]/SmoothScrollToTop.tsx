'use client';

import { useLayoutEffect } from 'react';

interface Props {
    routeKey: string;
}

export function SmoothScrollToTop({ routeKey }: Props) {
    useLayoutEffect(() => {
        // Finish any outgoing smooth scroll before the detail is painted.
        // "auto" would inherit the global smooth scroll behavior.
        const resetScroll = () => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant',
            });
        };
        resetScroll();
        // Reassert after navigation layout effects have run.
        const frame = requestAnimationFrame(resetScroll);

        return () => cancelAnimationFrame(frame);
    }, [routeKey]);

    return null;
}
