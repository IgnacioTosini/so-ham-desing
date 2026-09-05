import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/adminAuth";
import Link from "next/link";
import { IoArrowBack, IoLockClosedOutline } from "react-icons/io5";
import AdminLoginForm from "./AdminLoginForm";
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
            <Link href="/" className="adminLoginBack"><IoArrowBack /> Volver a la tienda</Link>
            <div className="adminLoginLayout">
            <section className="adminLoginBrand">
                <span className="adminLoginWordmark">so ham<span>DESIGN</span></span>
                <div className="adminLoginBrandMessage"><span>EL ESPACIO DETRÁS DE CADA PIEZA</span><h2>Crear con intención.<br />Cuidar cada detalle.</h2><p>Tu colección, tus materiales y tus diseños, en un mismo lugar.</p></div>
                <span className="adminLoginBrandFooter">Piezas únicas · Hechas a mano</span>
            </section>
            <div className="adminLoginCard">
                <span className="adminLoginIcon"><IoLockClosedOutline /></span>
                <span className="adminLoginEyebrow">ADMINISTRACIÓN</span>
                <h1>Bienvenida a tu espacio.</h1>
                <p>Ingresá para seguir dando forma a tu colección.</p>
                <AdminLoginForm next={next} error={error} />
                <small className="adminLoginFootnote"><IoLockClosedOutline /> Acceso exclusivo para administración</small>
            </div>
            </div>
        </div>
    );
}
