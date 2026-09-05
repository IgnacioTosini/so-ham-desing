import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminPassword, getAdminSessionToken } from "@/lib/adminAuth";

export async function POST(request: Request) {
    const formData = await request.formData();
    const password = String(formData.get("password") ?? "").trim();
    const next = String(formData.get("next") ?? "/admin").trim();

    const adminPassword = getAdminPassword();
    const adminSessionToken = getAdminSessionToken();

    if (!adminPassword || !adminSessionToken) {
        return NextResponse.redirect(new URL("/admin/login?error=config", request.url), 303);
    }

    if (password !== adminPassword) {
        return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), 303);
    }

    const destination = new URL(next, request.url);
    const safeNext = destination.origin === new URL(request.url).origin &&
        (destination.pathname === "/admin" || destination.pathname.startsWith("/admin/"))
        ? `${destination.pathname}${destination.search}` : "/admin";
    const response = NextResponse.redirect(new URL(safeNext, request.url), 303);

    response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: adminSessionToken,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 12,
    });

    return response;
}
