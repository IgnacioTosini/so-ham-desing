import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/adminAuth";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import "./_admin.scss";

export const metadata: Metadata = {
    title: "Panel de administración",
    description: "Panel de administración de So Ham Design para gestionar categorías, insumos y productos.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminStonesPage() {
    await requireAdminSession();

    return (
        <div className="adminStonesPage">
            <div className="adminStonesPageContainer">
                <div className="adminHeader">
                    <span className="adminEyebrow">Panel de administración</span>
                    <h1>Gestión de catálogo</h1>
                    <p>Administra categorías, insumos, productos y diseños personalizados desde un solo lugar.</p>
                </div>

                <div className="adminSection">
                    <h2>Categorías e insumos</h2>
                    <div className="adminSectionHeader">
                        <p>Define atributos por categoría y carga piedras, mostacillas, dijes, cadenas y terminaciones.</p>
                    </div>
                    <div className="adminButtonsContainer">
                        <SmoothRouteLink href="/admin/categories" className="adminButton">Ver categorías</SmoothRouteLink>
                        <SmoothRouteLink href="/admin/catalog-items" className="adminButton">Ver insumos</SmoothRouteLink>
                        <SmoothRouteLink href="/admin/catalog-items/new" className="adminButton">Agregar insumo</SmoothRouteLink>
                    </div>
                </div>

                <div className="adminSection">
                    <h2>Productos</h2>
                    <div className="adminSectionHeader">
                        <p>Aquí puedes agregar, editar o eliminar productos (pulseras, collares).</p>
                    </div>
                    <div className="adminButtonsContainer">
                        <SmoothRouteLink href="/admin/products" className="adminButton">Ver productos</SmoothRouteLink>
                        <SmoothRouteLink href="/admin/products/new" className="adminButton">Agregar nuevo producto</SmoothRouteLink>
                    </div>
                </div>

                <div className="adminSection">
                    <h2>Diseños personalizados</h2>
                    <div className="adminSectionHeader">
                        <p>Consulta los diseños que enviaron las clientas desde el simulador.</p>
                    </div>
                    <div className="adminButtonsContainer">
                        <SmoothRouteLink href="/admin/designs" className="adminButton">Ver diseños</SmoothRouteLink>
                    </div>
                </div>
            </div>
        </div>
    );
}
