import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), db: { catalogItem: { count: vi.fn(), findMany: vi.fn() }, sharedDesign: { create: vi.fn(), delete: vi.fn() } } }));
vi.mock("@/lib/prisma", () => ({ prisma: mocks.db }));
vi.mock("@/lib/adminAuth", () => ({ hasAdminSession: mocks.auth }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn(), updateTag: vi.fn() }));
import { createSharedDesign, deleteSharedDesign } from "@/actions/design.action";
beforeEach(() => {
    vi.clearAllMocks(); mocks.auth.mockResolvedValue(true); mocks.db.catalogItem.count.mockResolvedValue(1);
    mocks.db.sharedDesign.create.mockResolvedValue({ shareCode: "test" });
});
const design = { type: "BRACELET" as const, name: "Calma", beadStones: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i, "stone"])) };
describe("shared designs", () => {
    it("saves a complete bracelet", async () => {
        await createSharedDesign(design);
        expect(mocks.db.sharedDesign.create.mock.calls[0][0].data.beads).toHaveLength(20);
    });
    it("requires thirty positions for a necklace", async () => {
        await expect(createSharedDesign({ ...design, type: "NECKLACE" })).rejects.toThrow();
        expect(mocks.db.sharedDesign.create).not.toHaveBeenCalled();
    });
    it.each([{ name: "" }, { name: "x".repeat(81) }, { beadStones: {} }])("rejects an incomplete or invalid design", async patch => {
        await expect(createSharedDesign({ ...design, ...patch })).rejects.toThrow();
    });
    it("rejects missing or inactive components", async () => {
        mocks.db.catalogItem.count.mockResolvedValue(0);
        await expect(createSharedDesign(design)).rejects.toThrow("componentes");
    });
    it("rejects a clasp used as a base", async () => {
        mocks.db.catalogItem.findMany.mockResolvedValue([{ id: "base", category: { role: "CLASP" } }]);
        await expect(createSharedDesign({ ...design, configuration: { baseItemId: "base", claspItemId: null } })).rejects.toThrow();
    });
    it("retries share-code collisions", async () => {
        mocks.db.sharedDesign.create.mockRejectedValueOnce(Object.assign(new Error("collision"), { code: "P2002" }));
        await createSharedDesign(design);
        expect(mocks.db.sharedDesign.create).toHaveBeenCalledTimes(2);
    });
    it("protects design deletion", async () => {
        mocks.auth.mockResolvedValue(false);
        await expect(deleteSharedDesign("code")).rejects.toThrow("No autorizado");
        expect(mocks.db.sharedDesign.delete).not.toHaveBeenCalled();
    });
});
