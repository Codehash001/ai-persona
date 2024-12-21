"use client"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export default function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="mt-4">
          <AdminDashboard />
        </div>
      </div>
    </QueryClientProvider>
  )
}
