"use server";

import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { AccessoryType } from "@prisma/client";
import { uploadBase64ImageToCloudinary } from "@/lib/services/cloudinary.service";
import { deleteProjectImagesFromCloudinary, uploadImages } from "@/lib/services";
import { assertAdminSession } from "@/lib/adminAuth";

interface CreateProductImageInput {
    url: string;
    alt?: string;
    order?: number;
}

interface CreateProductInput {
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string;
    type: AccessoryType | "pulsera" | "collar" | "bracelet" | "necklace";
    catalogItemIds?: string[];
    images?: CreateProductImageInput[];
}

const MAX_PRODUCT_NAME_LENGTH = 80;
const MAX_PRODUCT_DESCRIPTION_LENGTH = 500;
const MAX_PRODUCT_IMAGES = 6;
const MAX_PRODUCT_CATALOG_ITEMS = 100;
const MAX_PRODUCT_PRICE = 999_999_999;
const PRODUCT_TRANSACTION_OPTIONS = {
    maxWait: 10_000,
    timeout: 20_000,
} as const;

const productInclude = {
    images: {
        include: {
            image: true,
        },
    },
    stones: {
        include: {
            stone: true,
        },
    },
    catalogItems: {
        include: {
            item: {
                include: {
                    category: true,
                    attributeValues: {
                        include: { attribute: true },
                        orderBy: { attribute: { order: "asc" as const } },
                    },
                },
            },
        },
    },
} as const;

const normalizeProductImages = (images: CreateProductImageInput[] = []) =>
    images
        .map((image, index) => ({
            url: image.url.trim(),
            alt: image.alt?.trim() || null,
            order: image.order ?? index,
        }))
        .filter((image) => Boolean(image.url));

const uploadProductImagesIfNeeded = async (images: Array<{ url: string; alt: string | null; order: number }>) => {
    const uploaded = await uploadImages(
        images.map((image, index) => ({
            id: `product-image-${index}`,
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

const normalizeCatalogItemIds = (catalogItemIds: string[] = []) =>
    Array.from(new Set(catalogItemIds.map((id) => id.trim()).filter(Boolean)));

const assertCatalogItemsExist = async (catalogItemIds: string[]) => {
    if (catalogItemIds.length === 0) return;

    const itemCount = await prisma.catalogItem.count({
        where: { id: { in: catalogItemIds } },
    });

    if (itemCount !== catalogItemIds.length) {
        throw new Error("Uno o más insumos seleccionados ya no existen.");
    }
};

const resolveProductType = (type: CreateProductInput["type"]): AccessoryType => {
    if (type === "BRACELET" || type === "NECKLACE") return type;

    const normalized = String(type).trim().toLowerCase();
    if (normalized === "pulsera" || normalized === "bracelet") return "BRACELET";
    if (normalized === "collar" || normalized === "necklace") return "NECKLACE";

    throw new Error("Tipo de accesorio inválido");
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

const createProductWithRetry = async (data: Parameters<typeof prisma.product.create>[0]["data"]) => {
    try {
        return await prisma.product.create({
            data,
            include: productInclude,
        });
    } catch (error) {
        if (!isDatabaseConnectionError(error)) throw error;

        await new Promise((resolve) => setTimeout(resolve, 800));

        return prisma.product.create({
            data,
            include: productInclude,
        });
    }
};

const PRODUCTS_TAG = "products";

const isMainImageUrlReferenced = async (url: string, excludeProductId?: string): Promise<boolean> => {
    if (!url) return false;

    const [productsUsingUrl, stonesUsingUrl, imageRowsUsingUrl] = await Promise.all([
        prisma.product.count({
            where: {
                imageUrl: url,
                ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
            },
        }),
        prisma.stone.count({
            where: { imageUrl: url },
        }),
        prisma.image.count({
            where: { url },
        }),
    ]);

    return productsUsingUrl > 0 || stonesUsingUrl > 0 || imageRowsUsingUrl > 0;
};

const revalidateProductData = async () => {
    revalidateTag(PRODUCTS_TAG, "max");
    revalidatePath("/");
    revalidatePath("/piezas/[id]", "page");
};

const getProductsCached = unstable_cache(
    async () => {
        return prisma.product.findMany({
            include: productInclude,
            orderBy: { createdAt: "desc" },
        });
    },
    ["products-list"],
    { revalidate: 3600, tags: [PRODUCTS_TAG] }
);

export async function getProducts() {
    try {
        return await getProductsCached();
    } catch (error) {
        console.error(error);
        throw new Error("Error al obtener los productos");
    }
}

export async function getProductById(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: productInclude,
        });

        return product;
    } catch (error) {
        console.error(error);
        throw new Error("Error al obtener el producto");
    }
}

export async function createProduct(input: CreateProductInput) {
    await assertAdminSession();

    const name = input.name.trim();
    const description = input.description?.trim() || null;
    const price = Number(input.price);
    const type = resolveProductType(input.type);
    const normalizedImages = normalizeProductImages(input.images);
    const catalogItemIds = normalizeCatalogItemIds(input.catalogItemIds);

    if (!name) throw new Error("El nombre es obligatorio");
    if (!Number.isFinite(price) || price <= 0) throw new Error("El precio debe ser mayor a cero");
    if (name.length > MAX_PRODUCT_NAME_LENGTH) throw new Error(`El nombre no puede superar ${MAX_PRODUCT_NAME_LENGTH} caracteres`);
    if (description && description.length > MAX_PRODUCT_DESCRIPTION_LENGTH) throw new Error(`La descripción no puede superar ${MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres`);
    if (price > MAX_PRODUCT_PRICE) throw new Error("El precio es demasiado alto");
    if (normalizedImages.length > MAX_PRODUCT_IMAGES) throw new Error(`No se pueden cargar más de ${MAX_PRODUCT_IMAGES} imágenes`);
    if (catalogItemIds.length > MAX_PRODUCT_CATALOG_ITEMS) {
        throw new Error(`No se pueden asociar más de ${MAX_PRODUCT_CATALOG_ITEMS} insumos`);
    }

    await assertCatalogItemsExist(catalogItemIds);

    try {
        const uploadedImages = await uploadProductImagesIfNeeded(normalizedImages);
        const imageUrl = await resolveMainImageUrl(input.imageUrl, uploadedImages[0]?.url, `${name}-cover`);

        if (!imageUrl) throw new Error("La imagen es obligatoria");

        const product = await createProductWithRetry({
            name,
            description,
            price: Math.round(price),
            imageUrl,
            type,
            ...(catalogItemIds.length > 0
                ? {
                    catalogItems: {
                        create: catalogItemIds.map((itemId) => ({
                            item: { connect: { id: itemId } },
                        })),
                    },
                }
                : {}),
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

        await revalidateProductData();

        return product;
    } catch (error) {
        console.error(error);
        if (isDatabaseConnectionError(error)) {
            throw new Error("No se pudo conectar a la base de datos. Verifica que PostgreSQL esté encendido.");
        }
        throw new Error("Error al crear el producto");
    }
}

export async function deleteProduct(id: string) {
    await assertAdminSession();

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: productInclude,
        });

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        const previousImageIds = product.images.map((relation) => relation.image.id);

        const orphanImages = await prisma.$transaction(
            async (tx) => {
                await tx.productCatalogItem.deleteMany({ where: { productId: id } });
                await tx.productStone.deleteMany({ where: { productId: id } });
                await tx.productImage.deleteMany({ where: { productId: id } });
                await tx.product.delete({ where: { id } });

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
            },
            PRODUCT_TRANSACTION_OPTIONS
        );

        const cloudinaryUrlsToDelete = new Set(orphanImages.map((image) => image.url));
        const stillReferencedMainImage = await isMainImageUrlReferenced(product.imageUrl, id);
        if (product.imageUrl && !stillReferencedMainImage) {
            cloudinaryUrlsToDelete.add(product.imageUrl);
        }

        if (cloudinaryUrlsToDelete.size > 0) {
            await deleteProjectImagesFromCloudinary(Array.from(cloudinaryUrlsToDelete));
        }

        await revalidateProductData();
    } catch (error) {
        console.error(error);
        throw new Error("Error al eliminar el producto");
    }
}

export async function updateProduct(id: string, input: CreateProductInput) {
    await assertAdminSession();

    const name = input.name.trim();
    const description = input.description?.trim() || null;
    const price = Number(input.price);
    const type = resolveProductType(input.type);
    const hasImagesPayload = Array.isArray(input.images);
    const hasCatalogItemsPayload = Array.isArray(input.catalogItemIds);
    const normalizedImages = normalizeProductImages(input.images);
    const catalogItemIds = normalizeCatalogItemIds(input.catalogItemIds);

    if (!name) throw new Error("El nombre es obligatorio");
    if (!Number.isFinite(price) || price <= 0) throw new Error("El precio debe ser mayor a cero");
    if (name.length > MAX_PRODUCT_NAME_LENGTH) throw new Error(`El nombre no puede superar ${MAX_PRODUCT_NAME_LENGTH} caracteres`);
    if (description && description.length > MAX_PRODUCT_DESCRIPTION_LENGTH) throw new Error(`La descripción no puede superar ${MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres`);
    if (price > MAX_PRODUCT_PRICE) throw new Error("El precio es demasiado alto");
    if (normalizedImages.length > MAX_PRODUCT_IMAGES) throw new Error(`No se pueden cargar más de ${MAX_PRODUCT_IMAGES} imágenes`);
    if (catalogItemIds.length > MAX_PRODUCT_CATALOG_ITEMS) {
        throw new Error(`No se pueden asociar más de ${MAX_PRODUCT_CATALOG_ITEMS} insumos`);
    }

    if (hasCatalogItemsPayload) await assertCatalogItemsExist(catalogItemIds);

    try {
        const previousProduct = await prisma.product.findUnique({
            where: { id },
            include: productInclude,
        });

        if (!previousProduct) {
            throw new Error("Producto no encontrado");
        }

        const uploadedImages = hasImagesPayload
            ? await uploadProductImagesIfNeeded(normalizedImages)
            : normalizedImages;

        const imageUrl = await resolveMainImageUrl(
            input.imageUrl,
            uploadedImages[0]?.url || previousProduct.imageUrl,
            `${name}-cover`
        );

        if (!imageUrl) throw new Error("La imagen es obligatoria");

        const previousImageIds = previousProduct.images.map((relation) => relation.image.id);

        const { product, orphanImages } = await prisma.$transaction(
            async (tx) => {
                const updatedProduct = await tx.product.update({
                    where: { id },
                    data: {
                        name,
                        description,
                        price: Math.round(price),
                        imageUrl,
                        type,
                        ...(hasCatalogItemsPayload
                            ? {
                                catalogItems: {
                                    deleteMany: {},
                                    ...(catalogItemIds.length > 0
                                        ? {
                                            create: catalogItemIds.map((itemId) => ({
                                                item: { connect: { id: itemId } },
                                            })),
                                        }
                                        : {}),
                                },
                            }
                            : {}),
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
                                                        alt: image.alt ?? null,
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
                    include: productInclude,
                });

                if (!hasImagesPayload || previousImageIds.length === 0) {
                    return { product: updatedProduct, orphanImages: [] };
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

                return { product: updatedProduct, orphanImages: orphaned };
            },
            PRODUCT_TRANSACTION_OPTIONS
        );

        if (orphanImages.length > 0) {
            await deleteProjectImagesFromCloudinary(orphanImages.map((image) => image.url));
        }

        if (previousProduct.imageUrl !== product.imageUrl) {
            const stillReferencedMainImage = await isMainImageUrlReferenced(previousProduct.imageUrl, id);
            if (!stillReferencedMainImage) {
                await deleteProjectImagesFromCloudinary([previousProduct.imageUrl]);
            }
        }

        await revalidateProductData();

        return product;
    } catch (error) {
        console.error(error);
        throw new Error("Error al actualizar el producto");
    }
}

