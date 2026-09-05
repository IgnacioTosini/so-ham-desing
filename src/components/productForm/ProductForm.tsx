"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/product.action";
import { uploadImageToCloudinary } from "@/lib/services/image-upload.service";
import ProductImages, { type ProductPhoto } from "./ProductImages";
import { toast } from "react-toastify";
import "./_productForm.scss";

type ProductFormMode = "create" | "edit";

interface ProductFormInitialData {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string;
    images?: Array<{ image: { url: string; order: number } }>;
    price: number;
    type: string;
    catalogItems?: Array<{ id: string; name: string }>;
}

interface ProductFormCatalogItem {
    id: string;
    name: string;
    categoryId: string;
    categoryName: string;
    isActive: boolean;
}

interface ProductFormProps {
    mode: ProductFormMode;
    initialData?: ProductFormInitialData;
    availableCatalogItems?: ProductFormCatalogItem[];
}

export default function ProductForm({ mode, initialData, availableCatalogItems = [] }: ProductFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [price, setPrice] = useState(initialData?.price ?? 0);
    const [type, setType] = useState(initialData?.type ?? "BRACELET");
    const [selectedCatalogItemIds, setSelectedCatalogItemIds] = useState<Set<string>>(
        new Set(initialData?.catalogItems?.map((item) => item.id) ?? [])
    );
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);

    const [photos, setPhotos] = useState<ProductPhoto[]>(() => {
        const urls = [initialData?.imageUrl, ...(initialData?.images ?? []).slice().sort((a, b) => a.image.order - b.image.order).map(({ image }) => image.url)];
        return Array.from(new Set(urls.filter((url): url is string => Boolean(url)))).map((url, index) => ({ id: `existing-${index}`, url }));
    });

    const submitLabel = useMemo(() => {
        return mode === "create" ? "Crear producto" : "Guardar cambios";
    }, [mode]);

    const catalogGroups = useMemo(() => {
        const groups = new Map<string, { id: string; name: string; items: ProductFormCatalogItem[] }>();

        availableCatalogItems.forEach((item) => {
            const group = groups.get(item.categoryId) ?? {
                id: item.categoryId,
                name: item.categoryName,
                items: [],
            };
            group.items.push(item);
            groups.set(item.categoryId, group);
        });

        return Array.from(groups.values());
    }, [availableCatalogItems]);

    const toggleCatalogItem = (itemId: string) => {
        const newSelection = new Set(selectedCatalogItemIds);
        if (newSelection.has(itemId)) {
            newSelection.delete(itemId);
        } else {
            newSelection.add(itemId);
        }
        setSelectedCatalogItemIds(newSelection);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSaving || isEditingPhoto) return;
        setError(null);
        setIsSaving(true);

        try {
            if (!name.trim()) {
                throw new Error("El nombre es obligatorio");
            }

            if (price <= 0) {
                throw new Error("El precio debe ser mayor a cero");
            }

            if (!photos.length) throw new Error("Agregá al menos una foto del producto.");
            setIsUploading(true);
            const uploadedPhotos: ProductPhoto[] = [];
            for (const photo of photos) {
                const uploaded = photo.file ? { id: photo.id, url: await uploadImageToCloudinary(photo.file) } : photo;
                uploadedPhotos.push(uploaded);
                setPhotos(current => current.map(item => item.id === photo.id ? uploaded : item));
            }
            setIsUploading(false);

            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                price: Number(price),
                imageUrl: uploadedPhotos[0].url,
                images: uploadedPhotos.map((photo, order) => ({ url: photo.url, alt: `${name.trim()} - foto ${order + 1}`, order })),
                type: type as "BRACELET" | "NECKLACE",
                catalogItemIds: Array.from(selectedCatalogItemIds),
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
        <form className="productForm adminEditor" onSubmit={handleSubmit} aria-busy={isSaving}>
            <div className="adminFormLayout">
            <AdminFormSection title="Información del producto" description="Los detalles que van a ver en tu tienda.">
            <div className="productFormField">
                <label htmlFor="product-name">Nombre</label>
                <input
                    id="product-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={80}
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
                    rows={6}
                    maxLength={500}
                    aria-describedby="product-description-count"
                />
                <small id="product-description-count" className="adminFormCounter">{description.length} / 500 caracteres</small>
            </div>

            <div className="adminFormFieldPair">
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

            </div>
            </AdminFormSection>
            <AdminFormSection title="Fotos y portada" description="Mostrá tu pieza desde todos sus ángulos." kind="images">
            <ProductImages photos={photos} onChange={setPhotos} disabled={isSaving} onError={setError} onEditingChange={setIsEditingPhoto} />
            {isEditingPhoto && <p>Aplicá o cancelá el encuadre antes de guardar el producto.</p>}

            </AdminFormSection>

            {catalogGroups.length > 0 && (
                <AdminFormSection title="Composición de la pieza" description="Elegí los materiales que usaste en este diseño." kind="options" wide>
                <div className="productFormField">
                    <small>{selectedCatalogItemIds.size} insumos seleccionados</small>
                    <div className="catalogSelectionGroups">
                        {catalogGroups.map((group) => {
                            const selectedCount = group.items.filter((item) => selectedCatalogItemIds.has(item.id)).length;

                            return (
                                <section key={group.id} className="catalogSelectionGroup">
                                    <div className="catalogSelectionGroupHeader">
                                        <h3>{group.name}</h3>
                                        <span>{selectedCount} de {group.items.length}</span>
                                    </div>
                                    <div className="catalogItemSelectionGrid">
                                        {group.items.map((item) => (
                                            <label
                                                key={item.id}
                                                className={`catalogItemCheckbox ${!item.isActive ? "inactive" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCatalogItemIds.has(item.id)}
                                                    onChange={() => toggleCatalogItem(item.id)}
                                                />
                                                <span>{item.name}</span>
                                                {!item.isActive && <small>Inactivo</small>}
                                            </label>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
                </AdminFormSection>
            )}

            </div>

            {error ? <p className="productFormError" role="alert">{error}</p> : null}

            <div className="productFormActions">
                <span className="adminFormSaveHint">Los cambios se aplican al guardar.</span>
                <SmoothRouteLink href="/admin/products" className="productFormButton secondary">
                    Cancelar
                </SmoothRouteLink>
                <button type="submit" className="productFormButton primary" disabled={isSaving || isUploading || isEditingPhoto}>
                    {isUploading ? "Subiendo fotos..." : isSaving ? "Guardando..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
