"use server";

import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { hasAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { PieceType, SharedDesign } from "@/types";
import { BEAD_COUNT } from "@/utils/bead_count";
import { randomBytes } from "crypto";

const SHARED_DESIGNS_TAG = "shared-designs";

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
    revalidateTag(SHARED_DESIGNS_TAG, "max");
    revalidatePath("/preview");
};

export async function createSharedDesign(params: {
    type: PieceType;
    beadStones: Record<number, string>;
    name: string;
}) {
    const total = BEAD_COUNT[params.type];
    const beads = Array.from({ length: total }, (_, i) => params.beadStones[i] ?? null);

    for (let attempt = 0; attempt < 3; attempt++) {
        const shareCode = randomBytes(5).toString("hex"); // ej: "a3f92c1b"

        try {
            const design = await prisma.sharedDesign.create({
                data: { shareCode, type: params.type, beads, name: params.name },
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