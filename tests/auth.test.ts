import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ cookies: vi.fn(), redirect: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: auth.cookies }));
vi.mock("next/navigation", () => ({ redirect: auth.redirect }));
import { hasAdminSession, assertAdminSession, requireAdminSession } from "@/lib/adminAuth";
import { POST as login } from "@/app/api/admin/login/route";
import { POST as logout } from "@/app/api/admin/logout/route";

beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "test-password");
    vi.stubEnv("ADMIN_SESSION_TOKEN", "test-session");
    auth.cookies.mockResolvedValue({ get: () => undefined });
});
afterEach(() => vi.unstubAllEnvs());
const request = (password: string, next = "/admin") => new Request("https://shop.test/api/admin/login", {
    method: "POST", body: new URLSearchParams({ password, next }),
});

describe("admin access", () => {
    it("rejects missing and invalid sessions", async () => {
        expect(await hasAdminSession()).toBe(false);
        await expect(assertAdminSession()).rejects.toThrow("No autorizado");
        auth.cookies.mockResolvedValue({ get: () => ({ value: "wrong" }) });
        expect(await hasAdminSession()).toBe(false);
        await requireAdminSession();
        expect(auth.redirect).toHaveBeenCalledWith("/admin/login");
    });
    it("accepts the configured session", async () => {
        auth.cookies.mockResolvedValue({ get: () => ({ value: "test-session" }) });
        expect(await hasAdminSession()).toBe(true);
        await expect(assertAdminSession()).resolves.toBeUndefined();
    });
    it("login redirects with GET and sets a protected cookie", async () => {
        const response = await login(request("test-password", "/admin/products"));
        expect(response.status).toBe(303);
        expect(response.headers.get("location")).toBe("https://shop.test/admin/products");
        expect(response.cookies.get("soham_admin_session")?.value).toBe("test-session");
        expect(response.headers.get("set-cookie")).toContain("HttpOnly");
        expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
    });
    it.each(["https://elsewhere.test", "//elsewhere.test", "/administrator", "/admin/../preview", "/admin\\..\\preview"])("does not follow an invalid admin destination: %s", async next => {
        const response = await login(request("test-password", next));
        expect(response.headers.get("location")).toBe("https://shop.test/admin");
    });
    it("rejects invalid passwords without setting cookies", async () => {
        const response = await login(request("wrong"));
        expect(response.status).toBe(303);
        expect(response.headers.get("location")).toContain("error=invalid");
        expect(response.headers.get("set-cookie")).toBeNull();
    });
    it("fails closed when configuration is absent", async () => {
        vi.stubEnv("ADMIN_PASSWORD", "");
        const response = await login(request(""));
        expect(response.headers.get("location")).toContain("error=config");
        expect(response.headers.get("set-cookie")).toBeNull();
    });
    it("logout clears the cookie and redirects with GET", async () => {
        const response = await logout(request(""));
        expect(response.status).toBe(303);
        expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    });
});
