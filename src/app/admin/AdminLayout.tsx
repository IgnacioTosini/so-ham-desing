import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/next";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <ToastContainer position="top-right" autoClose={2500} />
        <Analytics />
      </body>
    </html>
  );
}