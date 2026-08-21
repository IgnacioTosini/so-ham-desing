import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublicCatalog } from "@/actions/catalog.action";
import { PieceType, SharedDesignConfiguration } from "@/types";
import { getBeadStoneRecord } from "@/utils";
import { PreviewCanvas } from "../previewCanvas/PreviewCanvas";
import Image from "next/image";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { PreviewShareButton } from "@/components/ui/shareDesignPage/PreviewShareButton";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { PreviewByCodeClient } from "./PreviewByCodeClient";
import "./_previewByCodePage.scss";

interface Props {
    params: Promise<{ shareCode: string }>;
    searchParams: Promise<{ from?: string }>;
}

export const metadata = {
    title: "Vista previa de diseño",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function PreviewByCodePage({ params, searchParams }: Props) {
    const [{ shareCode }, query] = await Promise.all([params, searchParams]);

    const design = await prisma.sharedDesign.findUnique({
        where: { shareCode },
    });

    if (!design) notFound();

    const categories = await getPublicCatalog();
    const items = categories.flatMap((category) => category.items);
    const beadArray = Array.isArray(design.beads)
        ? design.beads.filter((value): value is string | null => typeof value === 'string' || value === null)
        : [];
    const beadStones = getBeadStoneRecord(beadArray);
    const assignedCount = Object.keys(beadStones).length;
    const pieceLabel = design.type === 'BRACELET' ? 'Pulsera' : 'Collar';
    const configuration = design.configuration && typeof design.configuration === 'object' && !Array.isArray(design.configuration)
        ? design.configuration as SharedDesignConfiguration
        : null;
    const selectedBase = configuration?.baseItemId
        ? items.find((item) => item.id === configuration.baseItemId)
        : null;
    const selectedClasp = configuration?.claspItemId
        ? items.find((item) => item.id === configuration.claspItemId)
        : null;
    const isAdminOrigin = query.from === 'admin';
    const backHref = isAdminOrigin ? '/admin/designs' : '/disenos';
    const backLabel = isAdminOrigin ? 'Volver a diseños del admin' : 'Volver a diseños compartidos';
    const formattedDate = new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires',
    }).format(design.createdAt);

    return (
        <PreviewByCodeClient>
            <main className="previewByCodePage">
                <div className="previewByCodeShell">
                    <header className="previewDetailHeader">
                        <SmoothRouteLink href={backHref} className="backLink">
                            <IoArrowBack aria-hidden="true" />
                            {backLabel}
                        </SmoothRouteLink>
                        <SmoothRouteLink href="/" className="previewBrand" aria-label="Ir al inicio de So Ham Design">
                            <Image src="/soHamDesignLogo.png" alt="" width={40} height={40} />
                            <span>So Ham Design</span>
                        </SmoothRouteLink>
                    </header>

                    <div className="previewDetailLayout">
                        <div className="previewCanvasFrame">
                            <span className="previewCanvasLabel">Vista del diseño</span>
                            <PreviewCanvas
                                pieceType={design.type as PieceType}
                                beadStones={beadStones}
                                items={items}
                            />
                        </div>

                        <section className="previewDetailInfo">
                            <span className="previewPieceType">{pieceLabel} compartido</span>
                            <h1>{design.name || 'Diseño sin nombre'}</h1>
                            <p className="previewLead">
                                Una combinación creada componente por componente en el simulador de So Ham Design.
                            </p>

                            <dl className="previewStats">
                                <div>
                                    <dt>Tipo</dt>
                                    <dd>{pieceLabel}</dd>
                                </div>
                                <div>
                                    <dt>Componentes</dt>
                                    <dd>{assignedCount}</dd>
                                </div>
                                <div>
                                    <dt>Compartido</dt>
                                    <dd>{formattedDate}</dd>
                                </div>
                                {selectedBase ? (
                                    <div>
                                        <dt>Base</dt>
                                        <dd>{selectedBase.name}</dd>
                                    </div>
                                ) : null}
                                {selectedClasp ? (
                                    <div>
                                        <dt>Cierre</dt>
                                        <dd>{selectedClasp.name}</dd>
                                    </div>
                                ) : null}
                            </dl>

                            <div className="previewActions">
                                <SmoothRouteLink href="/#simulator" className="previewCreateButton">
                                    Crear mi diseño
                                    <IoArrowForward aria-hidden="true" />
                                </SmoothRouteLink>
                                <PreviewShareButton designName={design.name || 'Diseño sin nombre'} />
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </PreviewByCodeClient>
    );
}
