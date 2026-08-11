'use client';

import { deleteSharedDesign } from "@/actions/design.action";
import { SharedDesign, Stone } from "@/types";
import { getBeadStoneRecord } from "@/utils";
import { NecklaceCircle } from "@/components/ui/simulator/necklaceCircle/NecklaceCircle";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoArrowForward, IoTrashOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import "./_shareDesignItem.scss";

interface Props {
    design: SharedDesign;
    stones: Stone[];
    canDelete?: boolean;
}

export const ShareDesignItem = ({ design, stones, canDelete = false }: Props) => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const beadStones = getBeadStoneRecord(design.beads);
    const assignedCount = Object.keys(beadStones).length;
    const pieceLabel = design.type === 'BRACELET' ? 'Pulsera' : 'Collar';
    const detailHref = `/preview/${design.shareCode}${canDelete ? '?from=admin' : ''}`;
    const formattedDate = new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date(design.createdAt));

    const handleDeleteDesign = async (shareCode: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este diseño? Esta acción no se puede deshacer.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteSharedDesign(shareCode);
            toast.success('Diseño eliminado');
            router.refresh();
        } catch {
            toast.error('No se pudo eliminar el diseño');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <article className={`sharedDesignCard previewListItem ${canDelete ? 'isAdmin' : ''}`}>
            <SmoothRouteLink href={detailHref} className="sharedDesignCardLink" aria-label={`Ver diseño ${design.name}`}>
                <div className="sharedDesignVisual" aria-hidden="true">
                    <NecklaceCircle
                        selectedPiece={design.type}
                        selectedBeadIndex={null}
                        beadStones={beadStones}
                        stones={stones}
                    />
                </div>

                <div className="sharedDesignContent">
                    <div className="sharedDesignMeta">
                        <span className="sharedDesignType">{pieceLabel}</span>
                        <time dateTime={new Date(design.createdAt).toISOString()}>{formattedDate}</time>
                    </div>
                    <h2>{design.name}</h2>
                    <div className="sharedDesignCardFooter">
                        <span>{assignedCount} piedras</span>
                        <span className="sharedDesignView">Ver diseño <IoArrowForward aria-hidden="true" /></span>
                    </div>
                </div>
            </SmoothRouteLink>

            {canDelete && (
                <button
                    type="button"
                    onClick={() => handleDeleteDesign(design.shareCode)}
                    className="previewDeleteButton"
                    aria-label={`Eliminar diseño ${design.name}`}
                    title="Eliminar diseño"
                    disabled={isDeleting}
                >
                    <IoTrashOutline aria-hidden="true" />
                </button>
            )}
        </article>
    )
}
