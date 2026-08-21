import type { Metadata } from 'next';
import { IoArrowForward } from 'react-icons/io5';
import { getAllSharedDesigns } from '@/actions/design.action';
import { getPublicCatalog } from '@/actions/catalog.action';
import { SharedDesignsClient } from '@/components/ui/shareDesignPage/SharedDesignsClient';
import { ShareDesignItem } from '@/components/ui/shareDesignPage/shareDesignItem/ShareDesignItem';
import { SmoothRouteLink } from '@/components/ui/SmoothRouteLink';
import './_sharedDesignsPage.scss';

export const metadata: Metadata = {
    title: 'Diseños compartidos',
    description: 'Explora pulseras y collares creados por la comunidad de So Ham Design.',
    alternates: {
        canonical: '/disenos',
    },
};

export default async function SharedDesignsPage() {
    const [designs, categories] = await Promise.all([
        getAllSharedDesigns(),
        getPublicCatalog(),
    ]);
    const items = categories.flatMap((category) => category.items);

    return (
        <main className="sharedDesignsPage">
            <SharedDesignsClient>
                <section className="sharedDesignsIntro">
                    <div className="sharedDesignsIntroContent">
                        <span className="sharedDesignsEyebrow">Creaciones de la comunidad</span>
                        <h1>Diseños que empezaron con una intención.</h1>
                        <p>
                            Pulseras y collares armados componente por componente en el simulador.
                            Cada combinación guarda una idea distinta.
                        </p>
                        <SmoothRouteLink href="/#simulator" className="sharedDesignsPrimaryAction">
                            Crear mi diseño
                            <IoArrowForward aria-hidden="true" />
                        </SmoothRouteLink>
                    </div>
                </section>

                <section className="sharedDesignsGallery" aria-labelledby="shared-designs-title">
                    <div className="sharedDesignsContainer">
                        <header className="sharedDesignsHeader">
                            <div>
                                <span className="sharedDesignsCount">
                                    {designs.length} {designs.length === 1 ? 'diseño compartido' : 'diseños compartidos'}
                                </span>
                                <h2 id="shared-designs-title">Piezas creadas por otras personas</h2>
                            </div>
                            <p>Entrá a cualquiera para verla en detalle o usala como punto de partida.</p>
                        </header>

                        {designs.length > 0 ? (
                            <div className="sharedDesignsGrid">
                                {designs.map((design) => (
                                    <ShareDesignItem key={design.id} design={design} items={items} />
                                ))}
                            </div>
                        ) : (
                            <div className="sharedDesignsEmpty">
                                <h2>Todavía no hay diseños compartidos.</h2>
                                <p>El primero puede empezar desde el simulador.</p>
                                <SmoothRouteLink href="/#simulator">Ir al simulador</SmoothRouteLink>
                            </div>
                        )}
                    </div>
                </section>
            </SharedDesignsClient>
        </main>
    );
}
