import { PieceType, Product } from "@/types";

interface BuildWhatsappMessageParams {
    type: PieceType;
    stones?: string[];
    completedPiece?: Product;
}

export function buildWhatsappMessageCreatePiece({ type, stones }: BuildWhatsappMessageParams) {
    const message = `Hola! Quiero encargar un${type === 'NECKLACE' ? 'a' : ''} ${type} con estas piedras: ${stones?.join(', ') || ''}.`;
    const phoneNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? process.env.WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsappMessageCompletePiece({ type, completedPiece }: BuildWhatsappMessageParams) {
    const message = `Hola! Quiero encargar est${type === 'NECKLACE' ? 'a' : 'e'} ${type} ${completedPiece?.name || ''} que sale $${completedPiece?.price || ''}.`;
    const phoneNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? process.env.WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

