import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStones } from "@/actions/stone.action";
import { PieceType } from "@/types";
import { PreviewCanvas } from "../previewCanvas/PreviewCanvas";
import Link from "next/link";
import "./_previewByCodePage.scss";

interface Props {
    params: Promise<{ shareCode: string }>;
}

export default async function PreviewByCodePage({ params }: Props) {
    const { shareCode } = await params;

    const design = await prisma.sharedDesign.findUnique({
        where: { shareCode },
    });

    if (!design) notFound();

    const stones = await getStones();
    const beadArray = Array.isArray(design.beads) ? design.beads : [];

    const beadStones: Record<number, string> = {};
    beadArray.forEach((value, index) => {
        if (typeof value === "string" && value) {
            beadStones[index] = value;
        }
    });

    return (
        <>
            <div className="previewByCodePage">
                <Link href="/preview" className="backLink">← Volver a la lista de diseños</Link>
                <PreviewCanvas
                    pieceType={design.type as PieceType}
                    beadStones={beadStones}
                    stones={stones}
                />
            </div>
        </>
    );
}