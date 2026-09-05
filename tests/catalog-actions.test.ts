import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    db: { category: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() }, catalogItem: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() } },
}));
vi.mock("@/lib/adminAuth", () => ({ assertAdminSession: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: mocks.db }));
vi.mock("@/lib/services", () => ({ deleteProjectImagesFromCloudinary: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
import { createCategory, createCatalogItem, deleteCatalogItem, deleteCategory } from "@/actions/catalog.action";
beforeEach(() => {
    vi.clearAllMocks(); mocks.auth.mockResolvedValue(undefined);
    mocks.db.category.create.mockResolvedValue({ id: "category" }); mocks.db.catalogItem.create.mockResolvedValue({ id: "item" });
    mocks.db.category.findUnique.mockResolvedValue({ id: "category", attributes: [], _count: { items: 1 } });
});
describe("catalog validation", () => {
    it.each([{ name: "" }, { name: "x".repeat(81) }, { name: "Perlas", description: "x".repeat(301) }, { name: "Perlas", attributes: [{ name: "Color", type: "SELECT" as const, options: [] }] }, { name: "Perlas", attributes: [{ name: "Color", type: "TEXT" as const }, { name: "Cólór", type: "TEXT" as const }] }])("rejects an invalid category", async input => {
        await expect(createCategory(input)).rejects.toThrow(); expect(mocks.db.category.create).not.toHaveBeenCalled();
    });
    it("normalizes accents, whitespace and duplicate options", async () => {
        await createCategory({ name: " Ágatas ", attributes: [{ name: " Color ", type: "SELECT", options: [" Rosa ", "Rosa", ""] }] });
        expect(mocks.db.category.create.mock.calls[0][0].data).toMatchObject({ name: "Ágatas", slug: "agatas", attributes: { create: [expect.objectContaining({ options: ["Rosa"] })] } });
    });
    it.each([["NUMBER", "abc"], ["BOOLEAN", "maybe"], ["SELECT", "Azul"], ["TEXT", ""]])("rejects invalid %s attribute value", async (type, value) => {
        mocks.db.category.findUnique.mockResolvedValue({ attributes: [{ id: "a", name: "Medida", type, isRequired: true, options: ["Rosa"] }] });
        await expect(createCatalogItem({ categoryId: "category", name: "Perla", attributeValues: { a: value } })).rejects.toThrow();
        expect(mocks.db.catalogItem.create).not.toHaveBeenCalled();
    });
    it("accepts decimal commas and discards values from other categories", async () => {
        mocks.db.category.findUnique.mockResolvedValue({ attributes: [{ id: "a", name: "Medida", type: "NUMBER", isRequired: true }] });
        await createCatalogItem({ categoryId: "category", name: "Perla", attributeValues: { a: "6,5", other: "ignore" } });
        expect(mocks.db.catalogItem.create.mock.calls[0][0].data.attributeValues).toEqual({ create: [{ attributeId: "a", value: "6.5" }] });
    });
    it("rejects missing categories", async () => {
        mocks.db.category.findUnique.mockResolvedValue(null);
        await expect(createCatalogItem({ categoryId: "missing", name: "Perla" })).rejects.toThrow();
    });
    it("protects materials used by products and categories containing materials", async () => {
        mocks.db.catalogItem.findUnique.mockResolvedValue({ _count: { products: 2 } });
        await expect(deleteCatalogItem("used")).rejects.toThrow();
        await expect(deleteCategory("used")).rejects.toThrow();
        expect(mocks.db.catalogItem.delete).not.toHaveBeenCalled(); expect(mocks.db.category.delete).not.toHaveBeenCalled();
    });
    it("requires admin access", async () => {
        mocks.auth.mockRejectedValue(new Error("No autorizado"));
        await expect(createCategory({ name: "Perlas" })).rejects.toThrow("No autorizado");
        await expect(createCatalogItem({ name: "Perla", categoryId: "c" })).rejects.toThrow("No autorizado");
    });
});
