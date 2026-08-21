'use client';

import { useState } from 'react';
import { IoCheckmark, IoShareSocialOutline } from 'react-icons/io5';

interface Props {
    designName: string;
}

export function PreviewShareButton({ designName }: Props) {
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');

    const handleShare = async () => {
        // Never expose the admin-only navigation hint in a public link.
        const shareUrl = `${window.location.origin}${window.location.pathname}`;
        const shareData = {
            title: `${designName} | So Ham Design`,
            text: `Mirá el diseño ${designName} de So Ham Design.`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                // Closing the native share sheet is intentional. For any other
                // failure, continue with the clipboard fallback.
                if (error instanceof Error && error.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setShareStatus('copied');
        } catch {
            setShareStatus('error');
        }

        window.setTimeout(() => setShareStatus('idle'), 2200);
    };

    const buttonLabel = shareStatus === 'copied'
        ? 'Enlace copiado'
        : shareStatus === 'error'
            ? 'No se pudo compartir'
            : 'Compartir diseño';

    return (
        <button type="button" className="previewShareButton" onClick={handleShare} aria-live="polite">
            {shareStatus === 'copied' ? <IoCheckmark aria-hidden="true" /> : <IoShareSocialOutline aria-hidden="true" />}
            {buttonLabel}
        </button>
    );
}
