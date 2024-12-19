"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  MessageSquare,
  Users,
  Activity,
  MessagesSquare
} from "lucide-react"

export function DashboardOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard")
      if (!response.ok) throw new Error("Failed to fetch dashboard stats")
      return response.json()
    },
  })

  if (isLoading) {
    return <div>Loading dashboard stats...</div>
  }

  const cards = [
    {
      title: "Total Conversations",
      value: stats?.totalConversations ?? 0,
      description: `${stats?.messagesLast24Hours ?? 0} new in last 24h`,
      icon: MessageSquare
    },
    {
      title: "Total Messages",
      value: stats?.totalMessages ?? 0,
      description: `${stats?.avgMessagesPerConversation ?? 0} avg per conversation`,
      icon: MessagesSquare
    },
    {
      title: "Active Personas",
      value: stats?.activePersonas ?? 0,
      description: `${stats?.totalPersonas ?? 0} total personas`,
      icon: Users
    },
    {
      title: "Messages Last 24h",
      value: stats?.messagesLast24Hours ?? 0,
      description: "Message activity",
      icon: Activity
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}