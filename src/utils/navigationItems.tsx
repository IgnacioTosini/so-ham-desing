import Image from "next/image";

export const navigationItems = [
    { id: 'viewPieces', label: 'Ver Piezas' },
    { id: 'top', label: <Image src="/soHamDesignLogo.png" alt="Inicio" width={45} height={45} /> },
    { id: 'createPiece', label: 'Crear Pieza' },
] as const;