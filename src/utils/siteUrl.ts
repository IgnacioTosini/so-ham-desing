const DEFAULT_SITE_URL = "https://so-ham-desing.vercel.app";

export const getSiteUrl = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
    return siteUrl.replace(/\/+$/, "");
};
