"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IoChevronBack, IoChevronForward, IoExpandOutline, IoClose } from "react-icons/io5";
import "./_productGallery.scss";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
    const [active, setActive] = useState(0);
    const [open, setOpen] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const touch = useRef<number | null>(null);
    const move = (step: number) => setActive(index => (index + step + images.length) % images.length);
    useEffect(() => {
        if (!open) return;
        const element = dialog.current;
        const opener = trigger.current;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        element?.showModal();
        return () => { element?.close(); document.body.style.overflow = previous; opener?.focus(); };
    }, [open]);
    const controls = <div className="productGalleryControls">
        {images.length > 1 && <button type="button" aria-label="Foto anterior" onClick={() => move(-1)}><IoChevronBack /></button>}
        <span aria-live="polite"><strong>{String(active + 1).padStart(2, "0")}</strong><span> / {String(images.length).padStart(2, "0")}</span></span>
        {images.length > 1 && <button type="button" aria-label="Foto siguiente" onClick={() => move(1)}><IoChevronForward /></button>}
    </div>;
    return <div className="productGallery" role="region" aria-label={`Fotos de ${name}`} onKeyDown={event => {
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    }} onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => {
        if (touch.current !== null) { const delta = touch.current - event.changedTouches[0].clientX; if (Math.abs(delta) > 50) move(delta > 0 ? 1 : -1); }
        touch.current = null;
    }}>
        <div className="productGalleryStage">
        <button type="button" className="productGalleryMain" ref={trigger} onClick={() => setOpen(true)} aria-label={`Ampliar foto ${active + 1} de ${name}`}>
            <Image key={images[active]} src={images[active]} alt={`${name}, foto ${active + 1}`} width={800} height={1000} priority sizes="(max-width: 820px) 100vw, 50vw" />
            <span><IoExpandOutline /> Ampliar</span>
        </button>
        {controls}
        </div>
        <div className="productGalleryCaption"><span>La pieza, en detalle</span><span>{images.length > 1 ? "Explorá sus ángulos" : "Hecha a mano"}</span></div>
        {images.length > 1 && <div className="productGalleryThumbnails">{images.map((url, index) => <button key={url} type="button" aria-label={`Ver foto ${index + 1}`} aria-pressed={index === active} onClick={() => setActive(index)}>
            <Image src={url} alt={`${name}, miniatura ${index + 1}`} width={80} height={100} />
        </button>)}</div>}
        <dialog ref={dialog} className="productGalleryModal" aria-label={`Fotos ampliadas de ${name}`} onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
            {open && <div className="productGalleryModalContent">
                <div className="productGalleryModalHeader"><div><span>SO HAM DESIGN</span><p>{name}</p></div><button type="button" className="productGalleryClose" autoFocus onClick={() => setOpen(false)} aria-label="Cerrar fotos ampliadas"><IoClose /><span>Cerrar</span></button></div>
                <Image key={images[active]} src={images[active]} alt={`${name}, foto ${active + 1} ampliada`} width={1600} height={2000} sizes="100vw" />
                {controls}
            </div>}
        </dialog>
    </div>;
}
