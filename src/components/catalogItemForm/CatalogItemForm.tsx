"use client";

import Image from "next/image";
import { DragEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createCatalogItem, updateCatalogItem, type CatalogAttributeTypeInput } from "@/actions/catalog.action";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { useImagePreview } from "@/hooks/useImagePreview";
import { uploadImageToCloudinary } from "@/lib/services/image-upload.service";
import "../catalogAdmin/_catalogAdmin.scss";

interface CatalogCategoryOption {
    id: string;
    name: string;
    isActive: boolean;
    attributes: Array<{
        id: string;
        name: string;
        type: CatalogAttributeTypeInput;
        unit: string | null;
        isRequired: boolean;
        options: string[];
    }>;
}

interface CatalogItemInitialData {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    attributeValues: Array<{ attributeId: string; value: string }>;
}

interface CatalogItemFormProps {
    mode: "create" | "edit";
    categories: CatalogCategoryOption[];
    initialCategoryId?: string;
    initialData?: CatalogItemInitialData;
}

export default function CatalogItemForm({ mode, categories, initialCategoryId, initialData }: CatalogItemFormProps) {
    const router = useRouter();
    const firstCategoryId = initialData?.categoryId ?? initialCategoryId ?? categories[0]?.id ?? "";
    const [categoryId, setCategoryId] = useState(firstCategoryId);
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>(
        Object.fromEntries(initialData?.attributeValues.map((value) => [value.attributeId, value.value]) ?? [])
    );
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const selectedCategory = useMemo(
        () => categories.find((category) => category.id === categoryId),
        [categories, categoryId]
    );

    const {
        imageUrl,
        imagePreview,
        selectedImageFile,
        isDragActive,
        fileInputRef,
        handleInputFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        clickFileInput,
        clearImage,
    } = useImagePreview({ initialImageUrl: initialData?.imageUrl ?? "", onError: setError });

    const handleDropWrapper = (event: DragEvent<HTMLDivElement>) => {
        event.stopPropagation();
        handleDrop(event);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            let finalImageUrl = imageUrl;
            if (selectedImageFile) {
                setIsUploading(true);
                finalImageUrl = await uploadImageToCloudinary(selectedImageFile);
            }

            const payload = {
                categoryId,
                name,
                description,
                imageUrl: finalImageUrl || null,
                isActive,
                attributeValues,
            };

            if (mode === "edit") {
                if (!initialData?.id) throw new Error("Falta el ID del insumo.");
                await updateCatalogItem(initialData.id, payload);
                toast.success("Insumo actualizado.");
            } else {
                await createCatalogItem(payload);
                toast.success("Insumo creado.");
            }

            router.replace("/admin/catalog-items");
            router.refresh();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "No se pudo guardar el insumo.");
        } finally {
            setIsUploading(false);
            setIsSaving(false);
        }
    };

    if (categories.length === 0) {
        return (
            <div className="catalogEmptyPanel">
                <p>Primero necesitas crear al menos una categoría.</p>
                <SmoothRouteLink href="/admin/categories/new" className="adminPrimaryAction">Crear categoría</SmoothRouteLink>
            </div>
        );
    }

    return (
        <form className="catalogForm" onSubmit={handleSubmit}>
            <div className="catalogFormGrid twoColumns">
                <div className="catalogFormField">
                    <label htmlFor="item-category">Categoría</label>
                    <select
                        id="item-category"
                        value={categoryId}
                        onChange={(event) => {
                            setCategoryId(event.target.value);
                            setAttributeValues({});
                        }}
                        required
                    >
                        {categories.map((category) => (
                            <option value={category.id} key={category.id}>
                                {category.name}{category.isActive ? "" : " (inactiva)"}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="catalogFormField">
                    <label htmlFor="item-name">Nombre</label>
                    <input id="item-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Cuarzo rosa 6 mm" required />
                </div>
            </div>

            <div className="catalogFormField">
                <label htmlFor="item-description">Descripción</label>
                <textarea id="item-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Detalle breve del insumo" />
            </div>

            <div className="catalogFormField">
                <label htmlFor="item-image">Imagen</label>
                <div
                    className={`catalogDropzone ${isDragActive ? "active" : ""}`}
                    onDrop={handleDropWrapper}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={clickFileInput}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            clickFileInput();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <input id="item-image" ref={fileInputRef} type="file" accept="image/*" onChange={handleInputFileChange} />
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Vista previa del insumo" width={320} height={240} />
                    ) : (
                        <p>Arrastra una imagen o haz clic para elegirla (opcional).</p>
                    )}
                </div>
                {imagePreview ? (
                    <button
                        type="button"
                        className="catalogSmallButton muted"
                        onClick={clearImage}
                    >
                        Quitar imagen
                    </button>
                ) : null}
            </div>

            {selectedCategory?.attributes.length ? (
                <section className="dynamicAttributes">
                    <div>
                        <h2>Atributos de {selectedCategory.name}</h2>
                        <p>Los campos cambian según la categoría elegida.</p>
                    </div>
                    <div className="catalogFormGrid twoColumns">
                        {selectedCategory.attributes.map((attribute) => (
                            <div className="catalogFormField" key={attribute.id}>
                                <label htmlFor={`item-attribute-${attribute.id}`}>
                                    {attribute.name}{attribute.unit ? ` (${attribute.unit})` : ""}{attribute.isRequired ? " *" : ""}
                                </label>
                                {attribute.type === "SELECT" ? (
                                    <select
                                        id={`item-attribute-${attribute.id}`}
                                        value={attributeValues[attribute.id] ?? ""}
                                        onChange={(event) => setAttributeValues((current) => ({ ...current, [attribute.id]: event.target.value }))}
                                        required={attribute.isRequired}
                                    >
                                        <option value="">Seleccionar</option>
                                        {attribute.options.map((option) => <option value={option} key={option}>{option}</option>)}
                                    </select>
                                ) : attribute.type === "BOOLEAN" ? (
                                    <select
                                        id={`item-attribute-${attribute.id}`}
                                        value={attributeValues[attribute.id] ?? ""}
                                        onChange={(event) => setAttributeValues((current) => ({ ...current, [attribute.id]: event.target.value }))}
                                        required={attribute.isRequired}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="true">Sí</option>
                                        <option value="false">No</option>
                                    </select>
                                ) : (
                                    <input
                                        id={`item-attribute-${attribute.id}`}
                                        type={attribute.type === "NUMBER" ? "number" : "text"}
                                        step={attribute.type === "NUMBER" ? "any" : undefined}
                                        value={attributeValues[attribute.id] ?? ""}
                                        onChange={(event) => setAttributeValues((current) => ({ ...current, [attribute.id]: event.target.value }))}
                                        required={attribute.isRequired}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            <label className="catalogToggle">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                <span>Disponible para usar en el simulador</span>
            </label>

            {error ? <p className="catalogFormError">{error}</p> : null}

            <div className="catalogFormActions">
                <SmoothRouteLink href="/admin/catalog-items" className="catalogButton secondary">Cancelar</SmoothRouteLink>
                <button type="submit" className="catalogButton primary" disabled={isSaving || isUploading}>
                    {isUploading ? "Subiendo imagen..." : isSaving ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear insumo"}
                </button>
            </div>
        </form>
    );
}
