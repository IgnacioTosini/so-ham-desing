import Link from "next/link";
import { requireAdminSession } from "@/lib/adminAuth";
import "./_admin.scss";

export default async function AdminStonesPage() {
    await requireAdminSession();

    return (
        <div className="adminStonesPage">
            <div className="adminStonesPageContainer">
                <div className="adminHeader">
                    <h1>Admin - General</h1>
                    <p>Gestión de piedras y piezas.</p>
                    <form action="/api/admin/logout" method="post">
                        <button className="adminButton" type="submit">Cerrar sesión</button>
                    </form>
                </div>

                <div className="adminSection">
                    <h2>Gestión de piedras</h2>
                    <div className="adminSectionHeader">
                        <p>Aquí puedes agregar, editar o eliminar piedras.</p>
                    </div>
                    <div className="adminButtonsContainer">
                        <Link href="/admin/stones" className="adminButton">Ver piedras</Link>
                        <Link href="/admin/stones/new" className="adminButton">Agregar nueva piedra</Link>
                    </div>
                </div>

                <div className="adminSection">
                    <h2>Gestión de productos</h2>
                    <div className="adminSectionHeader">
                        <p>Aquí puedes agregar, editar o eliminar productos (pulseras, collares).</p>
                    </div>
                    <div className="adminButtonsContainer">
                        <Link href="/admin/products" className="adminButton">Ver productos</Link>
                        <Link href="/admin/products/new" className="adminButton">Agregar nuevo producto</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}