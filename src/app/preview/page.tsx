import { Title } from "@/components/ui/Title/Title";
import { getAllSharedDesigns } from "@/actions/design.action";
import { ShareDesignItem } from "@/components/ui/shareDesignPage/shareDesignItem/ShareDesignItem";
import { hasAdminSession } from "@/lib/adminAuth";
import { PreviewPageClient } from "./PreviewPageClient";
import "./_previewPage.scss";

export default async function PreviewPage() {
    const designs = await getAllSharedDesigns();
    const canDelete = await hasAdminSession();

    return (
        <main className="previewPage">
            <PreviewPageClient>
                <div className="previewContainer">
                    <Title title="Lista de diseños de clientes" subTitle="Mira los diseños personalizados." />
                    <div className="previewList">
                        {
                            designs.map(design => (
                                <ShareDesignItem key={design.id} design={design} canDelete={canDelete} />
                            ))
                        }
                    </div>
                </div>
            </PreviewPageClient>
        </main>
    );
}