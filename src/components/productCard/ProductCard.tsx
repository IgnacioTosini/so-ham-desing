"use client";

import { useState } from "react";
import Image from "next/image";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
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
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;
        if (!confirm(`¿Eliminar el producto "${product.name}"?`)) return;

        setIsDeleting(true);
        try {
            await deleteProduct(product.id);
            toast.success("Producto eliminado exitosamente.");
            router.refresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo eliminar el producto.";
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
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
                <SmoothRouteLink href={`/admin/products/${product.id}/edit`} className="productEditIcon">
                    <IoPencilOutline />
                </SmoothRouteLink>
                <button
                    type="button"
                    className="productDeleteIcon"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    aria-label={isDeleting ? `Eliminando ${product.name}` : `Eliminar ${product.name}`}
                >
                    <FaRegTrashAlt />
                </button>
            </div>
        </div>
    );
}
