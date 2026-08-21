import type { Metadata } from 'next';
import './_preparandoWhatsapp.scss';

export const metadata: Metadata = {
    title: 'Preparando WhatsApp',
    robots: {
        index: false,
        follow: false,
    },
};

export default function PreparingWhatsappPage() {
    return (
        <main className="preparingWhatsapp">
            <section className="preparingWhatsappCard" aria-live="polite">
                <span className="preparingWhatsappMonogram" aria-hidden="true">SH</span>
                <p className="preparingWhatsappEyebrow">SO HAM DESIGN</p>
                <h1>Preparando tu diseño</h1>
                <p>En un momento vas a continuar en WhatsApp.</p>
                <span className="preparingWhatsappLoader" aria-hidden="true" />
            </section>
        </main>
    );
}
