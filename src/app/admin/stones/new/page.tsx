import type { Metadata } from "next";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { requireAdminSession } from "@/lib/adminAuth";
import StoneForm from "@/components/stoneForm/StoneForm";
import "../_adminStonePage.scss";

export const metadata: Metadata = {
    title: "Nueva piedra",
    description: "Crear una nueva piedra en el panel de administración.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function NewStonePage() {
    await requireAdminSession();

    return (
        <div className="adminStonesPage">
            <div className="adminStonesPageContainer">
                <div className="adminPageHeader">
                    <div>
                        <span className="adminEyebrow">Nueva piedra</span>
                        <h1>Crear piedra</h1>
                        <p>Agrega una piedra al catálogo y al simulador.</p>
                    </div>
                    <SmoothRouteLink href="/admin/stones" className="adminSecondaryAction">Cancelar</SmoothRouteLink>
                </div>
                <StoneForm mode="create" />
            </div>
        </div>
    );
}
