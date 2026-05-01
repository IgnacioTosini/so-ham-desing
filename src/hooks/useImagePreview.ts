"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

interface UseImagePreviewProps {
    initialImageUrl?: string;
    onError?: (message: string) => void;
}

interface UseImagePreviewReturn {
    imageUrl: string;
    imagePreview: string;
    selectedImageFile: File | null;
    isDragActive: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileSelection: (files: FileList | null) => void;
    handleInputFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleDrop: (event: DragEvent<HTMLDivElement>) => void;
    handleDragOver: (event: DragEvent<HTMLDivElement>) => void;
    handleDragLeave: () => void;
    clickFileInput: () => void;
    clearImage: () => void;
    resetToInitial: (url: string) => void;
}

export const useImagePreview = ({ initialImageUrl = "", onError }: UseImagePreviewProps): UseImagePreviewReturn => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const localPreviewUrlRef = useRef<string | null>(null);
    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [imagePreview, setImagePreview] = useState(initialImageUrl);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleFileSelection = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        if (!file.type.startsWith("image/")) {
            onError?.("Solo se permiten archivos de imagen.");
            return;
        }

        if (localPreviewUrlRef.current) {
            URL.revokeObjectURL(localPreviewUrlRef.current);
        }

        const localPreview = URL.createObjectURL(file);
        localPreviewUrlRef.current = localPreview;
        setSelectedImageFile(file);
        setImagePreview(localPreview);
    };

    const handleInputFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        handleFileSelection(event.target.files);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
        handleFileSelection(event.dataTransfer.files);
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = () => {
        setIsDragActive(false);
    };

    const clickFileInput = () => {
        fileInputRef.current?.click();
    };

    const clearImage = () => {
        if (localPreviewUrlRef.current) {
            URL.revokeObjectURL(localPreviewUrlRef.current);
            localPreviewUrlRef.current = null;
        }

        setSelectedImageFile(null);
        setImageUrl("");
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const resetToInitial = (url: string) => {
        if (localPreviewUrlRef.current) {
            URL.revokeObjectURL(localPreviewUrlRef.current);
            localPreviewUrlRef.current = null;
        }

        setSelectedImageFile(null);
        setImageUrl(url);
        setImagePreview(url);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return {
        imageUrl,
        imagePreview,
        selectedImageFile,
        isDragActive,
        fileInputRef,
        handleFileSelection,
        handleInputFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        clickFileInput,
        clearImage,
        resetToInitial,
    };
};
