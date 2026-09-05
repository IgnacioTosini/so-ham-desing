import type { ReactNode } from "react";
import { IoDocumentTextOutline, IoImagesOutline, IoOptionsOutline } from "react-icons/io5";
import "./_adminForms.scss";

export function AdminFormSection({ title, description, kind = "info", wide = false, children }: {
    title: string;
    description: string;
    kind?: "info" | "images" | "options";
    wide?: boolean;
    children: ReactNode;
}) {
    const Icon = kind === "images" ? IoImagesOutline : kind === "options" ? IoOptionsOutline : IoDocumentTextOutline;
    return <section className={`adminFormSection${wide ? " adminFormSectionWide" : ""}`}>
        <header className="adminFormSectionHeader">
            <span className="adminFormSectionIcon"><Icon aria-hidden="true" /></span>
            <div><h2>{title}</h2><p>{description}</p></div>
        </header>
        <div className="adminFormSectionBody">{children}</div>
    </section>;
}
