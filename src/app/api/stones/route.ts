import { NextResponse } from "next/server";
import { createStone, getStones } from "@/actions/stone.action";
import { hasAdminSession } from "@/lib/adminAuth";

export async function GET() {
    try {
        const stones = await getStones();
        return NextResponse.json(stones, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error al obtener las piedras";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const isAdmin = await hasAdminSession();
        if (!isAdmin) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = (await request.json()) as {
            name?: string;
            description?: string;
            imageUrl?: string;
            energyTags?: string[];
            images?: Array<{ url: string; alt?: string; order?: number }>;
        };

        const stone = await createStone({
            name: body.name ?? "",
            description: body.description ?? "",
            imageUrl: body.imageUrl,
            energyTags: body.energyTags ?? [],
            images: body.images ?? [],
        });

        return NextResponse.json(stone, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error al crear la piedra";
        const status =
            message === "No autorizado"
                ? 401
                : message.includes("obligatorio") || message.includes("obligatoria") ? 400 : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
