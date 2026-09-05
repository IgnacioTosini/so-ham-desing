"use client";

import { useState } from "react";
import Image from "next/image";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { useRouter } from "next/navigation";
import { IoPencilOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoOpenOutline, IoImagesOutline } from "react-icons/io5";
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
        images?: Array<{ image: { url: string } }>;
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
    const photoCount = new Set([product.imageUrl, ...(product.images ?? []).map(({ image }) => image.url)]).size;

    return (
        <article className="productCard">
            <div className="productCardMedia">
            <SmoothRouteLink href={`/piezas/${product.id}`} aria-label={`Ver ${product.name} en la tienda`}>
            <Image
                src={product.imageUrl}
                alt={product.name}
                className="productImage"
                width={480}
                height={600}
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw"
            />
            </SmoothRouteLink>
            <span className="productCardType">{typeLabel}</span>
            <span className="productCardPhotoCount"><IoImagesOutline /> {photoCount} {photoCount === 1 ? "foto" : "fotos"}</span>
            </div>
            <div className="productCardContent">
            <h3 className="productName">{product.name}</h3>
            <p className="productMeta">
                ${product.price.toLocaleString("es-AR")} <span>ARS</span>
            </p>
            {product.description && (
                <p className="productDescription">{product.description}</p>
            )}
            <div className="productActions">
                <SmoothRouteLink href={`/admin/products/${product.id}/edit`} className="productEditIcon" aria-label={`Editar ${product.name}`}>
                    <IoPencilOutline /> Editar
                </SmoothRouteLink>
                <SmoothRouteLink href={`/piezas/${product.id}`} className="productViewIcon" aria-label={`Ver ${product.name} en la tienda`} title="Ver en la tienda"><IoOpenOutline /></SmoothRouteLink>
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
        </article>
    );
}
