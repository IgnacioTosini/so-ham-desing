import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "soham_admin_session";

export function getAdminPassword() {
    return process.env.ADMIN_PASSWORD ?? "";
}

export function getAdminSessionToken() {
    return process.env.ADMIN_SESSION_TOKEN ?? "";
}

export async function hasAdminSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return Boolean(sessionCookie && sessionCookie === getAdminSessionToken());
}

export async function requireAdminSession() {
    const hasSession = await hasAdminSession();
    if (!hasSession) redirect("/admin/login");
}

export async function assertAdminSession() {
    const hasSession = await hasAdminSession();
    if (!hasSession) throw new Error("No autorizado");
}
