import { afterEach, describe, expect, it } from "vitest";
import {
    buildWhatsappMessageCompletePiece,
    buildWhatsappMessageCreatePiece,
    buildWhatsappMessagePreview,
} from "../src/utils/buildWhatsappMessage";
import { getSiteUrl } from "../src/utils/siteUrl";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
});

describe("getSiteUrl", () => {
    it("uses NEXT_PUBLIC_SITE_URL without trailing slashes", () => {
        process.env.NEXT_PUBLIC_SITE_URL = "https://example.com///";

        expect(getSiteUrl()).toBe("https://example.com");
    });

    it("falls back to the production URL", () => {
        delete process.env.NEXT_PUBLIC_SITE_URL;

        expect(getSiteUrl()).toBe("https://so-ham-desing.vercel.app");
    });
});

describe("WhatsApp message builders", () => {
    it("sanitizes the phone number and includes selected stones", () => {
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+54 9 223 123-4567";

        const url = new URL(buildWhatsappMessageCreatePiece({
            type: "BRACELET",
            stones: ["Amatista", "Cuarzo"],
        }));

        expect(url.origin).toBe("https://wa.me");
        expect(url.pathname).toBe("/5492231234567");
        expect(url.searchParams.get("text")).toContain("Amatista, Cuarzo");
    });

    it("includes completed product name and price", () => {
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5492231234567";

        const url = new URL(buildWhatsappMessageCompletePiece({
            type: "NECKLACE",
            completedPiece: {
                id: "product-1",
                name: "Claridad",
                description: null,
                price: 13000,
                imageUrl: "https://example.com/image.jpg",
                type: "NECKLACE",
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            },
        }));

        expect(url.searchParams.get("text")).toContain("collar Claridad");
        expect(url.searchParams.get("text")).toContain("$13000");
    });

    it("builds a clean preview message without unanswered bracelet fields", () => {
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5492231234567";

        const url = new URL(buildWhatsappMessagePreview({
            piece: "BRACELET",
            previewUrl: "https://example.com/preview/abc123",
        }));

        const message = url.searchParams.get("text");

        expect(message).toContain("Diseñé una pulsera en So Ham Design");
        expect(message).toContain("https://example.com/preview/abc123");
        expect(message).toContain("Quisiera consultar por este diseño.");
        expect(message).not.toContain("contorno de muñeca");
        expect(message).not.toContain("Prefiero tanza");
    });

    it("uses the correct article for a necklace preview", () => {
        const url = new URL(buildWhatsappMessagePreview({
            piece: "NECKLACE",
            previewUrl: "https://example.com/preview/collar123",
        }));

        expect(url.searchParams.get("text")).toContain("Diseñé un collar en So Ham Design");
    });
});
