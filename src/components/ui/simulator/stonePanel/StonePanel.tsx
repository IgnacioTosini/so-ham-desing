import Image from "next/image";
import { Stone } from "@/types";
import './_stonePanel.scss';

interface Props {
    stones: Stone[];
    onStoneClick: (stoneId: string) => void;
}

export const StonePanel = ({ stones, onStoneClick }: Props) => {
    return (
        <div className="stonePanel">
            <p className="stonePanelTitle">PIEDRAS</p>
            <div className="stonePanelGrid">
                {stones.map((stone) => (
                    <button
                        key={stone.id}
                        type="button"
                        className="stonePanelItem"
                        onClick={() => onStoneClick(stone.id)}
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