import type { Metadata } from "next";
import { getStones } from "@/actions/stone.action";
import { requireAdminSession } from "@/lib/adminAuth";
import StoneCard from "../../../components/stoneCard/StoneCard";
import Link from "next/link";
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
            <Link href="/admin" className="backLink">← Volver al panel de administración</Link>
            <div className="adminStonesPageContainer">
                <h1>Admin - Gestión de piedras</h1>

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