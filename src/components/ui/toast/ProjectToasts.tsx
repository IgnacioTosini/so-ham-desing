"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./_toast.scss";

export default function ProjectToasts() {
  return (
    <ToastContainer
      className="project-toasts"
      position="top-right"
      autoClose={2500}
      theme="dark"
      aria-label="Notificaciones"
    />
  );
}
