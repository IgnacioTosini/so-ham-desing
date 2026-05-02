import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/adminAuth";
import "./_adminLogin.scss";

export const metadata: Metadata = {
    title: "Login admin",
    description: "Acceso al área de administración de So Ham Design.",
    robots: {
        index: false,
        follow: false,
    },
};

type AdminLoginPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
    const isAuthenticated = await hasAdminSession();
    if (isAuthenticated) redirect("/admin");

    const params = await searchParams;
    const error = typeof params.error === "string" ? params.error : "";
    const next = typeof params.next === "string" ? params.next : "/admin";

    return (
        <div className="adminLoginPage">
            <div className="adminLoginCard">
                <h1>Acceso Admin</h1>
                <p>Ingresa tu contraseña para administrar piedras y productos.</p>

                {error === "invalid" ? <p className="adminLoginError">Contraseña incorrecta.</p> : null}
                {error === "config" ? (
                    <p className="adminLoginError">Falta configurar ADMIN_PASSWORD o ADMIN_SESSION_TOKEN.</p>
                ) : null}

                <form action="/api/admin/login" method="post">
                    <input type="hidden" name="next" value={next} />
                    <label htmlFor="password">Contraseña</label>
                    <input id="password" name="password" type="password" required autoComplete="current-password" />
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
}
