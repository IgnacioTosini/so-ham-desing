"use client";

import Image from "next/image";
import Link from "next/link";
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

    const handleDelete = async () => {
        await deleteStone(stone.id);
        toast.success("Piedra eliminada exitosamente.");
        router.refresh();
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
                <Link href={`/admin/stones/${stone.id}/edit`} className="stoneEditIcon">
                    <IoPencilOutline />
                </Link>
                <button className="stoneDeleteIcon" onClick={handleDelete}>
                    <FaRegTrashAlt />
                </button>
            </div>
        </div>
    );
}
