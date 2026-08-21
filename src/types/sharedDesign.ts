import { PieceType } from "./product";
import { SharedDesignConfiguration } from "./catalog";

export interface SharedDesign {
    id: string;
    shareCode: string;
    type: PieceType;
    beads: (string | null)[];
    name: string;
    configuration: SharedDesignConfiguration | null;
    createdAt: Date;
}
