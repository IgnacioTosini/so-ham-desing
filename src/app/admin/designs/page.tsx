import type { Metadata } from 'next';
import { IoOpenOutline } from 'react-icons/io5';
import { getAllSharedDesigns } from '@/actions/design.action';
import { getPublicCatalog } from '@/actions/catalog.action';
import { requireAdminSession } from '@/lib/adminAuth';
import { SharedDesignsClient } from '@/components/ui/shareDesignPage/SharedDesignsClient';
import { ShareDesignItem } from '@/components/ui/shareDesignPage/shareDesignItem/ShareDesignItem';
import { SmoothRouteLink } from '@/components/ui/SmoothRouteLink';
import './_adminDesignsPage.scss';

export const metadata: Metadata = {
    title: 'Admin diseños compartidos',
    description: 'Gestión de diseños enviados desde el simulador.',
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminDesignsPage() {
    await requireAdminSession();

    const [designs, categories] = await Promise.all([
        getAllSharedDesigns(),
        getPublicCatalog(),
    ]);
    const items = categories.flatMap((category) => category.items);

    return (
        <div className="adminDesignsPage">
            <SharedDesignsClient>
                <div className="adminDesignsContainer">
                    <header className="adminPageHeader sharedDesignsHeader">
                        <div>
                            <span className="adminEyebrow">
                                {designs.length} {designs.length === 1 ? 'diseño guardado' : 'diseños guardados'}
                            </span>
                            <h1>Diseños compartidos</h1>
                            <p>Revisa las combinaciones enviadas desde el simulador y abre cada pieza en detalle.</p>
                        </div>
                        <SmoothRouteLink href="/disenos" className="adminSecondaryAction">
                            <IoOpenOutline aria-hidden="true" />
                            Ver galería pública
                        </SmoothRouteLink>
                    </header>

                    {designs.length > 0 ? (
                        <div className="adminDesignsGrid">
                            {designs.map((design) => (
                                <ShareDesignItem
                                    key={design.id}
                                    design={design}
                                    items={items}
                                    canDelete
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="adminDesignsEmpty">
                            <h2>No hay diseños guardados.</h2>
                            <p>Los diseños enviados desde el simulador aparecerán en este listado.</p>
                        </div>
                    )}
                </div>
            </SharedDesignsClient>
        </div>
    );
}
