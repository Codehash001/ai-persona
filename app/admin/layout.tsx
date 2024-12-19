import { DashboardShell } from "@/components/admin/dashboard-shell"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
