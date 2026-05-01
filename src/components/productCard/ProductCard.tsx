"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoPencilOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { deleteProduct } from "@/actions/product.action";
import { toast } from "react-toastify";
import "./_productCard.scss";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string;
        type: string;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const router = useRouter();

    const handleDelete = async () => {
        await deleteProduct(product.id);
        toast.success("Producto eliminado exitosamente.");
        router.refresh();
    };

    const typeLabel = product.type === "BRACELET" ? "Pulsera" : "Collar";

    return (
        <div className="productCard">
            <Image
                src={product.imageUrl}
                alt={product.name}
                className="productImage"
                width={200}
                height={200}
            />
            <h3 className="productName">{product.name}</h3>
            <p className="productMeta">
                {typeLabel} • ${product.price.toLocaleString()}
            </p>
            {product.description && (
                <p className="productDescription">{product.description}</p>
            )}
            <div className="productActions">
                <Link href={`/admin/products/${product.id}/edit`} className="productEditIcon">
                    <IoPencilOutline />
                </Link>
                <button className="productDeleteIcon" onClick={handleDelete}>
                    <FaRegTrashAlt />
                </button>
            </div>
        </div>
    );
}
