"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useState } from "react";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/product.action";
import { uploadImageToCloudinary } from "@/lib/services/image-upload.service";
import { useImagePreview } from "@/hooks/useImagePreview";
import Image from "next/image";
import { toast } from "react-toastify";
import "./_productForm.scss";

type ProductFormMode = "create" | "edit";

interface ProductFormInitialData {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string;
    price: number;
    type: string;
    stones?: Array<{ id: string; name: string }>;
}

interface ProductFormProps {
    mode: ProductFormMode;
    initialData?: ProductFormInitialData;
    availableStones?: Array<{ id: string; name: string }>;
}

export default function ProductForm({ mode, initialData, availableStones = [] }: ProductFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [price, setPrice] = useState(initialData?.price ?? 0);
    const [type, setType] = useState(initialData?.type ?? "BRACELET");
    const [selectedStoneIds, setSelectedStoneIds] = useState<Set<string>>(
        new Set(initialData?.stones?.map((s) => s.id) ?? [])
    );
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const imagePreviewHook = useImagePreview({
        initialImageUrl: initialData?.imageUrl,
        onError: setError,
    });

    const {
        imageUrl,
        imagePreview,
        selectedImageFile,
        isDragActive,
        fileInputRef,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleInputFileChange,
        clickFileInput,
        clearImage,
        resetToInitial,
    } = imagePreviewHook;

    const submitLabel = useMemo(() => {
        return mode === "create" ? "Crear producto" : "Guardar cambios";
    }, [mode]);

    const handleDragOverWrapper = (event: DragEvent<HTMLDivElement>) => {
        handleDragOver(event);
    };

    const handleDragLeaveWrapper = () => {
        handleDragLeave();
    };

    const handleDropWrapper = (event: DragEvent<HTMLDivElement>) => {
        handleDrop(event);
    };

    const handleInputFileChangeWrapper = (event: ChangeEvent<HTMLInputElement>) => {
        handleInputFileChange(event);
    };

    const toggleStone = (stoneId: string) => {
        const newSelection = new Set(selectedStoneIds);
        if (newSelection.has(stoneId)) {
            newSelection.delete(stoneId);
        } else {
            newSelection.add(stoneId);
        }
        setSelectedStoneIds(newSelection);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            if (!name.trim()) {
                throw new Error("El nombre es obligatorio");
            }

            if (price <= 0) {
                throw new Error("El precio debe ser mayor a cero");
            }

            if (mode === "create" && !imageUrl && !selectedImageFile) {
                throw new Error("La imagen es obligatoria");
            }

            let finalImageUrl = imageUrl;
            if (selectedImageFile) {
                setIsUploading(true);
                finalImageUrl = await uploadImageToCloudinary(selectedImageFile);
                setIsUploading(false);
            }

            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                price: Number(price),
                imageUrl: finalImageUrl,
                type: type as "BRACELET" | "NECKLACE",
                stoneIds: Array.from(selectedStoneIds),
            };

            if (mode === "edit") {
                if (!initialData?.id) {
                    throw new Error("No se encontró el ID del producto para editar.");
                }

                await updateProduct(initialData.id, payload);
                toast.success("Producto actualizado correctamente.");
            } else {
                await createProduct(payload);
                toast.success("Producto creado correctamente.");
            }

            router.replace("/admin/products");
            return;
        } catch (submitError) {
            const message = submitError instanceof Error
                ? submitError.message
                : "No se pudo guardar el producto.";
            setError(message);
        } finally {
            setIsUploading(false);
            setIsSaving(false);
        }
    };

    return (
        <form className="productForm" onSubmit={handleSubmit}>
            <div className="productFormField">
                <label htmlFor="product-name">Nombre</label>
                <input
                    id="product-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej: Pulsera Claridad"
                    required
                />
            </div>

            <div className="productFormField">
                <label htmlFor="product-description">Descripción</label>
                <textarea
                    id="product-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Descripción del producto (opcional)"
                    rows={4}
                />
            </div>

            <div className="productFormField">
                <label htmlFor="product-price">Precio (ARS)</label>
                <input
                    id="product-price"
                    type="number"
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    placeholder="Ej: 13000"
                    min="1"
                    required
                />
            </div>

            <div className="productFormField">
                <label htmlFor="product-type">Tipo de accesorio</label>
                <select
                    id="product-type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    required
                >
                    <option value="BRACELET">Pulsera</option>
                    <option value="NECKLACE">Collar</option>
                </select>
            </div>

            <div className="productFormField">
                <label htmlFor="product-image-file">Imagen</label>
                <div
                    className={`productDropzone ${isDragActive ? "active" : ""}`}
                    onDrop={handleDropWrapper}
                    onDragOver={handleDragOverWrapper}
                    onDragLeave={handleDragLeaveWrapper}
                    onClick={() => clickFileInput()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            clickFileInput();
                        }
                    }}
                >
                    <input
                        id="product-image-file"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="productFileInput"
                        onChange={handleInputFileChangeWrapper}
                    />
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Vista previa del producto" className="productDropzonePreview" width={250} height={250} />
                    ) : (
                        <p>Arrastra una imagen aqui o haz clic para seleccionarla</p>
                    )}
                    {isUploading ? <p className="productDropzoneUploading">Subiendo imagen...</p> : null}
                </div>
                <small>
                    {mode === "edit"
                        ? "Si no cargas una nueva imagen, se mantiene la actual. La nueva se sube al guardar."
                        : "Selecciona una imagen. Se sube a Cloudinary al crear el producto."}
                </small>
                {imagePreview ? (
                    <button
                        type="button"
                        className="productClearImageButton"
                        onClick={() => {
                            if (mode === "edit") {
                                resetToInitial(initialData?.imageUrl ?? "");
                            } else {
                                clearImage();
                            }
                        }}
                    >
                        Quitar imagen
                    </button>
                ) : null}
            </div>

            {availableStones.length > 0 && (
                <div className="productFormField">
                    <label>Piedras incluidas</label>
                    <div className="stoneSelectionGrid">
                        {availableStones.map((stone) => (
                            <label key={stone.id} className="stoneCheckbox">
                                <input
                                    type="checkbox"
                                    checked={selectedStoneIds.has(stone.id)}
                                    onChange={() => toggleStone(stone.id)}
                                />
                                <span>{stone.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {error ? <p className="productFormError">{error}</p> : null}

            <div className="productFormActions">
                <SmoothRouteLink href="/admin/products" className="productFormButton secondary">
                    Cancelar
                </SmoothRouteLink>
                <button type="submit" className="productFormButton primary" disabled={isSaving || isUploading}>
                    {isUploading ? "Subiendo imagen..." : isSaving ? "Guardando..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
