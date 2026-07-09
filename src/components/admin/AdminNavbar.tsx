"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    IoAddCircleOutline,
    IoAlbumsOutline,
    IoColorFilterOutline,
    IoHomeOutline,
    IoLogOutOutline,
    IoOpenOutline,
    IoSparklesOutline,
} from "react-icons/io5";

const navItems = [
    { href: "/admin", label: "General", icon: IoHomeOutline, match: (path: string) => path === "/admin" },
    { href: "/admin/stones", label: "Piedras", icon: IoColorFilterOutline, match: (path: string) => path.startsWith("/admin/stones") },
    { href: "/admin/products", label: "Productos", icon: IoAlbumsOutline, match: (path: string) => path.startsWith("/admin/products") },
    { href: "/preview", label: "Diseños", icon: IoSparklesOutline, match: (path: string) => path.startsWith("/preview") },
];

export default function AdminNavbar() {
    const pathname = usePathname();

    return (
        <header className="adminNavbar">
            <div className="adminNavbarInner">
                <Link href="/admin" className="adminNavbarBrand" aria-label="Ir al inicio del panel">
                    <span className="adminNavbarMark">SH</span>
                    <span>
                        <span className="adminNavbarTitle">So Ham</span>
                        <span className="adminNavbarSubtitle">Admin</span>
                    </span>
                </Link>

                <nav className="adminNavbarNav" aria-label="Navegación de administración">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.match(pathname);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`adminNavbarLink ${isActive ? "isActive" : ""}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <Icon aria-hidden="true" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="adminNavbarActions">
                    <Link href="/admin/stones/new" className="adminNavbarIconButton" aria-label="Crear nueva piedra" title="Nueva piedra">
                        <IoAddCircleOutline aria-hidden="true" />
                    </Link>
                    <Link href="/" className="adminNavbarButton secondary">
                        <IoOpenOutline aria-hidden="true" />
                        <span>Ver sitio</span>
                    </Link>
                    <form action="/api/admin/logout" method="post">
                        <button className="adminNavbarButton danger" type="submit">
                            <IoLogOutOutline aria-hidden="true" />
                            <span>Salir</span>
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
