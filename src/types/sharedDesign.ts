import { PieceType } from "./product";

export interface SharedDesign {
    id: string;
    shareCode: string;
    type: PieceType;
    beads: (string | null)[];
    name: string;
    createdAt: Date;
}
