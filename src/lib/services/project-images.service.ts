import "server-only";
import {
    destroyCloudinaryImage,
    extractCloudinaryPublicId,
    uploadBase64ImageToCloudinary,
} from "@/lib/services/cloudinary.service";

export type ProjectImageInput = {
    id: string;
    url: string;
    alt?: string | null;
    order: number;
};

export const deleteProjectImagesFromCloudinary = async (imageUrls: string[]): Promise<void> => {
    const publicIds = imageUrls
        .map(extractCloudinaryPublicId)
        .filter((publicId): publicId is string => Boolean(publicId));

    if (!publicIds.length) return;

    await Promise.all(publicIds.map((publicId) => destroyCloudinaryImage(publicId)));
};

export const uploadImages = async (images: ProjectImageInput[]): Promise<ProjectImageInput[]> => {
    if (!images.length) return images;

    return Promise.all(
        images.map(async (image) => {
            if (!image.url.startsWith("data:image")) return image;
            const uploadedUrl = await uploadBase64ImageToCloudinary(image.url, image.alt ?? `project-image-${image.id}`);
            return { ...image, url: uploadedUrl };
        })
    );
};