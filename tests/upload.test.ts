import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), cloud: vi.fn() }));
vi.mock("@/lib/adminAuth", () => ({ hasAdminSession: mocks.auth }));
vi.mock("@/lib/services/cloudinary.service", () => ({ getCloudinaryCloudName: mocks.cloud }));
import { POST } from "@/app/api/upload/route";
import { uploadImageToCloudinary } from "@/lib/services/image-upload.service";
const fetchMock = vi.fn();
beforeEach(() => {
    vi.clearAllMocks(); vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("CLOUDINARY_UPLOAD_PRESET", "test-preset"); vi.stubEnv("CLOUDINARY_FOLDER", "test");
    mocks.auth.mockResolvedValue(true); mocks.cloud.mockReturnValue("test-cloud");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const request = (file?: File) => {
    const body = new FormData(); if (file) body.set("file", file);
    return new NextRequest("https://shop.test/api/upload", { method: "POST", body });
};
describe("image upload API", () => {
    it("rejects unauthenticated uploads before contacting Cloudinary", async () => {
        mocks.auth.mockResolvedValue(false);
        expect((await POST(request())).status).toBe(401); expect(fetchMock).not.toHaveBeenCalled();
    });
    it("rejects missing configuration", async () => {
        mocks.cloud.mockReturnValue(""); expect((await POST(request())).status).toBe(500);
    });
    it.each([undefined, new File(["text"], "bad.svg", { type: "image/svg+xml" }), new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" })])("rejects invalid or oversized files", async file => {
        expect((await POST(request(file))).status).toBe(400); expect(fetchMock).not.toHaveBeenCalled();
    });
    it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s and returns the uploaded URL", async type => {
        fetchMock.mockResolvedValue(Response.json({ secure_url: "https://img.test/result" }));
        const response = await POST(request(new File(["image"], "photo", { type })));
        expect(response.status).toBe(200); expect(await response.json()).toEqual({ url: "https://img.test/result" });
    });
    it("reports provider failure without claiming success", async () => {
        fetchMock.mockResolvedValue(new Response("failed", { status: 503 }));
        expect((await POST(request(new File(["image"], "photo.jpg", { type: "image/jpeg" })))).status).toBe(503);
    });
    it("rejects a provider response without an image URL", async () => {
        fetchMock.mockResolvedValue(Response.json({}));
        expect((await POST(request(new File(["image"], "photo.jpg", { type: "image/jpeg" })))).status).toBe(500);
    });
    it("client surfaces upload errors", async () => {
        fetchMock.mockResolvedValue(Response.json({ error: "Upload failed" }, { status: 400 }));
        await expect(uploadImageToCloudinary(new File(["x"], "photo.jpg"))).rejects.toThrow("Upload failed");
    });
});
