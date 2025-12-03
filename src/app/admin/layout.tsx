
import type { ReactNode } from "react";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminShell from "@/components/Admin/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell sidebar={<AdminSidebar />}>{children}</AdminShell>
  );
}