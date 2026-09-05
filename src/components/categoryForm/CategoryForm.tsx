"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createCategory, updateCategory, type CatalogAttributeTypeInput, type CatalogCategoryRoleInput } from "@/actions/catalog.action";
import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import "../catalogAdmin/_catalogAdmin.scss";

interface CategoryAttributeData {
    id?: string;
    name: string;
    type: CatalogAttributeTypeInput;
    unit: string | null;
    isRequired: boolean;
    options: string[];
}

interface CategoryFormInitialData {
    id: string;
    name: string;
    description: string | null;
    order: number;
    isActive: boolean;
    role: CatalogCategoryRoleInput;
    attributes: CategoryAttributeData[];
}

interface EditableAttribute extends CategoryAttributeData {
    localId: string;
    optionsInput: string;
}

interface CategoryFormProps {
    mode: "create" | "edit";
    initialData?: CategoryFormInitialData;
}

const newLocalId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

const makeAttribute = (attribute?: CategoryAttributeData): EditableAttribute => ({
    id: attribute?.id,
    localId: attribute?.id ?? newLocalId(),
    name: attribute?.name ?? "",
    type: attribute?.type ?? "TEXT",
    unit: attribute?.unit ?? "",
    isRequired: attribute?.isRequired ?? false,
    options: attribute?.options ?? [],
    optionsInput: attribute?.options.join(", ") ?? "",
});

export default function CategoryForm({ mode, initialData }: CategoryFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [role, setRole] = useState<CatalogCategoryRoleInput>(initialData?.role ?? "BEAD");
    const [attributes, setAttributes] = useState<EditableAttribute[]>(
        initialData?.attributes.map(makeAttribute) ?? []
    );
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const updateAttribute = (localId: string, changes: Partial<EditableAttribute>) => {
        setAttributes((current) =>
            current.map((attribute) =>
                attribute.localId === localId ? { ...attribute, ...changes } : attribute
            )
        );
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSaving(true);

        const payload = {
            name,
            description,
            order: initialData?.order ?? 0,
            isActive,
            role,
            attributes: attributes.map((attribute) => ({
                id: attribute.id,
                name: attribute.name,
                type: attribute.type,
                unit: attribute.unit,
                isRequired: attribute.isRequired,
                options: attribute.optionsInput.split(",").map((option) => option.trim()).filter(Boolean),
            })),
        };

        try {
            if (mode === "edit") {
                if (!initialData?.id) throw new Error("Falta el ID de la categoría.");
                await updateCategory(initialData.id, payload);
                toast.success("Categoría actualizada.");
            } else {
                await createCategory(payload);
                toast.success("Categoría creada.");
            }
            router.replace("/admin/categories");
            router.refresh();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la categoría.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form className="catalogForm adminEditor" onSubmit={handleSubmit} aria-busy={isSaving}>
            <div className="adminFormLayout">
            <AdminFormSection title="Información de la categoría" description="Organizá los materiales de tu colección." wide>
            <div className="catalogFormField">
                <label htmlFor="category-name">Nombre</label>
                <input id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Perlas" required />
            </div>

            <div className="catalogFormField">
                <label htmlFor="category-description">Descripción</label>
                <textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Qué piezas agrupa esta categoría" />
            </div>

            <div className="catalogFormField">
                <label htmlFor="category-role">Función en el simulador</label>
                <select id="category-role" value={role} onChange={(event) => setRole(event.target.value as CatalogCategoryRoleInput)}>
                    <option value="BEAD">Cuenta — ocupa una posición</option>
                    <option value="CHARM">Dije — pieza destacada</option>
                    <option value="BASE">Base — cadena, hilo o tanza</option>
                    <option value="CLASP">Cierre — mosquetón o terminación</option>
                </select>
                <small>Define cómo se usa cada insumo al armar una pieza.</small>
            </div>

            <label className="catalogToggle">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                <span>Categoría visible en el catálogo de insumos</span>
            </label>

            </AdminFormSection>
            <AdminFormSection title="Propiedades de los insumos" description="Definí los campos que tendrá cada material de esta categoría." kind="options" wide>
            <section className="attributeBuilder">
                <div className="attributeBuilderHeader">
                    <div>
                        <h2>Atributos de los insumos</h2>
                        <p>Estos campos aparecerán al cargar un insumo de esta categoría.</p>
                    </div>
                    <button type="button" className="catalogSmallButton" onClick={() => setAttributes((current) => [...current, makeAttribute()])}>
                        Agregar atributo
                    </button>
                </div>

                {attributes.length === 0 ? (
                    <p className="catalogEmptyState">La categoría todavía no tiene atributos propios.</p>
                ) : (
                    <div className="attributeList">
                        {attributes.map((attribute, index) => (
                            <div className="attributeRow" key={attribute.localId}>
                                <span className="attributeNumber">{index + 1}</span>
                                <div className="catalogFormField">
                                    <label htmlFor={`attribute-name-${attribute.localId}`}>Nombre</label>
                                    <input
                                        id={`attribute-name-${attribute.localId}`}
                                        value={attribute.name}
                                        onChange={(event) => updateAttribute(attribute.localId, { name: event.target.value })}
                                        placeholder="Ej: Medida"
                                        required
                                    />
                                </div>
                                <div className="catalogFormField">
                                    <label htmlFor={`attribute-type-${attribute.localId}`}>Tipo</label>
                                    <select
                                        id={`attribute-type-${attribute.localId}`}
                                        value={attribute.type}
                                        onChange={(event) => updateAttribute(attribute.localId, { type: event.target.value as CatalogAttributeTypeInput })}
                                    >
                                        <option value="TEXT">Texto</option>
                                        <option value="NUMBER">Número</option>
                                        <option value="SELECT">Lista de opciones</option>
                                        <option value="BOOLEAN">Sí / No</option>
                                    </select>
                                </div>
                                <div className="catalogFormField unitField">
                                    <label htmlFor={`attribute-unit-${attribute.localId}`}>Unidad</label>
                                    <input
                                        id={`attribute-unit-${attribute.localId}`}
                                        value={attribute.unit ?? ""}
                                        onChange={(event) => updateAttribute(attribute.localId, { unit: event.target.value })}
                                        placeholder="mm"
                                    />
                                </div>
                                {attribute.type === "SELECT" ? (
                                    <div className="catalogFormField optionsField">
                                        <label htmlFor={`attribute-options-${attribute.localId}`}>Opciones</label>
                                        <input
                                            id={`attribute-options-${attribute.localId}`}
                                            value={attribute.optionsInput}
                                            onChange={(event) => updateAttribute(attribute.localId, { optionsInput: event.target.value })}
                                            placeholder="Redonda, Gota, Irregular"
                                            required
                                        />
                                        <small>Separadas por coma.</small>
                                    </div>
                                ) : null}
                                <label className="catalogToggle attributeRequired">
                                    <input
                                        type="checkbox"
                                        checked={attribute.isRequired}
                                        onChange={(event) => updateAttribute(attribute.localId, { isRequired: event.target.checked })}
                                    />
                                    <span>Obligatorio</span>
                                </label>
                                <button
                                    type="button"
                                    className="catalogRemoveButton"
                                    onClick={() => setAttributes((current) => current.filter((item) => item.localId !== attribute.localId))}
                                    aria-label={`Quitar atributo ${attribute.name || index + 1}`}
                                >
                                    Quitar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            </AdminFormSection>

            </div>

            {error ? <p className="catalogFormError" role="alert">{error}</p> : null}

            <div className="catalogFormActions">
                <span className="adminFormSaveHint">Los cambios se aplican al guardar.</span>
                <SmoothRouteLink href="/admin/categories" className="catalogButton secondary">Cancelar</SmoothRouteLink>
                <button type="submit" className="catalogButton primary" disabled={isSaving}>
                    {isSaving ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear categoría"}
                </button>
            </div>
        </form>
    );
}
