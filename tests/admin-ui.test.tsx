// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from "react";
const mocks = vi.hoisted(() => ({ save: vi.fn(), create: vi.fn(), upload: vi.fn(), replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));
vi.mock("next/image", () => ({ default: ({ priority: _p, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void _p;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
} }));
vi.mock("@/components/ui/SmoothRouteLink", () => ({ SmoothRouteLink: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} /> }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/actions/product.action", () => ({ createProduct: mocks.create, updateProduct: mocks.save }));
vi.mock("@/actions/stone.action", () => ({ createStone: mocks.create, updateStone: mocks.save }));
vi.mock("@/actions/catalog.action", () => ({ createCategory: mocks.create, updateCategory: mocks.save, createCatalogItem: mocks.create, updateCatalogItem: mocks.save }));
vi.mock("@/lib/services/image-upload.service", () => ({ uploadImageToCloudinary: mocks.upload }));
import ProductForm from "@/components/productForm/ProductForm";
import StoneForm from "@/components/stoneForm/StoneForm";
import CategoryForm from "@/components/categoryForm/CategoryForm";
import CatalogItemForm from "@/components/catalogItemForm/CatalogItemForm";
import ProductGallery from "@/components/productGallery/ProductGallery";
import AdminLoginForm from "@/app/admin/login/AdminLoginForm";

beforeEach(() => {
    vi.clearAllMocks(); mocks.save.mockResolvedValue({}); mocks.create.mockResolvedValue({}); mocks.upload.mockResolvedValue("https://img.test/new.jpg");
    URL.createObjectURL = vi.fn(() => "blob:test-photo"); URL.revokeObjectURL = vi.fn();
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const product = { id: "p", name: "Sunset", description: "Pulsera artesanal", imageUrl: "https://img.test/a.jpg", price: 19000, type: "BRACELET", images: [{ image: { url: "https://img.test/a.jpg", order: 0 } }, { image: { url: "https://img.test/b.jpg", order: 1 } }] };
const stone = { id: "s", name: "Cuarzo", description: "Piedra natural", imageUrl: "https://img.test/stone.jpg", energyTags: ["calma"] };
const categories = [{ id: "c", name: "Perlas", isActive: true, attributes: [{ id: "a", name: "Medida", type: "NUMBER" as const, unit: "mm", isRequired: true, options: [] }] }, { id: "d", name: "Dijes", isActive: true, attributes: [] }];

describe("product editor", () => {
    it("exports the selected zoom and position before uploading the crop", async () => {
        const drawImage = vi.fn();
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ clearRect: vi.fn(), drawImage } as unknown as CanvasRenderingContext2D);
        vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(callback => callback(new Blob(["cropped"], { type: "image/jpeg" })));
        vi.stubGlobal("Image", class {
            width = 1000; height = 1000; crossOrigin = ""; onload: (() => void) | null = null;
            set src(_value: string) { void _value; queueMicrotask(() => this.onload?.()); }
        });
        const user = userEvent.setup(); render(<ProductForm mode="edit" initialData={product} />);
        await user.click(screen.getAllByRole("button", { name: "Ajustar encuadre" })[0]);
        await waitFor(() => expect(screen.getByRole("button", { name: "Aplicar encuadre" })).toBeEnabled());
        fireEvent.change(screen.getByRole("slider", { name: /Zoom/ }), { target: { value: "2" } });
        fireEvent.change(screen.getByRole("slider", { name: "Posición horizontal" }), { target: { value: "75" } });
        expect(drawImage).toHaveBeenLastCalledWith(expect.anything(), -900, -500, 2000, 2000);
        await user.click(screen.getByRole("button", { name: "Aplicar encuadre" }));
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
        await waitFor(() => expect(mocks.save).toHaveBeenCalled());
        expect(mocks.upload.mock.calls[0][0]).toMatchObject({ name: "producto.jpg", type: "image/jpeg" });
        expect(mocks.save.mock.calls[0][1].imageUrl).toBe("https://img.test/new.jpg");
    });
    it("preserves existing photos and submits a changed cover in order", async () => {
        const user = userEvent.setup(); render(<ProductForm mode="edit" initialData={product} />);
        expect(screen.getAllByAltText(/Foto \d del producto/)).toHaveLength(2);
        await user.click(screen.getByRole("button", { name: "Usar como portada" }));
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
        await waitFor(() => expect(mocks.save).toHaveBeenCalled());
        expect(mocks.save.mock.calls[0][1]).toMatchObject({ imageUrl: "https://img.test/b.jpg", images: [{ url: "https://img.test/b.jpg", order: 0 }, { url: "https://img.test/a.jpg", order: 1 }] });
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it("uploads new photos only when saving", async () => {
        const user = userEvent.setup(); render(<ProductForm mode="edit" initialData={product} />);
        await user.upload(screen.getByLabelText(/Agregar fotos/), new File(["photo"], "new.jpg", { type: "image/jpeg" }));
        expect(mocks.upload).not.toHaveBeenCalled();
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
        await waitFor(() => expect(mocks.save).toHaveBeenCalled());
        expect(mocks.upload).toHaveBeenCalledTimes(1);
        expect(mocks.save.mock.calls[0][1].images).toHaveLength(3);
    });
    it("blocks a seventh image and oversized photos", async () => {
        const user = userEvent.setup(); render(<ProductForm mode="edit" initialData={product} />);
        const file = new File(["photo"], "new.jpg", { type: "image/jpeg" });
        await user.upload(screen.getByLabelText(/Agregar fotos/), [file, file, file, file, file]);
        expect(screen.getByRole("alert")).toHaveTextContent("hasta 6");
        await user.upload(screen.getByLabelText(/Agregar fotos/), new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" }));
        expect(screen.getByRole("alert")).toHaveTextContent("5 MB");
        expect(screen.getAllByAltText(/Foto \d del producto/)).toHaveLength(2);
    });
    it("blocks saving with no photos", async () => {
        const user = userEvent.setup(); render(<ProductForm mode="edit" initialData={product} />);
        await user.click(screen.getAllByRole("button", { name: "Quitar foto" })[0]);
        await user.click(screen.getByRole("button", { name: "Quitar foto" }));
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
        expect(screen.getByRole("alert")).toHaveTextContent("al menos una foto"); expect(mocks.save).not.toHaveBeenCalled();
    });
    it("blocks save until crop editing is cancelled", async () => {
        const user = userEvent.setup(); render(<ProductForm mode="edit" initialData={product} />);
        await user.click(screen.getAllByRole("button", { name: "Ajustar encuadre" })[0]);
        expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Cancelar ajuste" }));
        expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled();
    });
    it("keeps the editor and error visible if upload fails", async () => {
        mocks.upload.mockRejectedValueOnce(new Error("Sin conexión"));
        const user = userEvent.setup(); render(<ProductForm mode="edit" initialData={product} />);
        await user.upload(screen.getByLabelText(/Agregar fotos/), new File(["x"], "x.jpg", { type: "image/jpeg" }));
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
        await screen.findByRole("alert");
        expect(mocks.save).not.toHaveBeenCalled(); expect(mocks.replace).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled();
    });
});

describe("other model editors", () => {
    it("edits stone tags without reuploading its photo", async () => {
        const user = userEvent.setup(); render(<StoneForm mode="edit" initialData={stone} />);
        await user.clear(screen.getByLabelText("Etiquetas de energía")); await user.type(screen.getByLabelText("Etiquetas de energía"), "calma, claridad");
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
        await waitFor(() => expect(mocks.save).toHaveBeenCalledWith("s", expect.objectContaining({ energyTags: ["calma", "claridad"], imageUrl: stone.imageUrl })));
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it("adds a category attribute and saves visibility", async () => {
        const user = userEvent.setup(); render(<CategoryForm mode="edit" initialData={{ id: "c", name: "Perlas", description: "", order: 10, isActive: true, role: "BEAD", attributes: [] }} />);
        await user.click(screen.getByRole("button", { name: "Agregar atributo" }));
        await user.type(screen.getAllByLabelText("Nombre")[1], "Color");
        await user.selectOptions(screen.getByLabelText("Tipo"), "SELECT");
        await user.type(screen.getByLabelText("Opciones"), "Rosa, Azul");
        await user.click(screen.getByLabelText("Categoría visible en el catálogo de insumos"));
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
        await waitFor(() => expect(mocks.save).toHaveBeenCalledWith("c", expect.objectContaining({ isActive: false, attributes: [expect.objectContaining({ name: "Color", options: ["Rosa", "Azul"] })] })));
    });
    it("removes values from the previous category when switching an item", async () => {
        const user = userEvent.setup(); render(<CatalogItemForm mode="edit" categories={categories} initialData={{ id: "i", name: "Perla", categoryId: "c", description: "", imageUrl: null, isActive: true, attributeValues: [{ attributeId: "a", value: "6" }] }} />);
        expect(screen.getByLabelText("Medida (mm) *")).toHaveValue(6);
        await user.selectOptions(screen.getByLabelText("Categoría"), "d");
        expect(screen.queryByLabelText("Medida (mm) *")).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
        await waitFor(() => expect(mocks.save).toHaveBeenCalledWith("i", expect.objectContaining({ categoryId: "d", attributeValues: {} })));
    });
    it("offers category creation instead of a broken empty item form", () => {
        render(<CatalogItemForm mode="create" categories={[]} />);
        expect(screen.getByRole("link", { name: "Crear categoría" })).toHaveAttribute("href", "/admin/categories/new");
    });
});

describe("gallery and login interactions", () => {
    it("cycles through photos with arrows, thumbnails and keyboard", async () => {
        const user = userEvent.setup(); render(<ProductGallery images={["/a.jpg", "/b.jpg"]} name="Sunset" />);
        await user.click(screen.getByRole("button", { name: "Foto anterior" }));
        expect(screen.getByRole("button", { name: "Ver foto 2" })).toHaveAttribute("aria-pressed", "true");
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("button", { name: "Ver foto 1" })).toHaveAttribute("aria-pressed", "true");
        await user.click(screen.getByRole("button", { name: "Ver foto 2" }));
        expect(screen.getByAltText("Sunset, foto 2")).toHaveAttribute("src", "/b.jpg");
    });
    it("opens and closes the modal, restores focus and scrolling", async () => {
        const user = userEvent.setup(); render(<ProductGallery images={["/a.jpg"]} name="Sunset" />);
        const trigger = screen.getByRole("button", { name: /Ampliar foto/ });
        await user.click(trigger);
        expect(screen.getByRole("dialog")).toHaveAttribute("open");
        expect(document.body.style.overflow).toBe("hidden");
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cerrar fotos ampliadas" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe(""); expect(trigger).toHaveFocus();
        expect(screen.queryByRole("button", { name: "Foto siguiente" })).not.toBeInTheDocument();
    });
    it("responds to touch swipes", () => {
        render(<ProductGallery images={["/a.jpg", "/b.jpg"]} name="Sunset" />);
        const region = screen.getByRole("region");
        fireEvent.touchStart(region, { touches: [{ clientX: 200 }] });
        fireEvent.touchEnd(region, { changedTouches: [{ clientX: 80 }] });
        expect(screen.getByAltText("Sunset, foto 2")).toBeInTheDocument();
    });
    it("toggles password visibility without losing the value", async () => {
        const user = userEvent.setup(); render(<AdminLoginForm next="/admin" error="invalid" />);
        const input = screen.getByLabelText("Tu contraseña");
        await user.type(input, "example"); await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
        expect(input).toHaveAttribute("type", "text"); expect(input).toHaveValue("example");
        await user.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
        expect(input).toHaveAttribute("type", "password"); expect(screen.getByRole("alert")).toHaveTextContent("no es correcta");
    });
});
