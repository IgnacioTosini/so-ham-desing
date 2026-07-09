import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStones } from "@/actions/stone.action";
import { PieceType } from "@/types";
import { PreviewCanvas } from "../previewCanvas/PreviewCanvas";
import Link from "next/link";
import { PreviewByCodeClient } from "./PreviewByCodeClient";
import "./_previewByCodePage.scss";

interface Props {
    params: Promise<{ shareCode: string }>;
}

export const metadata = {
    title: "Vista previa de diseño",
    robots: {
        index: false,
        follow: false,
    },
};

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
            <PreviewByCodeClient>
            <div className="previewByCodePage">
                <Link href="/" className="backLink">← Volver al inicio</Link>
                <PreviewCanvas
                    pieceType={design.type as PieceType}
                    beadStones={beadStones}
                    stones={stones}
                />
            </div>
            </PreviewByCodeClient>
    );
}
