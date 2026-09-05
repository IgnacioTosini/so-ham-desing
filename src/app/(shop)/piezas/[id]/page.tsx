import type { Metadata } from "next";
import Image from "next/image";
import ProductGallery from "@/components/productGallery/ProductGallery";
import { notFound } from "next/navigation";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import { getProductById, getProducts } from "@/actions/product.action";
import { BraceletSizeGuide } from "@/components/ui/braceletSizeGuide/BraceletSizeGuide";
import { SmoothRouteLink } from "@/components/ui/SmoothRouteLink";
import { buildWhatsappMessageCompletePiece } from "@/utils";
import { getSiteUrl } from "@/utils/siteUrl";
import { SmoothScrollToTop } from "./SmoothScrollToTop";
import "./_pieceDetail.scss";

interface PieceDetailPageProps {
    params: Promise<{ id: string }>;
}

const getTypeLabel = (type: string) => (type === "NECKLACE" ? "Collar" : "Pulsera");
const getTypePluralLabel = (type: string) => (type === "NECKLACE" ? "collares" : "pulseras");

const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(price);

const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const getEnergyTags = (item: { attributeValues: Array<{ value: string; attribute: { key: string } }> }) =>
    item.attributeValues
        .filter(({ attribute }) => attribute.key === "etiquetas-de-energia")
        .flatMap(({ value }) => value.split(/[,;]+/).map((tag) => tag.trim()).filter(Boolean));

const formatAttributeValue = (attribute: { type: string; unit: string | null; value: string }) => {
    if (attribute.type === "BOOLEAN") return attribute.value === "true" ? "Sí" : "No";
    return `${attribute.value}${attribute.unit ? ` ${attribute.unit}` : ""}`;
};

export async function generateMetadata({ params }: PieceDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return {
            title: "Pieza no encontrada",
        };
    }

    const title = `${product.name} | ${getTypeLabel(product.type)} artesanal`;
    const description = product.description || `${getTypeLabel(product.type)} artesanal con piedras naturales de So Ham Design.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/piezas/${product.id}`,
        },
        openGraph: {
            title,
            description,
            url: `${getSiteUrl()}/piezas/${product.id}`,
            images: [
                {
                    url: product.imageUrl,
                    alt: product.name,
                },
            ],
        },
    };
}

export default async function PieceDetailPage({ params }: PieceDetailPageProps) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) notFound();

    const typeLabel = getTypeLabel(product.type);
    const whatsappUrl = buildWhatsappMessageCompletePiece({
        type: product.type,
        completedPiece: product,
    });
    const catalogItems = product.catalogItems.map(({ item }) => item);
    const legacyStones = product.stones.map(({ stone }) => stone);
    const energyTags = uniqueValues(
        catalogItems.length > 0
            ? catalogItems.flatMap(getEnergyTags)
            : legacyStones.flatMap((stone) => stone.energyTags)
    );
    const groupedComposition = new Map<
        string,
        {
            id: string;
            name: string;
            description: string | null;
            order: number;
            items: typeof catalogItems;
        }
    >();

    catalogItems.forEach((item) => {
        const group = groupedComposition.get(item.categoryId) ?? {
            id: item.category.id,
            name: item.category.name,
            description: item.category.description,
            order: item.category.order,
            items: [],
        };
        group.items.push(item);
        groupedComposition.set(item.categoryId, group);
    });

    const compositionGroups = Array.from(groupedComposition.values()).sort(
        (a, b) => a.order - b.order || a.name.localeCompare(b.name, "es")
    );
    const gallery = uniqueValues([
        product.imageUrl,
        ...product.images
            .slice()
            .sort((a, b) => a.image.order - b.image.order)
            .map(({ image }) => image.url),
    ]);
    const relatedProducts = (await getProducts())
        .filter((relatedProduct) => relatedProduct.id !== product.id && relatedProduct.type === product.type)
        .slice(0, 3);

    return (
        <main className="pieceDetail">
            <SmoothScrollToTop routeKey={product.id} />
            <section className="pieceDetailHero">
                <ProductGallery images={gallery} name={product.name} />

                <div className="pieceDetailIntro">
                    <SmoothRouteLink href="/#viewPieces" className="pieceDetailBack">
                        <FaArrowLeftLong />
                        Volver a piezas
                    </SmoothRouteLink>
                    <p className="pieceDetailType">{typeLabel} artesanal</p>
                    <h1>{product.name}</h1>
                    <p className="pieceDetailDescription">
                        {product.description || "Una pieza artesanal pensada para acompañarte con piedras naturales e intención propia."}
                    </p>

                    {energyTags.length > 0 && (
                        <div className="pieceDetailIntent">
                            <span>Intención</span>
                            <p>{energyTags.slice(0, 4).join(" · ")}</p>
                        </div>
                    )}

                    {product.type === "BRACELET" && <BraceletSizeGuide variant="compact" />}

                    <div className="pieceDetailPurchase">
                        <p>{formatPrice(product.price)}</p>
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                            Consultar por WhatsApp
                            <IoLogoWhatsapp />
                        </a>
                    </div>
                </div>
            </section>

            <section className="pieceDetailSection">
                <div className="pieceDetailSectionHeader">
                    <p>Composición</p>
                    <h2>Materiales de esta pieza</h2>
                </div>

                {compositionGroups.length > 0 ? (
                    <div className="pieceCompositionGroups">
                        {compositionGroups.map((group) => (
                            <section key={group.id} className="pieceCompositionGroup">
                                <div className="pieceCompositionGroupHeader">
                                    <div>
                                        <h3>{group.name}</h3>
                                        {group.description && <p>{group.description}</p>}
                                    </div>
                                    <span>{group.items.length} {group.items.length === 1 ? "insumo" : "insumos"}</span>
                                </div>

                                <div className="pieceMaterialGrid">
                                    {group.items.map((item) => {
                                        const itemEnergyTags = getEnergyTags(item);
                                        const visibleAttributes = item.attributeValues.filter(
                                            ({ attribute }) => attribute.key !== "etiquetas-de-energia"
                                        );

                                        return (
                                            <article key={item.id} className="pieceMaterialCard">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        width={180}
                                                        height={180}
                                                        className="pieceMaterialImage"
                                                    />
                                                ) : (
                                                    <div className="pieceMaterialImagePlaceholder" aria-hidden="true">
                                                        {item.name.slice(0, 1)}
                                                    </div>
                                                )}
                                                <div className="pieceMaterialContent">
                                                    <h4>{item.name}</h4>
                                                    {item.description && <p>{item.description}</p>}
                                                    {visibleAttributes.length > 0 && (
                                                        <dl className="pieceMaterialAttributes">
                                                            {visibleAttributes.map(({ attribute, value }) => (
                                                                <div key={attribute.id}>
                                                                    <dt>{attribute.name}</dt>
                                                                    <dd>{formatAttributeValue({ ...attribute, value })}</dd>
                                                                </div>
                                                            ))}
                                                        </dl>
                                                    )}
                                                    {itemEnergyTags.length > 0 && (
                                                        <div className="pieceMaterialTags">
                                                            {itemEnergyTags.map((tag) => <span key={tag}>{tag}</span>)}
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <p className="pieceDetailEmpty">Esta pieza todavía no tiene insumos asociados.</p>
                )}
            </section>

            {relatedProducts.length > 0 && (
                <section className="pieceDetailSection relatedPieces">
                    <div className="pieceDetailSectionHeader">
                        <p>También puede resonar con vos</p>
                        <h2>Más {getTypePluralLabel(product.type)}</h2>
                    </div>
                    <div className="relatedPiecesGrid">
                        {relatedProducts.map((relatedProduct) => (
                            <SmoothRouteLink href={`/piezas/${relatedProduct.id}`} key={relatedProduct.id} className="relatedPieceCard">
                                <Image src={relatedProduct.imageUrl} alt={relatedProduct.name} width={260} height={260} />
                                <span>{relatedProduct.name}</span>
                                <p>{formatPrice(relatedProduct.price)}</p>
                                <FaArrowRightLong />
                            </SmoothRouteLink>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
