'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnchorHTMLAttributes, MouseEvent, ReactNode, useState } from 'react';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string;
    children: ReactNode;
}

export function SmoothRouteLink({ href, className, children, onClick, ...anchorProps }: Props) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        event.preventDefault();
        if (isNavigating) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion || window.scrollY <= 4) {
            window.scrollTo({ top: 0, left: 0 });
            router.push(href, { scroll: false });
            return;
        }

        setIsNavigating(true);

        let fallbackTimer = 0;
        const navigate = () => {
            window.removeEventListener('scrollend', navigate);
            window.clearTimeout(fallbackTimer);
            router.push(href, { scroll: false });
        };

        window.addEventListener('scrollend', navigate, { once: true });
        fallbackTimer = window.setTimeout(navigate, 900);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    return (
        <Link
            href={href}
            className={className}
            scroll={false}
            onClick={handleClick}
            aria-busy={isNavigating}
            {...anchorProps}
        >
            {children}
        </Link>
    );
}
