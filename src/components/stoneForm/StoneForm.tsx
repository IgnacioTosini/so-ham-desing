"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createStone, updateStone } from "@/actions/stone.action";
import { uploadImageToCloudinary } from "@/lib/services/image-upload.service";
import { useImagePreview } from "@/hooks/useImagePreview";
import Image from "next/image";
import { toast } from "react-toastify";
import "./_stoneForm.scss";

type StoneFormMode = "create" | "edit";

interface StoneFormInitialData {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    energyTags: string[];
}

interface StoneFormProps {
    mode: StoneFormMode;
    initialData?: StoneFormInitialData;
}

export default function StoneForm({ mode, initialData }: StoneFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [energyTagsInput, setEnergyTagsInput] = useState((initialData?.energyTags ?? []).join(", "));
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const imagePreviewHook = useImagePreview({
        initialImageUrl: initialData?.imageUrl,
        onError: setError,
    });

    // Desestructurar completamente para evitar acceso a propiedades anidadas durante render
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
        return mode === "create" ? "Crear piedra" : "Guardar cambios";
    }, [mode]);

    // Wrappers para handlers que acceden a refs de forma segura
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            const energyTags = energyTagsInput
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

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
                name,
                description,
                imageUrl: finalImageUrl,
                energyTags,
            };

            if (mode === "edit") {
                if (!initialData?.id) {
                    throw new Error("No se encontró el ID de la piedra para editar.");
                }

                await updateStone(initialData.id, payload);
                toast.success("Cambios guardados correctamente.");
            } else {
                await createStone(payload);
                toast.success("Piedra creada correctamente.");
            }

            router.replace("/admin/stones");
            return;
        } catch (submitError) {
            const message = submitError instanceof Error
                ? submitError.message
                : "No se pudo guardar la piedra.";
            setError(message);
        } finally {
            setIsUploading(false);
            setIsSaving(false);
        }
    };

    return (
        <form className="stoneForm" onSubmit={handleSubmit}>
            <div className="stoneFormField">
                <label htmlFor="stone-name">Nombre</label>
                <input
                    id="stone-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej: Obsidiana"
                    required
                />
            </div>

            <div className="stoneFormField">
                <label htmlFor="stone-description">Descripcion</label>
                <textarea
                    id="stone-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe energia, sensacion o uso"
                    rows={4}
                    required
                />
            </div>

            <div className="stoneFormField">
                <label htmlFor="stone-image-file">Imagen</label>
                <div
                    className={`stoneDropzone ${isDragActive ? "active" : ""}`}
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
                        id="stone-image-file"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="stoneFileInput"
                        onChange={handleInputFileChangeWrapper}
                    />
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Vista previa de la piedra" className="stoneDropzonePreview" width={250} height={250} />
                    ) : (
                        <p>Arrastra una imagen aqui o haz clic para seleccionarla</p>
                    )}
                    {isUploading ? <p className="stoneDropzoneUploading">Subiendo imagen...</p> : null}
                </div>
                <small>
                    {mode === "edit"
                        ? "Si no cargas una nueva imagen, se mantiene la actual. La nueva se sube al guardar."
                        : "Selecciona una imagen. Se sube a Cloudinary al crear la piedra."}
                </small>
                {imagePreview ? (
                    <button
                        type="button"
                        className="stoneClearImageButton"
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

            <div className="stoneFormField">
                <label htmlFor="stone-tags">Etiquetas de energia</label>
                <input
                    id="stone-tags"
                    type="text"
                    value={energyTagsInput}
                    onChange={(event) => setEnergyTagsInput(event.target.value)}
                    placeholder="calma, proteccion, claridad"
                    required
                />
                <small>Separalas por coma.</small>
            </div>

            {error ? <p className="stoneFormError">{error}</p> : null}

            <div className="stoneFormActions">
                <Link href="/admin/stones" className="stoneFormButton secondary">
                    Cancelar
                </Link>
                <button type="submit" className="stoneFormButton primary" disabled={isSaving || isUploading}>
                    {isUploading ? "Subiendo imagen..." : isSaving ? "Guardando..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
