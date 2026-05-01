import "server-only";
import { createHash } from "node:crypto";

type CloudinaryCredentials = {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
};

const sanitizeName = (value: string): string =>
    value
        .replace(/[\\/]+/g, "-")
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 120) || "project-image";

export const getCloudinaryCloudName = (): string | undefined => {
    const fromExplicitVar = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    if (fromExplicitVar) return fromExplicitVar;

    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
    if (!cloudinaryUrl) return undefined;

    const cloudNameFromUrl = cloudinaryUrl.match(/@([^/]+)$/)?.[1]?.trim();
    return cloudNameFromUrl || undefined;
};

const getCloudinaryCredentials = (): CloudinaryCredentials | undefined => {
    const cloudName = getCloudinaryCloudName();

    const explicitApiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const explicitApiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (cloudName && explicitApiKey && explicitApiSecret) {
        return {
            cloudName,
            apiKey: explicitApiKey,
            apiSecret: explicitApiSecret,
        };
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
    if (!cloudinaryUrl) return undefined;

    const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)$/);
    if (!match) return undefined;

    const [, apiKey, apiSecret, cloudNameFromUrl] = match;

    return {
        cloudName: cloudNameFromUrl,
        apiKey,
        apiSecret,
    };
};

export const extractCloudinaryPublicId = (url: string): string | null => {
    if (!url.includes("/res.cloudinary.com/")) return null;

    const [urlWithoutQuery] = url.split("?");
    const uploadSegment = "/image/upload/";
    const uploadIndex = urlWithoutQuery.indexOf(uploadSegment);

    if (uploadIndex === -1) return null;

    const afterUpload = urlWithoutQuery.slice(uploadIndex + uploadSegment.length);
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    const withoutExtension = withoutVersion.replace(/\.[^.\/]+$/, "");

    return withoutExtension || null;
};

export const destroyCloudinaryImage = async (publicId: string): Promise<void> => {
    const credentials = getCloudinaryCredentials();
    if (!credentials) {
        throw new Error("No se encontraron credenciales de Cloudinary para eliminar imágenes");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `public_id=${publicId}&timestamp=${timestamp}${credentials.apiSecret}`;
    const signature = createHash("sha1").update(signaturePayload).digest("hex");

    const body = new URLSearchParams({
        public_id: publicId,
        timestamp: String(timestamp),
        api_key: credentials.apiKey,
        signature,
    });

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${credentials.cloudName}/image/destroy`,
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        }
    );

    if (!response.ok) {
        throw new Error(`Cloudinary destroy failed: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as { result?: string };
    if (!result.result || (result.result !== "ok" && result.result !== "not found")) {
        throw new Error(`Cloudinary destroy error: ${JSON.stringify(result)}`);
    }
};

export const uploadBase64ImageToCloudinary = async (base64: string, fileName: string): Promise<string> => {
    const cloudName = getCloudinaryCloudName();
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
    const folder = process.env.CLOUDINARY_FOLDER?.trim();

    if (!cloudName) {
        throw new Error("Falta CLOUDINARY_CLOUD_NAME o CLOUDINARY_URL");
    }

    if (!uploadPreset) {
        throw new Error("Falta CLOUDINARY_UPLOAD_PRESET");
    }

    const body = new FormData();
    body.append("file", base64);
    body.append("upload_preset", uploadPreset);
    body.append("filename_override", sanitizeName(fileName));
    if (folder) body.append("folder", folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body,
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const result = (await response.json()) as { secure_url?: string; url?: string };
    const uploadedUrl = result.secure_url ?? result.url;

    if (!uploadedUrl) {
        throw new Error(`Cloudinary upload sin URL: ${JSON.stringify(result)}`);
    }

    return uploadedUrl;
};