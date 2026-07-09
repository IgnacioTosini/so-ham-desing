import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import { getProductById, getProducts } from "@/actions/product.action";
import { BraceletSizeGuide } from "@/components/ui/braceletSizeGuide/BraceletSizeGuide";
import { buildWhatsappMessageCompletePiece } from "@/utils";
import { getSiteUrl } from "@/utils/siteUrl";
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
    const stones = product.stones.map(({ stone }) => stone);
    const energyTags = uniqueValues(stones.flatMap((stone) => stone.energyTags));
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
            <section className="pieceDetailHero">
                <div className="pieceDetailMedia">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={860}
                        height={980}
                        className="pieceDetailImage"
                        priority
                    />
                </div>

                <div className="pieceDetailIntro">
                    <Link href="/#viewPieces" className="pieceDetailBack">
                        <FaArrowLeftLong />
                        Volver a piezas
                    </Link>
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
                    <h2>Piedras de esta pieza</h2>
                </div>

                {stones.length > 0 ? (
                    <div className="pieceStoneGrid">
                        {stones.map((stone) => (
                            <article key={stone.id} className="pieceStoneCard">
                                <Image src={stone.imageUrl} alt={stone.name} width={180} height={180} className="pieceStoneImage" />
                                <div>
                                    <h3>{stone.name}</h3>
                                    <p>{stone.description}</p>
                                    {stone.energyTags.length > 0 && (
                                        <div className="pieceStoneTags">
                                            {stone.energyTags.map((tag) => (
                                                <span key={tag}>{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="pieceDetailEmpty">Esta pieza todavía no tiene piedras asociadas.</p>
                )}
            </section>

            {gallery.length > 1 && (
                <section className="pieceDetailSection">
                    <div className="pieceDetailSectionHeader">
                        <p>Galería</p>
                        <h2>Detalles visuales</h2>
                    </div>
                    <div className="pieceGallery">
                        {gallery.map((imageUrl, index) => (
                            <Image
                                key={imageUrl}
                                src={imageUrl}
                                alt={`${product.name} detalle ${index + 1}`}
                                width={420}
                                height={420}
                                className="pieceGalleryImage"
                            />
                        ))}
                    </div>
                </section>
            )}

            {relatedProducts.length > 0 && (
                <section className="pieceDetailSection relatedPieces">
                    <div className="pieceDetailSectionHeader">
                        <p>También puede resonar con vos</p>
                        <h2>Más {getTypePluralLabel(product.type)}</h2>
                    </div>
                    <div className="relatedPiecesGrid">
                        {relatedProducts.map((relatedProduct) => (
                            <Link href={`/piezas/${relatedProduct.id}`} key={relatedProduct.id} className="relatedPieceCard">
                                <Image src={relatedProduct.imageUrl} alt={relatedProduct.name} width={260} height={260} />
                                <span>{relatedProduct.name}</span>
                                <p>{formatPrice(relatedProduct.price)}</p>
                                <FaArrowRightLong />
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
