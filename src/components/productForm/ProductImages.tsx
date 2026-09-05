"use client";

import { useEffect, useRef, useState } from "react";
import "./_productImages.scss";

export interface ProductPhoto { id: string; url: string; file?: File; }

export default function ProductImages({ photos, onChange, disabled, onError, onEditingChange }: {
    photos: ProductPhoto[]; onChange: (photos: ProductPhoto[]) => void; disabled: boolean; onError: (message: string) => void;
    onEditingChange: (editing: boolean) => void;
}) {
    const [editing, setEditing] = useState<ProductPhoto | null>(null);
    const [zoom, setZoom] = useState(1);
    const [x, setX] = useState(50);
    const [y, setY] = useState(50);
    const [busy, setBusy] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const canvas = useRef<HTMLCanvasElement>(null);
    const source = useRef<HTMLImageElement | null>(null);
    const urls = useRef<string[]>([]);
    const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
    useEffect(() => { const ownedUrls = urls.current; return () => ownedUrls.forEach(URL.revokeObjectURL); }, []);
    useEffect(() => { onEditingChange(Boolean(editing)); }, [editing, onEditingChange]);
    useEffect(() => {
        if (!editing) return;
        let cancelled = false;
        source.current = null;
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { if (!cancelled) { source.current = img; draw(); setLoaded(true); } };
        img.onerror = () => { if (!cancelled) { onError("No se pudo abrir la imagen para ajustar. Probá cargarla desde tu dispositivo."); setEditing(null); } };
        img.src = editing.url;
        function draw() {
            const ctx = canvas.current?.getContext("2d");
            if (!ctx) return;
            const scale = Math.max(800 / img.width, 1000 / img.height);
            ctx.clearRect(0, 0, 800, 1000);
            ctx.drawImage(img, (800 - img.width * scale) / 2, (1000 - img.height * scale) / 2, img.width * scale, img.height * scale);
        }
        return () => { cancelled = true; };
    }, [editing, onError]);
    useEffect(() => {
        const img = source.current;
        const ctx = canvas.current?.getContext("2d");
        if (!img || !ctx) return;
        const scale = Math.max(800 / img.width, 1000 / img.height) * zoom;
        ctx.clearRect(0, 0, 800, 1000);
        ctx.drawImage(img, (800 - img.width * scale) * x / 100, (1000 - img.height * scale) * y / 100, img.width * scale, img.height * scale);
    }, [zoom, x, y, loaded]);
    const add = (files: FileList | null) => {
        if (!files || disabled) return;
        const list = Array.from(files);
        if (photos.length + list.length > 6) return onError("Podés cargar hasta 6 fotos por producto.");
        if (list.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) return onError("Usá imágenes JPG, PNG o WebP de hasta 5 MB cada una.");
        onChange([...photos, ...list.map(file => {
            const url = URL.createObjectURL(file); urls.current.push(url);
            return { id: crypto.randomUUID(), url, file };
        })]);
    };
    const apply = async () => {
        if (!canvas.current || !editing || !source.current) return;
        setBusy(true);
        try {
            const blob = await new Promise<Blob>((resolve, reject) => canvas.current!.toBlob(value => value ? resolve(value) : reject(new Error()), "image/jpeg", 0.92));
            const url = URL.createObjectURL(blob); urls.current.push(url);
            onChange(photos.map(photo => photo.id === editing.id ? { ...photo, url, file: new File([blob], "producto.jpg", { type: "image/jpeg" }) } : photo));
            setEditing(null);
        } catch { onError("No se pudo aplicar el encuadre. Probá cargar la foto desde tu dispositivo."); }
        finally { setBusy(false); }
    };
    return <fieldset className="productPhotos" disabled={disabled || busy}>
        <legend>Fotos del producto ({photos.length}/6)</legend>
        <p>La primera foto es la portada. Podés ajustar cada imagen antes de guardar.</p>
        <label className="productPhotosUpload" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); add(event.dataTransfer.files); }}>
            Agregar fotos o arrastrarlas acá
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => { add(event.target.files); event.target.value = ""; }} />
            <small>JPG, PNG o WebP · hasta 5 MB por foto</small>
        </label>
        <div className="productPhotosGrid">{photos.map((photo, index) => <article key={photo.id}>
            {/* Local previews must also support blob URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={`Foto ${index + 1} del producto`} />
            <strong>{index === 0 ? "Portada" : `Foto ${index + 1}`}</strong>
            <button type="button" onClick={() => { setLoaded(false); setZoom(1); setX(50); setY(50); setEditing(photo); }}>Ajustar encuadre</button>
            {index > 0 && <button type="button" onClick={() => onChange([photo, ...photos.filter(p => p.id !== photo.id)])}>Usar como portada</button>}
            <button type="button" onClick={() => { onChange(photos.filter(p => p.id !== photo.id)); if (editing?.id === photo.id) setEditing(null); }}>Quitar foto</button>
        </article>)}</div>
        {editing && <div className="productPhotoEditor">
            <h3>Ajustar encuadre</h3><p>Arrastrá la imagen o usá los controles. Se guarda el encuadre que ves acá.</p>
            <canvas ref={canvas} width={800} height={1000} aria-label="Vista previa del encuadre" onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, left: x, top: y }; }} onPointerMove={event => {
                if (!drag.current || !source.current) return;
                const img = source.current;
                const scale = Math.max(800 / img.width, 1000 / img.height) * zoom;
                const ratio = 800 / event.currentTarget.getBoundingClientRect().width;
                const dx = img.width * scale - 800; const dy = img.height * scale - 1000;
                if (dx > 0) setX(Math.max(0, Math.min(100, drag.current.left - (event.clientX - drag.current.x) * ratio / dx * 100)));
                if (dy > 0) setY(Math.max(0, Math.min(100, drag.current.top - (event.clientY - drag.current.y) * ratio / dy * 100)));
            }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} />
            <label>Zoom {zoom.toFixed(1)}×<input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} /></label>
            <label>Posición horizontal<input type="range" min="0" max="100" value={x} onChange={e => setX(Number(e.target.value))} /></label>
            <label>Posición vertical<input type="range" min="0" max="100" value={y} onChange={e => setY(Number(e.target.value))} /></label>
            <button type="button" onClick={() => { setZoom(1); setX(50); setY(50); }}>Centrar y restablecer</button>
            <button type="button" disabled={!loaded} onClick={apply}>Aplicar encuadre</button>
            <button type="button" onClick={() => setEditing(null)}>Cancelar ajuste</button>
        </div>}
    </fieldset>;
}
