import { Analytics } from "@vercel/analytics/next";
import AdminShell from "@/components/admin/AdminShell";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminShell>{children}</AdminShell>
      <ToastContainer position="top-right" autoClose={2500} />
      <Analytics />
    </>
  );
}
