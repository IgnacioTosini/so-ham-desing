import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/lib/adminAuth";
import "./_admin.scss";

export const metadata: Metadata = {
    title: "Panel de administración",
    description: "Panel de administración de So Ham Design para gestionar piedras y productos.",
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
                    <p>Administra piedras, productos y diseños personalizados desde un solo lugar.</p>
                </div>

                <div className="adminSection">
                    <h2>Piedras</h2>
                    <div className="adminSectionHeader">
                        <p>Aquí puedes agregar, editar o eliminar piedras.</p>
                    </div>
                    <div className="adminButtonsContainer">
                        <Link href="/admin/stones" className="adminButton">Ver piedras</Link>
                        <Link href="/admin/stones/new" className="adminButton">Agregar nueva piedra</Link>
                    </div>
                </div>

                <div className="adminSection">
                    <h2>Productos</h2>
                    <div className="adminSectionHeader">
                        <p>Aquí puedes agregar, editar o eliminar productos (pulseras, collares).</p>
                    </div>
                    <div className="adminButtonsContainer">
                        <Link href="/admin/products" className="adminButton">Ver productos</Link>
                        <Link href="/admin/products/new" className="adminButton">Agregar nuevo producto</Link>
                    </div>
                </div>

                <div className="adminSection">
                    <h2>Diseños personalizados</h2>
                    <div className="adminSectionHeader">
                        <p>Consulta los diseños que enviaron las clientas desde el simulador.</p>
                    </div>
                    <div className="adminButtonsContainer">
                        <Link href="/preview" className="adminButton">Ver diseños</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
