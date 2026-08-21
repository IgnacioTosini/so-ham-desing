"use server";

import { unstable_cache, revalidatePath, updateTag } from "next/cache";
import { hasAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { PieceType, SharedDesign, SharedDesignConfiguration } from "@/types";
import type { Prisma } from "@prisma/client";
import { BEAD_COUNT } from "@/utils/bead_count";
import { randomBytes } from "crypto";

const SHARED_DESIGNS_TAG = "shared-designs";
const MAX_SHARED_DESIGN_NAME_LENGTH = 80;

const getAllSharedDesignsCached = unstable_cache(
    async () => {
        return prisma.sharedDesign.findMany({
            orderBy: { createdAt: "desc" },
        });
    },
    ["shared-designs-list"],
    { revalidate: 3600, tags: [SHARED_DESIGNS_TAG] }
);

const revalidateSharedDesignsData = async () => {
    updateTag(SHARED_DESIGNS_TAG);
    revalidatePath("/preview");
    revalidatePath("/disenos");
    revalidatePath("/admin/designs");
};

export async function createSharedDesign(params: {
    type: PieceType;
    beadStones: Record<number, string>;
    name: string;
    configuration?: SharedDesignConfiguration;
}) {
    if (!(params.type in BEAD_COUNT)) {
        throw new Error("Tipo de pieza inválido.");
    }

    const name = params.name.trim();
    if (!name) throw new Error("El nombre del diseño es obligatorio.");
    if (name.length > MAX_SHARED_DESIGN_NAME_LENGTH) {
        throw new Error(`El nombre del diseño no puede superar ${MAX_SHARED_DESIGN_NAME_LENGTH} caracteres.`);
    }

    const total = BEAD_COUNT[params.type];
    const beads = Array.from({ length: total }, (_, i) => params.beadStones[i] ?? null);
    const stoneIds = Array.from(new Set(beads.filter((stoneId): stoneId is string => Boolean(stoneId))));

    if (beads.some((stoneId) => !stoneId)) {
        throw new Error("El diseño debe tener una piedra en cada posición.");
    }

    const existingItemCount = await prisma.catalogItem.count({
        where: {
            id: { in: stoneIds },
            isActive: true,
            category: { role: { in: ["BEAD", "CHARM"] } },
        },
    });

    if (existingItemCount !== stoneIds.length) {
        throw new Error("El diseño contiene componentes inválidos.");
    }

    const configuration: SharedDesignConfiguration = {
        baseItemId: params.configuration?.baseItemId ?? null,
        claspItemId: params.configuration?.claspItemId ?? null,
    };
    const structuralSelections = [
        configuration.baseItemId ? { id: configuration.baseItemId, role: "BASE" as const } : null,
        configuration.claspItemId ? { id: configuration.claspItemId, role: "CLASP" as const } : null,
    ].filter((selection): selection is { id: string; role: "BASE" | "CLASP" } => Boolean(selection));

    if (structuralSelections.length > 0) {
        const structuralItems = await prisma.catalogItem.findMany({
            where: { id: { in: structuralSelections.map((selection) => selection.id) }, isActive: true },
            select: { id: true, category: { select: { role: true } } },
        });
        const structuralItemsById = new Map(structuralItems.map((item) => [item.id, item.category.role]));

        if (structuralSelections.some((selection) => structuralItemsById.get(selection.id) !== selection.role)) {
            throw new Error("La base o el cierre seleccionado no es válido.");
        }
    }

    for (let attempt = 0; attempt < 3; attempt++) {
        const shareCode = randomBytes(5).toString("hex"); // ej: "a3f92c1b"

        try {
            const design = await prisma.sharedDesign.create({
                data: {
                    shareCode,
                    type: params.type,
                    beads,
                    name,
                    configuration: configuration as Prisma.InputJsonValue,
                },
            });

            await revalidateSharedDesignsData();
            return design;
        } catch (error) {
            // P2002 = unique constraint violation (shareCode duplicado, rarísimo)
            if (error instanceof Error && 'code' in error && error.code === "P2002") continue;
            throw error;
        }
    }

    throw new Error("No se pudo generar el diseño.");
}

export async function getAllSharedDesigns(): Promise<SharedDesign[]> {
    const designs = await getAllSharedDesignsCached();

    return designs.map(d => ({
        ...d,
        beads: d.beads as (string | null)[],
        name: d.name || 'Diseño sin nombre',
        configuration: d.configuration && typeof d.configuration === "object" && !Array.isArray(d.configuration)
            ? d.configuration as SharedDesignConfiguration
            : null,
    }));
}

export async function deleteSharedDesign(shareCode: string) {
    const isAdmin = await hasAdminSession();
    if (!isAdmin) {
        throw new Error("No autorizado para eliminar diseños compartidos.");
    }

    await prisma.sharedDesign.delete({
        where: { shareCode },
    });

    await revalidateSharedDesignsData();
}
