"use client";

import { usePathname } from "next/navigation";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
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
    { href: "/admin/designs", label: "Diseños", icon: IoSparklesOutline, match: (path: string) => path.startsWith("/admin/designs") },
];

export default function AdminNavbar() {
    const pathname = usePathname();

    return (
        <header className="adminNavbar">
            <div className="adminNavbarInner">
                <SmoothRouteLink href="/admin" className="adminNavbarBrand" aria-label="Ir al inicio del panel">
                    <span className="adminNavbarMark">SH</span>
                    <span>
                        <span className="adminNavbarTitle">So Ham</span>
                        <span className="adminNavbarSubtitle">Admin</span>
                    </span>
                </SmoothRouteLink>

                <nav className="adminNavbarNav" aria-label="Navegación de administración">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.match(pathname);

                        return (
                            <SmoothRouteLink
                                key={item.href}
                                href={item.href}
                                className={`adminNavbarLink ${isActive ? "isActive" : ""}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <Icon aria-hidden="true" />
                                <span>{item.label}</span>
                            </SmoothRouteLink>
                        );
                    })}
                </nav>

                <div className="adminNavbarActions">
                    <SmoothRouteLink href="/admin/stones/new" className="adminNavbarIconButton" aria-label="Crear nueva piedra" title="Nueva piedra">
                        <IoAddCircleOutline aria-hidden="true" />
                    </SmoothRouteLink>
                    <SmoothRouteLink href="/" className="adminNavbarButton secondary">
                        <IoOpenOutline aria-hidden="true" />
                        <span>Ver sitio</span>
                    </SmoothRouteLink>
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
