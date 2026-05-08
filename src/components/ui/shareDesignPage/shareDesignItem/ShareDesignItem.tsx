'use client';

import { deleteSharedDesign } from "@/actions/design.action";
import { SharedDesign } from "@/types";
import Link from "next/link";
import "./_shareDesignItem.scss";

interface Props {
    design: SharedDesign;
    canDelete: boolean;
}

export const ShareDesignItem = ({ design, canDelete }: Props) => {
    const handleDeleteDesign = async (shareCode: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este diseño? Esta acción no se puede deshacer.")) {
            return;
        }
        await deleteSharedDesign(shareCode);
        window.location.reload();
    };
    return (
        <Link key={design.id} href={`/preview/${design.shareCode}`} className="previewListItem">
            <span className="previewPiece">{design.type === 'BRACELET' ? 'Pulsera' : 'Collar'}</span>
            <span className="previewDate">{new Date(design.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
            {canDelete && (
                <button
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleDeleteDesign(design.shareCode);
                    }}
                    className="previewDeleteButton"
                >
                    Eliminar
                </button>
            )}
        </Link>
    )
}
