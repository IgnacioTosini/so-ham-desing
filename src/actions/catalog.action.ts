"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminSession } from "@/lib/adminAuth";
import { deleteProjectImagesFromCloudinary } from "@/lib/services";
import type { CatalogCategoryView } from "@/types";

export type CatalogAttributeTypeInput = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT";
export type CatalogCategoryRoleInput = "BEAD" | "CHARM" | "BASE" | "CLASP";

export interface CategoryAttributeInput {
    id?: string;
    name: string;
    type: CatalogAttributeTypeInput;
    unit?: string | null;
    isRequired?: boolean;
    options?: string[];
}

export interface CategoryInput {
    name: string;
    description?: string | null;
    order?: number;
    isActive?: boolean;
    role?: CatalogCategoryRoleInput;
    attributes?: CategoryAttributeInput[];
}

export interface CatalogItemInput {
    categoryId: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
    attributeValues?: Record<string, string>;
}

const ATTRIBUTE_TYPES = new Set<CatalogAttributeTypeInput>(["TEXT", "NUMBER", "BOOLEAN", "SELECT"]);
const CATEGORY_ROLES = new Set<CatalogCategoryRoleInput>(["BEAD", "CHARM", "BASE", "CLASP"]);
const CATALOG_TAG = "public-catalog";
const MAX_CATEGORY_ATTRIBUTES = 12;
const MAX_OPTIONS = 20;

const slugify = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const revalidateCatalog = () => {
    revalidateTag(CATALOG_TAG, "max");
    revalidatePath("/");
    revalidatePath("/disenos");
    revalidatePath("/admin");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/catalog-items");
    revalidatePath("/piezas/[id]", "page");
};

const cleanOptionalText = (value?: string | null) => value?.trim() || null;

const normalizeAttributes = (attributes: CategoryAttributeInput[] = []) => {
    if (attributes.length > MAX_CATEGORY_ATTRIBUTES) {
        throw new Error(`Cada categoría puede tener hasta ${MAX_CATEGORY_ATTRIBUTES} atributos.`);
    }

    const normalized = attributes.map((attribute, index) => {
        const name = attribute.name.trim();
        const key = slugify(name);
        const type = attribute.type;
        const options = Array.from(
            new Set((attribute.options ?? []).map((option) => option.trim()).filter(Boolean))
        );

        if (!name || !key) throw new Error("Todos los atributos deben tener un nombre.");
        if (name.length > 60) throw new Error("El nombre de un atributo no puede superar 60 caracteres.");
        if (!ATTRIBUTE_TYPES.has(type)) throw new Error(`El tipo del atributo ${name} no es válido.`);
        if (options.length > MAX_OPTIONS) throw new Error(`${name} puede tener hasta ${MAX_OPTIONS} opciones.`);
        if (type === "SELECT" && options.length === 0) {
            throw new Error(`${name} necesita al menos una opción.`);
        }

        return {
            id: attribute.id?.trim() || undefined,
            name,
            key,
            type,
            unit: cleanOptionalText(attribute.unit),
            isRequired: Boolean(attribute.isRequired),
            options: type === "SELECT" ? options : [],
            order: (index + 1) * 10,
        };
    });

    if (new Set(normalized.map((attribute) => attribute.key)).size !== normalized.length) {
        throw new Error("No puede haber dos atributos con el mismo nombre.");
    }

    return normalized;
};

const validateCategoryInput = (input: CategoryInput) => {
    const name = input.name.trim();
    const slug = slugify(name);
    const description = cleanOptionalText(input.description);
    const order = Number.isFinite(Number(input.order)) ? Math.trunc(Number(input.order)) : 0;
    const role = input.role ?? "BEAD";

    if (!name || !slug) throw new Error("El nombre de la categoría es obligatorio.");
    if (name.length > 80) throw new Error("El nombre no puede superar 80 caracteres.");
    if (description && description.length > 300) throw new Error("La descripción no puede superar 300 caracteres.");
    if (!CATEGORY_ROLES.has(role)) throw new Error("La función de la categoría no es válida.");

    return {
        name,
        slug,
        description,
        order,
        isActive: input.isActive ?? true,
        role,
        attributes: normalizeAttributes(input.attributes),
    };
};

export async function getCategories() {
    return prisma.category.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
            attributes: { orderBy: [{ order: "asc" }, { name: "asc" }] },
            _count: { select: { items: true } },
        },
    });
}

const getPublicCatalogCached = unstable_cache(
    async (): Promise<CatalogCategoryView[]> => {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { name: "asc" }],
            include: {
                items: {
                    where: { isActive: true },
                    orderBy: { name: "asc" },
                    include: {
                        attributeValues: {
                            include: { attribute: true },
                            orderBy: { attribute: { order: "asc" } },
                        },
                    },
                },
            },
        });

        return categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            role: category.role,
            items: category.items.map((item) => ({
                id: item.id,
                categoryId: category.id,
                categoryName: category.name,
                categorySlug: category.slug,
                categoryRole: category.role,
                name: item.name,
                description: item.description,
                imageUrl: item.imageUrl,
                attributes: item.attributeValues.map(({ attribute, value }) => ({
                    id: attribute.id,
                    name: attribute.name,
                    key: attribute.key,
                    type: attribute.type,
                    unit: attribute.unit,
                    value,
                })),
            })),
        }));
    },
    ["public-catalog-v1"],
    { revalidate: 3600, tags: [CATALOG_TAG] }
);

export async function getPublicCatalog() {
    return getPublicCatalogCached();
}

export async function getCategoryById(id: string) {
    return prisma.category.findUnique({
        where: { id },
        include: {
            attributes: { orderBy: [{ order: "asc" }, { name: "asc" }] },
            _count: { select: { items: true } },
        },
    });
}

export async function createCategory(input: CategoryInput) {
    await assertAdminSession();
    const data = validateCategoryInput(input);

    try {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                order: data.order,
                isActive: data.isActive,
                role: data.role,
                attributes: {
                    create: data.attributes.map((attribute) => ({
                        name: attribute.name,
                        key: attribute.key,
                        type: attribute.type,
                        unit: attribute.unit,
                        isRequired: attribute.isRequired,
                        options: attribute.options,
                        order: attribute.order,
                    })),
                },
            },
            include: { attributes: true },
        });
        revalidateCatalog();
        return category;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            throw new Error("Ya existe una categoría con ese nombre.");
        }
        throw error;
    }
}

export async function updateCategory(id: string, input: CategoryInput) {
    await assertAdminSession();
    const data = validateCategoryInput(input);

    const category = await prisma.category.findUnique({
        where: { id },
        include: { attributes: { select: { id: true } } },
    });
    if (!category) throw new Error("Categoría no encontrada.");

    const ownedAttributeIds = new Set(category.attributes.map((attribute) => attribute.id));
    const attributesToUpdate = data.attributes.filter(
        (attribute) => attribute.id && ownedAttributeIds.has(attribute.id)
    );
    const keptIds = attributesToUpdate.map((attribute) => attribute.id as string);

    try {
        const updated = await prisma.$transaction(async (tx) => {
            await tx.categoryAttribute.deleteMany({
                where: {
                    categoryId: id,
                    ...(keptIds.length ? { id: { notIn: keptIds } } : {}),
                },
            });

            for (const attribute of attributesToUpdate) {
                await tx.categoryAttribute.update({
                    where: { id: attribute.id },
                    data: {
                        name: attribute.name,
                        key: attribute.key,
                        type: attribute.type,
                        unit: attribute.unit,
                        isRequired: attribute.isRequired,
                        options: attribute.options,
                        order: attribute.order,
                    },
                });
            }

            const newAttributes = data.attributes.filter(
                (attribute) => !attribute.id || !ownedAttributeIds.has(attribute.id)
            );

            if (newAttributes.length > 0) {
                await tx.categoryAttribute.createMany({
                    data: newAttributes.map((attribute) => ({
                        categoryId: id,
                        name: attribute.name,
                        key: attribute.key,
                        type: attribute.type,
                        unit: attribute.unit,
                        isRequired: attribute.isRequired,
                        options: attribute.options,
                        order: attribute.order,
                    })),
                });
            }

            return tx.category.update({
                where: { id },
                data: {
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    order: data.order,
                    isActive: data.isActive,
                    role: data.role,
                },
                include: {
                    attributes: { orderBy: { order: "asc" } },
                    _count: { select: { items: true } },
                },
            });
        });

        revalidateCatalog();
        return updated;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            throw new Error("El nombre de la categoría o de uno de sus atributos ya está en uso.");
        }
        throw error;
    }
}

export async function deleteCategory(id: string) {
    await assertAdminSession();
    const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { items: true } } },
    });

    if (!category) throw new Error("Categoría no encontrada.");
    if (category._count.items > 0) {
        throw new Error(`No se puede eliminar porque contiene ${category._count.items} insumo(s).`);
    }

    await prisma.category.delete({ where: { id } });
    revalidateCatalog();
}

const catalogItemInclude = {
    category: {
        include: { attributes: { orderBy: { order: "asc" as const } } },
    },
    attributeValues: {
        include: { attribute: true },
    },
} as const;

export async function getCatalogItems(categoryId?: string) {
    return prisma.catalogItem.findMany({
        where: categoryId ? { categoryId } : undefined,
        orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
        include: catalogItemInclude,
    });
}

export async function getCatalogItemById(id: string) {
    return prisma.catalogItem.findUnique({ where: { id }, include: catalogItemInclude });
}

const validateCatalogItemInput = async (input: CatalogItemInput) => {
    const categoryId = input.categoryId.trim();
    const name = input.name.trim();
    const description = cleanOptionalText(input.description);
    const imageUrl = cleanOptionalText(input.imageUrl);

    if (!categoryId) throw new Error("La categoría es obligatoria.");
    if (!name) throw new Error("El nombre del insumo es obligatorio.");
    if (name.length > 100) throw new Error("El nombre no puede superar 100 caracteres.");
    if (description && description.length > 500) throw new Error("La descripción no puede superar 500 caracteres.");

    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { attributes: { orderBy: { order: "asc" } } },
    });
    if (!category) throw new Error("La categoría seleccionada no existe.");

    const submittedValues = input.attributeValues ?? {};
    const values = category.attributes.flatMap((attribute) => {
        let value = String(submittedValues[attribute.id] ?? "").trim();

        if (!value) {
            if (attribute.isRequired) throw new Error(`${attribute.name} es obligatorio.`);
            return [];
        }

        if (attribute.type === "NUMBER") {
            const parsed = Number(value.replace(",", "."));
            if (!Number.isFinite(parsed)) throw new Error(`${attribute.name} debe ser numérico.`);
            value = String(parsed);
        }
        if (attribute.type === "BOOLEAN" && value !== "true" && value !== "false") {
            throw new Error(`${attribute.name} debe ser sí o no.`);
        }
        if (attribute.type === "SELECT" && !attribute.options.includes(value)) {
            throw new Error(`La opción elegida para ${attribute.name} no es válida.`);
        }

        return [{ attributeId: attribute.id, value }];
    });

    return {
        category,
        data: {
            categoryId,
            name,
            description,
            imageUrl,
            isActive: input.isActive ?? true,
            values,
        },
    };
};

export async function createCatalogItem(input: CatalogItemInput) {
    await assertAdminSession();
    const { data } = await validateCatalogItemInput(input);

    try {
        const item = await prisma.catalogItem.create({
            data: {
                categoryId: data.categoryId,
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive,
                attributeValues: { create: data.values },
            },
            include: catalogItemInclude,
        });
        revalidateCatalog();
        return item;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            throw new Error("Ya existe un insumo con ese nombre en la categoría.");
        }
        throw error;
    }
}

export async function updateCatalogItem(id: string, input: CatalogItemInput) {
    await assertAdminSession();
    const previousItem = await prisma.catalogItem.findUnique({ where: { id } });
    if (!previousItem) throw new Error("Insumo no encontrado.");

    const { data } = await validateCatalogItemInput(input);
    try {
        const item = await prisma.catalogItem.update({
            where: { id },
            data: {
                categoryId: data.categoryId,
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive,
                attributeValues: {
                    deleteMany: {},
                    create: data.values,
                },
            },
            include: catalogItemInclude,
        });

        if (previousItem.imageUrl && previousItem.imageUrl !== item.imageUrl) {
            await deleteProjectImagesFromCloudinary([previousItem.imageUrl]);
        }
        revalidateCatalog();
        return item;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            throw new Error("Ya existe un insumo con ese nombre en la categoría.");
        }
        throw error;
    }
}

export async function deleteCatalogItem(id: string) {
    await assertAdminSession();
    const item = await prisma.catalogItem.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
    });
    if (!item) throw new Error("Insumo no encontrado.");
    if (item._count.products > 0) {
        throw new Error(`No se puede eliminar porque forma parte de ${item._count.products} producto(s).`);
    }

    await prisma.catalogItem.delete({ where: { id } });
    if (item.imageUrl) await deleteProjectImagesFromCloudinary([item.imageUrl]);
    revalidateCatalog();
}
