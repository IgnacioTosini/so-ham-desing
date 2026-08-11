"use client";

import { useState } from "react";
import Image from "next/image";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { useRouter } from "next/navigation";
import { IoPencilOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { deleteStone } from "@/actions/stone.action";
import { Stone } from "@/types/stone";
import { toast } from "react-toastify";
import "./_stoneCard.scss";

interface StoneCardProps {
    stone: Stone;
}

export default function StoneCard({ stone }: StoneCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;
        if (!confirm(`¿Eliminar la piedra "${stone.name}"?`)) return;

        setIsDeleting(true);
        try {
            await deleteStone(stone.id);
            toast.success("Piedra eliminada exitosamente.");
            router.refresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo eliminar la piedra.";
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="stoneCard">
            <Image
                src={stone.imageUrl}
                alt={stone.name}
                className="stoneImage"
                width={200}
                height={200}
            />
            <h3 className="stoneName">{stone.name}</h3>
            <p className="stoneDescription">{stone.description}</p>
            <div className="stoneActions">
                <SmoothRouteLink href={`/admin/stones/${stone.id}/edit`} className="stoneEditIcon">
                    <IoPencilOutline />
                </SmoothRouteLink>
                <button
                    type="button"
                    className="stoneDeleteIcon"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    aria-label={isDeleting ? `Eliminando ${stone.name}` : `Eliminar ${stone.name}`}
                >
                    <FaRegTrashAlt />
                </button>
            </div>
        </div>
    );
}
