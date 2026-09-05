import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => {
    const model = () => ({ create: vi.fn(), update: vi.fn(), delete: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), deleteMany: vi.fn() });
    return { db: { product: model(), stone: model(), stoneImage: model(), image: model(), catalogItem: model(), productCatalogItem: model(), productStone: model(), productImage: model(), $transaction: vi.fn() }, auth: vi.fn(), upload: vi.fn(), remove: vi.fn() };
});
vi.mock("@/lib/prisma", () => ({ prisma: mocks.db }));
vi.mock("@/lib/adminAuth", () => ({ assertAdminSession: mocks.auth }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/services", () => ({ uploadImages: mocks.upload, deleteProjectImagesFromCloudinary: mocks.remove }));
vi.mock("@/lib/services/cloudinary.service", () => ({ uploadBase64ImageToCloudinary: vi.fn() }));
import { createProduct, updateProduct, deleteProduct } from "@/actions/product.action";
import { createStone, updateStone, deleteStone } from "@/actions/stone.action";

const input = { name: " Sunset ", price: 19000, type: "BRACELET" as const, images: [{ url: "https://img.test/a.jpg", order: 0 }, { url: "https://img.test/b.jpg", order: 1 }] };
beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(undefined);
    mocks.upload.mockImplementation(async images => images);
    mocks.db.$transaction.mockImplementation(async fn => fn(mocks.db));
    mocks.db.product.count.mockResolvedValue(0); mocks.db.stone.count.mockResolvedValue(0); mocks.db.image.count.mockResolvedValue(0);
    mocks.db.catalogItem.count.mockResolvedValue(0);
    mocks.db.image.findMany.mockResolvedValue([]);
    mocks.db.product.findUnique.mockResolvedValue({ id: "p", imageUrl: input.images[0].url, images: [{ image: { id: "old", url: input.images[0].url } }] });
    mocks.db.product.update.mockResolvedValue({ id: "p", imageUrl: input.images[0].url });
    mocks.db.product.create.mockResolvedValue({ id: "new" });
    vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("stone persistence", () => {
    const stoneInput = { name: " Cuarzo ", description: " Natural ", energyTags: [" CALMA ", ""], images: input.images };
    it("normalizes stone data", async () => {
        await createStone(stoneInput);
        expect(mocks.db.stone.create.mock.calls[0][0].data).toMatchObject({ name: "Cuarzo", description: "Natural", energyTags: ["calma"] });
    });
    it.each([{ name: "" }, { description: "" }, { energyTags: [] }, { energyTags: ["x".repeat(31)] }, { energyTags: Array(9).fill("calma") }, { images: Array(7).fill(input.images[0]) }])("rejects invalid stone input", async patch => {
        await expect(createStone({ ...stoneInput, ...patch })).rejects.toThrow();
        expect(mocks.db.stone.create).not.toHaveBeenCalled();
    });
    it("retains photos still referenced when editing a stone", async () => {
        mocks.db.stone.findUnique.mockResolvedValue({ id: "s", imageUrl: input.images[0].url, images: [{ image: { id: "old" } }] });
        mocks.db.stone.update.mockResolvedValue({ id: "s", imageUrl: input.images[0].url });
        mocks.db.image.findMany.mockResolvedValue([{ id: "old", url: input.images[1].url }]);
        mocks.db.image.count.mockResolvedValue(1);
        await updateStone("s", stoneInput);
        expect(mocks.remove.mock.calls.flat(2)).not.toContain(input.images[1].url);
    });
    it("retains photos used by a different entity when deleting a stone", async () => {
        mocks.db.stone.findUnique.mockResolvedValue({ id: "s", imageUrl: input.images[0].url, images: [{ image: { id: "old" } }], products: [] });
        mocks.db.image.findMany.mockResolvedValue([{ id: "old", url: input.images[1].url }]);
        mocks.db.product.count.mockResolvedValue(1);
        await deleteStone("s");
        expect(mocks.remove.mock.calls.flat(2)).not.toContain(input.images[1].url);
    });
    it("rejects unauthenticated stone writes", async () => {
        mocks.auth.mockRejectedValue(new Error("No autorizado"));
        await expect(createStone(stoneInput)).rejects.toThrow("No autorizado");
        await expect(updateStone("s", stoneInput)).rejects.toThrow("No autorizado");
        await expect(deleteStone("s")).rejects.toThrow("No autorizado");
    });
});

describe("product persistence", () => {
    it("saves the gallery in order and chooses the first photo as cover", async () => {
        await createProduct(input);
        expect(mocks.db.product.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ name: "Sunset", imageUrl: input.images[0].url, images: { create: input.images.map(image => ({ image: { create: { ...image, alt: null } } })) } }) }));
    });
    it.each([{ name: "" }, { price: 0 }, { price: -1 }, { price: NaN }, { name: "x".repeat(81) }, { description: "x".repeat(501) }, { images: Array(7).fill(input.images[0]) }])("rejects invalid product %j", async patch => {
        await expect(createProduct({ ...input, ...patch })).rejects.toThrow();
        expect(mocks.db.product.create).not.toHaveBeenCalled();
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it("rejects a missing image", async () => {
        await expect(createProduct({ ...input, images: [] })).rejects.toThrow();
        expect(mocks.db.product.create).not.toHaveBeenCalled();
    });
    it("rejects stale composition ids before uploading", async () => {
        await expect(createProduct({ ...input, catalogItemIds: ["missing"] })).rejects.toThrow();
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it("preserves galleries omitted by older edit clients", async () => {
        await updateProduct("p", { name: "Sunset", price: 19000, type: "BRACELET" });
        expect(mocks.db.product.update.mock.calls[0][0].data).not.toHaveProperty("images");
    });
    it("does not delete a photo retained in the edited gallery", async () => {
        mocks.db.image.findMany.mockResolvedValue([{ id: "old", url: input.images[1].url }]);
        mocks.db.image.count.mockResolvedValue(1);
        await updateProduct("p", input);
        expect(mocks.remove.mock.calls.flat(2)).not.toContain(input.images[1].url);
    });
    it("deletes photos removed from the gallery", async () => {
        mocks.db.image.findMany.mockResolvedValue([{ id: "old", url: input.images[1].url }]);
        await updateProduct("p", { ...input, images: [input.images[0]] });
        expect(mocks.remove).toHaveBeenCalledWith([input.images[1].url]);
    });
    it("does not delete a gallery URL referenced by another product when deleting", async () => {
        mocks.db.image.findMany.mockResolvedValue([{ id: "old", url: input.images[1].url }]);
        mocks.db.product.count.mockResolvedValue(1);
        await deleteProduct("p");
        expect(mocks.remove.mock.calls.flat(2)).not.toContain(input.images[1].url);
    });
    it("does not delete cloud photos when a transaction fails", async () => {
        mocks.db.$transaction.mockRejectedValueOnce(new Error("Database unavailable"));
        await expect(updateProduct("p", input)).rejects.toThrow();
        expect(mocks.remove).not.toHaveBeenCalled();
    });
    it("protects all mutations from unauthenticated callers", async () => {
        mocks.auth.mockRejectedValue(new Error("No autorizado"));
        await expect(createProduct(input)).rejects.toThrow("No autorizado");
        await expect(updateProduct("p", input)).rejects.toThrow("No autorizado");
        await expect(deleteProduct("p")).rejects.toThrow("No autorizado");
        expect(mocks.db.product.findUnique).not.toHaveBeenCalled();
        expect(mocks.upload).not.toHaveBeenCalled();
    });
});
