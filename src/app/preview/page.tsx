import { redirect } from 'next/navigation';

export default function LegacyPreviewPage() {
    redirect('/admin/designs');
}
