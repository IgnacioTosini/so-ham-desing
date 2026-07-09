import { Title } from "@/components/ui/Title/Title";
import { getAllSharedDesigns } from "@/actions/design.action";
import { ShareDesignItem } from "@/components/ui/shareDesignPage/shareDesignItem/ShareDesignItem";
import { requireAdminSession } from "@/lib/adminAuth";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { PreviewPageClient } from "./PreviewPageClient";
import "@/components/admin/_adminShell.scss";
import "./_previewPage.scss";

export const metadata = {
    title: "Diseños personalizados",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function PreviewPage() {
    await requireAdminSession();

    const designs = await getAllSharedDesigns();

    return (
        <div className="adminShell">
            <AdminNavbar />
            <main className="adminShellMain">
                <div className="previewPage">
                    <PreviewPageClient>
                        <div className="previewContainer">
                            <div className="adminPageHeader">
                                <div>
                                    <span className="adminEyebrow">{designs.length} diseños guardados</span>
                                    <Title title="Diseños personalizados" subTitle="Pedidos enviados desde el simulador." />
                                </div>
                            </div>
                            <div className="previewList">
                                {
                                    designs.map(design => (
                                        <ShareDesignItem key={design.id} design={design} canDelete />
                                    ))
                                }
                            </div>
                        </div>
                    </PreviewPageClient>
                </div>
            </main>
        </div>
    );
}
