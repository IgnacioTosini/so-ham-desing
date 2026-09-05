"use client";

import { useState } from "react";
import { IoArrowForward, IoEyeOutline, IoEyeOffOutline, IoLockClosedOutline } from "react-icons/io5";

export default function AdminLoginForm({ next, error }: { next: string; error: string }) {
    const [visible, setVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    return <form action="/api/admin/login" method="post" onSubmit={() => setSubmitting(true)}>
        <input type="hidden" name="next" value={next} />
        <label htmlFor="password">Tu contraseña</label>
        <div className="adminLoginPassword">
            <IoLockClosedOutline aria-hidden="true" />
            <input id="password" name="password" type={visible ? "text" : "password"} required autoComplete="current-password" placeholder="Ingresá tu contraseña" aria-invalid={error === "invalid"} aria-describedby={error ? "login-error" : undefined} />
            <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible}>{visible ? <IoEyeOffOutline /> : <IoEyeOutline />}</button>
        </div>
        {error && <p id="login-error" className="adminLoginError" role="alert">{error === "invalid" ? "La contraseña no es correcta. Volvé a intentarlo." : "El acceso no está disponible en este momento. Contactá a quien administra el sitio."}</p>}
        <button type="submit" className="adminLoginSubmit" disabled={submitting}>{submitting ? "Ingresando…" : "Entrar al panel"}<IoArrowForward /></button>
    </form>;
}
