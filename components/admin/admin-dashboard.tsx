"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CreatePersonaDialog } from "./create-persona-dialog"
import { OverviewSection } from "./overview-section"
import { ThemeToggle } from "../theme-toggle"

export function AdminDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col space-y-6">


      <main className="container mx-auto">
        <OverviewSection />
      </main>

      <CreatePersonaDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
