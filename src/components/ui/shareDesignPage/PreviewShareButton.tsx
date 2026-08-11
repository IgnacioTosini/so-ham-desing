'use client';

import { useState } from 'react';
import { IoCheckmark, IoShareSocialOutline } from 'react-icons/io5';

interface Props {
    designName: string;
}

export function PreviewShareButton({ designName }: Props) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: `${designName} | So Ham Design`,
            text: `Mirá el diseño ${designName} de So Ham Design.`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch {
                return;
            }
        }

        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <button type="button" className="previewShareButton" onClick={handleShare}>
            {copied ? <IoCheckmark aria-hidden="true" /> : <IoShareSocialOutline aria-hidden="true" />}
            {copied ? 'Enlace copiado' : 'Compartir diseño'}
        </button>
    );
}
