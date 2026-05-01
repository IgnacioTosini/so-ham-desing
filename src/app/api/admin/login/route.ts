import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminPassword, getAdminSessionToken } from "@/lib/adminAuth";

export async function POST(request: Request) {
    const formData = await request.formData();
    const password = String(formData.get("password") ?? "").trim();
    const next = String(formData.get("next") ?? "/admin").trim();

    const adminPassword = getAdminPassword();
    const adminSessionToken = getAdminSessionToken();

    if (!adminPassword || !adminSessionToken) {
        return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
    }

    if (password !== adminPassword) {
        return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
    }

    const safeNext = next.startsWith("/admin") ? next : "/admin";
    const response = NextResponse.redirect(new URL(safeNext, request.url));

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
