import Image from "next/image";
import { Stone } from "@/types";
import './_stonePanel.scss';

interface Props {
    stones: Stone[];
    onStoneClick: (stoneId: string) => void;
    isBeadSelected: boolean;
    activeStoneId: string | null;
}

export const StonePanel = ({ stones, onStoneClick, isBeadSelected, activeStoneId }: Props) => {
    return (
        <div className="stonePanel">
            <div className="stonePanelHeader">
                <p className="stonePanelTitle">Piedras</p>
                <span className={isBeadSelected ? 'stonePanelState isReady' : 'stonePanelState'}>
                    {isBeadSelected ? 'Cuenta activa' : 'Elegí una cuenta'}
                </span>
            </div>
            <div className="stonePanelGrid">
                {stones.map((stone) => (
                    <button
                        key={stone.id}
                        type="button"
                        className={activeStoneId === stone.id ? 'stonePanelItem isActive' : 'stonePanelItem'}
                        onClick={() => onStoneClick(stone.id)}
                        disabled={!isBeadSelected}
                        aria-pressed={activeStoneId === stone.id}
                    >
                        <div className="stonePanelImageWrapper">
                            <Image
                                src={stone.imageUrl}
                                alt={stone.name}
                                width={80}
                                height={80}
                                className="stonePanelImage"
                            />
                        </div>
                        <span className="stonePanelName">{stone.name}</span>
                    </button>
                ))}
            </div>
            <p className="stonePanelTip">
                Tip: tocá un lugar del círculo y luego una piedra, o al revés.
            </p>
        </div>
    );
};
