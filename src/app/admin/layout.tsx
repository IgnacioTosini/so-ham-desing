import { Analytics } from "@vercel/analytics/next";
import AdminShell from "@/components/admin/AdminShell";
import ProjectToasts from "@/components/ui/toast/ProjectToasts";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminShell>{children}</AdminShell>
      <ProjectToasts />
      <Analytics />
    </>
  );
}
