import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/adminAuth";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const sessionToken = getAdminSessionToken();
  const cookieValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const hasSession = Boolean(sessionToken && cookieValue === sessionToken);

  if (isLoginRoute && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isLoginRoute && !hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    const nextPath = `${pathname}${search}`;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
