"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IoAdd, IoRemove, IoRefresh } from "react-icons/io5";

export default function ZoomableImage({ src, alt }: { src: string; alt: string }) {
    const [zoom, setZoom] = useState(1);
    const stage = useRef<HTMLDivElement>(null);
    const [ratio, setRatio] = useState(0.8);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const zoomValue = useRef(1);
    const anchor = useRef<{ left: number; top: number } | null>(null);
    const viewport = useRef<HTMLDivElement>(null);
    const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

    useLayoutEffect(() => {
        const element = stage.current;
        if (!element) return;
        const resize = () => {
            const width = Math.min(element.clientWidth, element.clientHeight * ratio);
            setSize({ width, height: width / ratio });
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(element);
        return () => observer.disconnect();
    }, [ratio]);

    const changeZoom = useCallback((value: number, point?: { x: number; y: number }) => {
        const next = Math.min(3, Math.max(1, value));
        const element = viewport.current;
        if (element) {
            const x = point?.x ?? element.clientWidth / 2;
            const y = point?.y ?? element.clientHeight / 2;
            const scale = next / zoomValue.current;
            anchor.current = {
                left: (element.scrollLeft + x) * scale - x,
                top: (element.scrollTop + y) * scale - y,
            };
        }
        zoomValue.current = next;
        setZoom(next);
    }, []);

    useLayoutEffect(() => {
        if (viewport.current && anchor.current) {
            viewport.current.scrollLeft = anchor.current.left;
            viewport.current.scrollTop = anchor.current.top;
            anchor.current = null;
        }
    }, [zoom]);

    useEffect(() => {
        const element = viewport.current;
        if (!element) return;
        const handleWheel = (event: WheelEvent) => {
            // A non-passive listener keeps the wheel inside the image viewer.
            event.preventDefault();
            if (event.deltaY === 0) return;
            const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
            const step = Math.max(-0.25, Math.min(0.25, pixels * 0.002));
            const rect = element.getBoundingClientRect();
            changeZoom(zoomValue.current - step, { x: event.clientX - rect.left, y: event.clientY - rect.top });
        };
        element.addEventListener("wheel", handleWheel, { passive: false });
        return () => element.removeEventListener("wheel", handleWheel);
    }, [changeZoom]);

    return <div className="productGalleryZoom">
        <div className="productGalleryZoomControls" role="group" aria-label="Controles de zoom">
            <span className="productGalleryZoomLabel">Zoom</span>
            <button type="button" aria-label="Reducir zoom" disabled={zoom === 1} onClick={() => changeZoom(zoom - 0.5)}><IoRemove /></button>
            <output aria-live="polite">{Math.round(zoom * 100)}%</output>
            <button type="button" aria-label="Aumentar zoom" disabled={zoom === 3} onClick={() => changeZoom(zoom + 0.5)}><IoAdd /></button>
            <button type="button" aria-label="Restablecer zoom" disabled={zoom === 1} onClick={() => changeZoom(1)}><IoRefresh /></button>
        </div>
        <div className="productGalleryZoomStage" ref={stage}>
        <div
            style={{ width: size.width || "100%", height: size.height || "100%" }}
            ref={viewport}
            className="productGalleryZoomViewport"
            data-zoomed={zoom > 1}
            tabIndex={0}
            role="region"
            aria-label="Imagen con zoom. Usá los controles para ampliar y desplazate para explorar."
            onTouchStart={event => event.stopPropagation()}
            onTouchEnd={event => event.stopPropagation()}
            onKeyDown={event => {
                event.stopPropagation();
                if (event.key === "+" || event.key === "=") { event.preventDefault(); changeZoom(zoom + 0.5); }
                if (event.key === "-") { event.preventDefault(); changeZoom(zoom - 0.5); }
                if (event.key === "0") { event.preventDefault(); changeZoom(1); }
            }}
            onDoubleClick={() => changeZoom(zoom === 1 ? 2 : 1)}
            onPointerDown={event => {
                if (zoom === 1 || event.pointerType !== "mouse" || event.button !== 0) return;
                event.preventDefault();
                const element = event.currentTarget;
                drag.current = { x: event.clientX, y: event.clientY, left: element.scrollLeft, top: element.scrollTop };
                element.setPointerCapture(event.pointerId);
            }}
            onPointerMove={event => {
                if (!drag.current) return;
                event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
                event.currentTarget.scrollTop = drag.current.top - (event.clientY - drag.current.y);
            }}
            onPointerUp={() => { drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}
            onLostPointerCapture={() => { drag.current = null; }}
        >
            <div style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
                <Image src={src} alt={alt} width={1600} height={2000} sizes="(max-width: 560px) 150vw, 1600px" draggable={false} onLoad={event => {
                    const image = event.currentTarget;
                    if (image.naturalWidth && image.naturalHeight) setRatio(image.naturalWidth / image.naturalHeight);
                }} />
            </div>
        </div>
        </div>
        <p className="productGalleryZoomHint">Usá la ruedita o los botones + / − para ampliar. Arrastrá la foto para explorar.</p>
    </div>;
}
