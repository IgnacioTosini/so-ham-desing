import { getStoneById, deleteStone, updateStone } from "@/actions/stone.action";
import { hasAdminSession } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

interface StoneImagePayload {
    url: string;
    alt?: string | null;
    order?: number;
}

interface StoneImageRelationPayload {
    image?: StoneImagePayload;
}

type StonePutImageInput = StoneImagePayload | StoneImageRelationPayload;

interface StonePutBody {
    name?: string;
    description?: string;
    imageUrl?: string;
    energyTags?: string[];
    images?: StonePutImageInput[];
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const stone = await getStoneById(id);

        if (!stone) {
            return NextResponse.json({ error: "Piedra no encontrada" }, { status: 404 });
        }

        return NextResponse.json(stone, { status: 200 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error al obtener la piedra";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await hasAdminSession();
        if (!isAdmin) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "ID de la piedra no proporcionado" }, { status: 400 });
        }

        await deleteStone(id);
        return NextResponse.json({ message: "Piedra eliminada correctamente" }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error al eliminar la piedra";
        const status = message === "No autorizado" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await hasAdminSession();
        if (!isAdmin) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "ID de la piedra no proporcionado" }, { status: 400 });
        }
        const body = (await request.json()) as StonePutBody;

        const normalizedImages = body.images
            ? body.images
                .map((img) => {
                    if ("url" in img && img.url) {
                        return { url: img.url, alt: img.alt, order: img.order };
                    }

                    if ("image" in img && img.image?.url) {
                        return {
                            url: img.image.url,
                            alt: img.image.alt,
                            order: img.image.order,
                        };
                    }

                    return null;
                })
                .filter(Boolean) as Array<{ url: string; alt?: string; order?: number }>
            : undefined;

        const stone = await updateStone(id, {
            name: body.name ?? "",
            description: body.description ?? "",
            imageUrl: body.imageUrl,
            energyTags: body.energyTags ?? [],
            images: normalizedImages,
        });

        return NextResponse.json(stone, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error al actualizar la piedra";
        const status =
            message === "No autorizado"
                ? 401
                : message.includes("obligatorio") || message.includes("obligatoria") ? 400 : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
