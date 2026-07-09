import type { MetadataRoute } from "next";
import { getProducts } from "@/actions/product.action";
import { getSiteUrl } from "@/utils/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getSiteUrl();
    const products = await getProducts();

    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        ...products.map((product) => ({
            url: `${siteUrl}/piezas/${product.id}`,
            lastModified: product.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
    ];
}
