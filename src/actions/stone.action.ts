"use server";

import { prisma } from "@/lib/prisma";
import { uploadBase64ImageToCloudinary } from "@/lib/services/cloudinary.service";
import { deleteProjectImagesFromCloudinary, uploadImages } from "@/lib/services";

interface CreateStoneImageInput {
    url: string;
    alt?: string;
    order?: number;
}

interface CreateStoneInput {
    name: string;
    description: string;
    imageUrl?: string;
    energyTags: string[];
    images?: CreateStoneImageInput[];
}

const normalizeStoneImages = (images: CreateStoneImageInput[] = []) =>
    images
        .map((image, index) => ({
            url: image.url.trim(),
            alt: image.alt?.trim() || null,
            order: image.order ?? index,
        }))
        .filter((image) => Boolean(image.url));

const uploadStoneImagesIfNeeded = async (images: Array<{ url: string; alt: string | null; order: number }>) => {
    const uploaded = await uploadImages(
        images.map((image, index) => ({
            id: `stone-image-${index}`,
            url: image.url,
            alt: image.alt,
            order: image.order,
        }))
    );

    return uploaded.map((image) => ({
        url: image.url,
        alt: image.alt,
        order: image.order,
    }));
};

const resolveMainImageUrl = async (imageUrl: string | undefined, fallbackUrl: string | undefined, fileName: string) => {
    const trimmedImageUrl = imageUrl?.trim() || "";

    if (trimmedImageUrl.startsWith("data:image")) {
        return uploadBase64ImageToCloudinary(trimmedImageUrl, fileName);
    }

    return trimmedImageUrl || fallbackUrl || "";
};

const isDatabaseConnectionError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;

    return (
        error.message.includes("Can't reach database server") ||
        error.message.includes("P1001") ||
        error.name === "PrismaClientInitializationError"
    );
};

const createStoneWithRetry = async (
    data: {
        name: string;
        description: string;
        imageUrl: string;
        energyTags: string[];
        images?: {
            create: Array<{
                image: {
                    create: {
                        url: string;
                        alt: string | null;
                        order: number;
                    };
                };
            }>;
        };
    }
) => {
    try {
        return await prisma.stone.create({
            data,
            include: {
                images: {
                    include: {
                        image: true,
                    },
                },
            },
        });
    } catch (error) {
        if (!isDatabaseConnectionError(error)) throw error;

        // Reintento corto para cuando Postgres acaba de reiniciar y aún no acepta conexiones.
        await new Promise((resolve) => setTimeout(resolve, 800));

        return prisma.stone.create({
            data,
            include: {
                images: {
                    include: {
                        image: true,
                    },
                },
            },
        });
    }
};

export async function getStones() {
    try {
        const stones = await prisma.stone.findMany({
            orderBy: { name: "asc" },
            include: {
                images: {
                    include: {
                        image: true,
                    },
                },
            },
        });

        return stones;
    } catch (error) {
        console.error(error);
        throw new Error("Error al obtener las piedras");
    }
}

export async function createStone(input: CreateStoneInput) {
    const name = input.name.trim();
    const description = input.description.trim();
    const normalizedImages = normalizeStoneImages(input.images);
    const energyTags = (input.energyTags ?? [])
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

    if (!name) throw new Error("El nombre es obligatorio");
    if (!description) throw new Error("La descripción es obligatoria");
    if (energyTags.length === 0) throw new Error("Al menos una etiqueta de energía es obligatoria");

    try {
        const uploadedImages = await uploadStoneImagesIfNeeded(normalizedImages);
        const imageUrl = await resolveMainImageUrl(input.imageUrl, uploadedImages[0]?.url, `${name}-cover`);

        if (!imageUrl) throw new Error("La imagen es obligatoria");

        const stone = await createStoneWithRetry({
            name,
            description,
            imageUrl,
            energyTags,
            ...(uploadedImages.length > 0
                ? {
                    images: {
                        create: uploadedImages.map((image) => ({
                            image: {
                                create: {
                                    url: image.url,
                                    alt: image.alt ?? null,
                                    order: image.order,
                                },
                            },
                        })),
                    },
                }
                : {}),
        });

        return stone;
    } catch (error) {
        console.error(error);
        if (isDatabaseConnectionError(error)) {
            throw new Error("No se pudo conectar a la base de datos. Verifica que PostgreSQL esté encendido.");
        }
        throw new Error("Error al crear la piedra");
    }
}

export async function getStoneById(id: string) {
    try {
        const stone = await prisma.stone.findUnique({
            where: { id },
            include: {
                images: {
                    include: {
                        image: true,
                    },
                },
            },
        });
        return stone;
    } catch (error) {
        console.error(error);
        throw new Error("Error al obtener la piedra");
    }
}

export async function deleteStone(id: string) {
    try {
        const stone = await prisma.stone.findUnique({
            where: { id },
            include: {
                images: {
                    include: {
                        image: true,
                    },
                },
            },
        });

        if (!stone) {
            throw new Error("Piedra no encontrada");
        }

        const previousImageIds = stone.images.map((relation) => relation.image.id);

        const orphanImages = await prisma.$transaction(async (tx) => {
            await tx.stoneImage.deleteMany({
                where: { stoneId: id },
            });

            await tx.stone.delete({
                where: { id },
            });

            if (previousImageIds.length === 0) return [];

            const orphaned = await tx.image.findMany({
                where: {
                    id: { in: previousImageIds },
                    stones: { none: {} },
                    products: { none: {} },
                },
            });

            if (orphaned.length > 0) {
                await tx.image.deleteMany({
                    where: {
                        id: { in: orphaned.map((image) => image.id) },
                    },
                });
            }

            return orphaned;
        });

        const cloudinaryUrlsToDelete = new Set(orphanImages.map((image) => image.url));
        if (stone.imageUrl) {
            cloudinaryUrlsToDelete.add(stone.imageUrl);
        }

        if (cloudinaryUrlsToDelete.size > 0) {
            await deleteProjectImagesFromCloudinary(Array.from(cloudinaryUrlsToDelete));
        }
    } catch (error) {
        console.error(error);
        throw new Error("Error al eliminar la piedra");
    }
}

export async function updateStone(id: string, input: CreateStoneInput) {
    const name = input.name.trim();
    const description = input.description.trim();
    const hasImagesPayload = Array.isArray(input.images);
    const normalizedImages = normalizeStoneImages(input.images);
    const energyTags = (input.energyTags ?? [])
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

    if (!name) throw new Error("El nombre es obligatorio");
    if (!description) throw new Error("La descripción es obligatoria");
    if (energyTags.length === 0) throw new Error("Al menos una etiqueta de energía es obligatoria");

    try {
        const previousStone = await prisma.stone.findUnique({
            where: { id },
            include: {
                images: {
                    include: {
                        image: true,
                    },
                },
            },
        });

        if (!previousStone) {
            throw new Error("Piedra no encontrada");
        }

        const uploadedImages = hasImagesPayload
            ? await uploadStoneImagesIfNeeded(normalizedImages)
            : normalizedImages;

        const imageUrl = await resolveMainImageUrl(
            input.imageUrl,
            uploadedImages[0]?.url || previousStone.imageUrl,
            `${name}-cover`
        );

        if (!imageUrl) throw new Error("La imagen es obligatoria");

        const previousImageIds = previousStone.images.map((relation) => relation.image.id);

        const { stone, orphanImages } = await prisma.$transaction(async (tx) => {
            const updatedStone = await tx.stone.update({
                where: { id },
                data: {
                    name,
                    description,
                    imageUrl,
                    energyTags,
                    ...(hasImagesPayload
                        ? {
                            images: {
                                deleteMany: {},
                                ...(uploadedImages.length > 0
                                    ? {
                                        create: uploadedImages.map((image) => ({
                                            image: {
                                                create: {
                                                    url: image.url,
                                                    alt: image.alt,
                                                    order: image.order,
                                                },
                                            },
                                        })),
                                    }
                                    : {}),
                            },
                        }
                        : {}),
                },
                include: {
                    images: {
                        include: {
                            image: true,
                        },
                    },
                },
            });

            if (!hasImagesPayload || previousImageIds.length === 0) {
                return { stone: updatedStone, orphanImages: [] };
            }

            const orphaned = await tx.image.findMany({
                where: {
                    id: { in: previousImageIds },
                    stones: { none: {} },
                    products: { none: {} },
                },
            });

            if (orphaned.length > 0) {
                await tx.image.deleteMany({
                    where: {
                        id: { in: orphaned.map((image) => image.id) },
                    },
                });
            }

            return { stone: updatedStone, orphanImages: orphaned };
        });

        if (orphanImages.length > 0) {
            await deleteProjectImagesFromCloudinary(orphanImages.map((image) => image.url));
        }

        if (previousStone.imageUrl !== stone.imageUrl) {
            await deleteProjectImagesFromCloudinary([previousStone.imageUrl]);
        }

        return stone;
    } catch (error) {
        console.error(error);
        throw new Error("Error al actualizar la piedra");
    }
}
