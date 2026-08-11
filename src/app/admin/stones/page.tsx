import type { Metadata } from "next";
import { getStones } from "@/actions/stone.action";
import { requireAdminSession } from "@/lib/adminAuth";
import StoneCard from "../../../components/stoneCard/StoneCard";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import "./_adminStonePage.scss";

export const metadata: Metadata = {
    title: "Admin piedras",
    description: "Listado y gestión de piedras en el panel de administración.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminStonesPage() {
    await requireAdminSession();
    const stones = await getStones();

    return (
        <div className="adminStonesPage">
            <div className="adminStonesPageContainer">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">{stones.length} piedras cargadas</span>
                        <h1>Piedras</h1>
                        <p>Gestiona el catálogo de piedras disponible en la tienda y el simulador.</p>
                    </div>
                    <SmoothRouteLink href="/admin/stones/new" className="adminPrimaryAction">Nueva piedra</SmoothRouteLink>
                </div>

                <div className="stoneListContainer">
                    {stones.length === 0 ? (
                        <p>No hay piedras disponibles. Agrega una nueva piedra para comenzar.</p>
                    ) : (
                        stones.map(stone => (
                            <StoneCard key={stone.id} stone={stone} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
