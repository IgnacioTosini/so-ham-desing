"use server";

import { hasAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { PieceType, SharedDesign } from "@/types";
import { BEAD_COUNT } from "@/utils/bead_count";
import { randomBytes } from "crypto";

export async function createSharedDesign(params: {
    type: PieceType;
    beadStones: Record<number, string>;
}) {
    const total = BEAD_COUNT[params.type];
    const beads = Array.from({ length: total }, (_, i) => params.beadStones[i] ?? null);

    for (let attempt = 0; attempt < 3; attempt++) {
        const shareCode = randomBytes(5).toString("hex"); // ej: "a3f92c1b"

        try {
            return await prisma.sharedDesign.create({
                data: { shareCode, type: params.type, beads },
            });
        } catch (error) {
            // P2002 = unique constraint violation (shareCode duplicado, rarísimo)
            if (error instanceof Error && 'code' in error && error.code === "P2002") continue;
            throw error;
        }
    }

    throw new Error("No se pudo generar el diseño.");
}

export async function getAllSharedDesigns(): Promise<SharedDesign[]> {
    const designs = await prisma.sharedDesign.findMany({
        orderBy: { createdAt: "desc" },
    });

    return designs.map(d => ({
        ...d,
        beads: d.beads as (string | null)[],
    }));
}

export async function deleteSharedDesign(shareCode: string) {
    const isAdmin = await hasAdminSession();
    if (!isAdmin) {
        throw new Error("No autorizado para eliminar disenos compartidos.");
    }

    await prisma.sharedDesign.delete({
        where: { shareCode },
    });
}