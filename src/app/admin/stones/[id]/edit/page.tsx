import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoneById } from "@/actions/stone.action";
import { requireAdminSession } from "@/lib/adminAuth";
import StoneForm from "@/components/stoneForm/StoneForm";
import "../../_adminStonePage.scss";

interface EditStonePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditStonePageProps): Promise<Metadata> {
    const { id } = await params;
    const stone = await getStoneById(id);
    const stoneName = stone?.name?.trim();

    return {
        title: stoneName ? `Editar ${stoneName}` : "Editar piedra",
        description: stoneName
            ? `Editar la piedra ${stoneName} desde el panel de administración.`
            : "Editar una piedra existente desde el panel de administración.",
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function EditStonePage({ params }: EditStonePageProps) {
    await requireAdminSession();
    const { id } = await params;
    const stone = await getStoneById(id);

    if (!stone) {
        notFound();
    }

    return (
        <div className="adminStonesPage">
            <Link href="/admin/stones" className="backLink">← Volver a piedras</Link>
            <div className="adminStonesPageContainer">
                <h1>Admin - Editar piedra</h1>
                <StoneForm
                    mode="edit"
                    initialData={{
                        id: stone.id,
                        name: stone.name,
                        description: stone.description,
                        imageUrl: stone.imageUrl,
                        energyTags: stone.energyTags,
                    }}
                />
            </div>
        </div>
    );
}
