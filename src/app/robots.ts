import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/utils/siteUrl";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl();

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/admin/", "/admin/*", "/preview"],
            },
            {
                userAgent: "facebookexternalhit",
                allow: "/",
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
