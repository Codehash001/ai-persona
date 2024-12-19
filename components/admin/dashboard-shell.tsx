"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Settings, 
  Users,
  MessageSquare 
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin"
    },
    {
      href: "/admin/personas",
      label: "Personas",
      icon: Users,
      active: pathname === "/admin/personas"
    },
    {
      href: "/admin/conversations",
      label: "Conversations",
      icon: MessageSquare,
      active: pathname === "/admin/conversations"
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/admin/settings"
    }
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 z-50 flex w-64 flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-background border-r">
          <div className="flex h-16 items-center border-b px-6 font-semibold">
            Admin Dashboard
          </div>
          <nav className="flex-1 overflow-auto py-4">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-6 py-2.5 text-sm font-medium",
                    route.active 
                      ? "bg-secondary text-secondary-foreground" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                  )}
                >
                  <route.icon className="h-4 w-4 shrink-0" />
                  <span>{route.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64 w-full">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-[63px] items-center justify-between px-6">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href="/"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                )}
              >
                Back to Site
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
