import type { PieceType, Product } from "@/types";

interface BuildWhatsappMessageParams {
    type: PieceType;
    stones?: string[];
    completedPiece?: Product;
}

export function buildWhatsappMessageCreatePiece({ type, stones }: BuildWhatsappMessageParams) {
    const message = `Hola! Quiero encargar un${type === 'NECKLACE' ? '' : 'a'} ${type === 'NECKLACE' ? 'collar' : 'pulsera'} con estas piedras: ${stones?.join(', ') || ''}.`;
    const phoneNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? process.env.WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsappMessageCompletePiece({ type, completedPiece }: BuildWhatsappMessageParams) {
    const message = `Hola! Quiero encargar est${type === 'NECKLACE' ? 'e' : 'a'} ${type === 'NECKLACE' ? 'collar' : 'pulsera'} ${completedPiece?.name || ''} que sale $${completedPiece?.price || ''}.`;
    const phoneNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? process.env.WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export const buildWhatsappMessagePreview = ({
    piece,
    previewUrl,
}: {
    piece: PieceType;
    previewUrl: string;
}) => {
    const message =
        `Hola! Te mando mi diseño de ${piece === "NECKLACE" ? "collar" : "pulsera"}.\n` +
        `Miralo acá: ${previewUrl}`;

    const phoneNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};
