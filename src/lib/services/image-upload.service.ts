export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", { method: "POST", body: formData });

    if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Error al subir la imagen");
    }

    const { url } = (await response.json()) as { url: string };
    return url;
};
