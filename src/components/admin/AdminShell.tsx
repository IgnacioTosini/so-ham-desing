"use client";

import { usePathname } from "next/navigation";
import AdminNavbar from "./AdminNavbar";
import "./_adminShell.scss";

export default function AdminShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="adminShell">
            <AdminNavbar />
            <main className="adminShellMain">{children}</main>
        </div>
    );
}
