import Link from "next/link";
import { requireAdminSession } from "@/lib/adminAuth";
import StoneForm from "@/components/stoneForm/StoneForm";
import "../_adminStonePage.scss";

export default async function NewStonePage() {
    await requireAdminSession();

    return (
        <div className="adminStonesPage">
            <Link href="/admin/stones" className="backLink">← Volver a piedras</Link>
            <div className="adminStonesPageContainer">
                <h1>Admin - Nueva piedra</h1>
                <StoneForm mode="create" />
            </div>
        </div>
    );
}
