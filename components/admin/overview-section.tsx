"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, Bot, Zap } from "lucide-react"
import { AreaChart, BarChart } from "@tremor/react"

const timeRangeOptions = [
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 2 Weeks", value: "14days" },
  { label: "Last Month", value: "30days" },
] as const

interface StatsData {
  totalConversations: number
  totalUsers: number
  totalMessages: number
  activePersonas: number
  messagesByDate: { date: string; count: number }[]
  personaUsage: { name: string; usage: number }[]
  messagesPerConversation: { conversation: string; messages: number }[]
}

type TimeRange = "7days" | "14days" | "30days"

export function OverviewSection() {
  const [stats, setStats] = useState<StatsData>({
    totalConversations: 0,
    totalUsers: 0,
    totalMessages: 0,
    activePersonas: 0,
    messagesByDate: [],
    personaUsage: [],
    messagesPerConversation: []
  })
  const [timeRange, setTimeRange] = useState<TimeRange>("7days")
  const [conversationsRange, setConversationsRange] = useState<TimeRange>("7days")

  const fetchStats = async (messagesRange: TimeRange, convsRange: TimeRange) => {
    try {
      const response = await fetch(
        `/api/stats?timeRange=${messagesRange}&conversationsRange=${convsRange}`
      )
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchStats(timeRange, conversationsRange)
  }, [timeRange, conversationsRange])

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Personas</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePersonas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Messages Over Time */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <CardTitle>Messages Over Time</CardTitle>
              <div className="flex items-center space-x-2">
                
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="h-8 w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="h-72 mt-4"
              data={stats.messagesByDate}
              index="date"
              categories={["count"]}
              colors={["zinc"]}
              showLegend={false}
              valueFormatter={(value: number) => value.toString()}
            />
          </CardContent>
        </Card>

        {/* Persona Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Persona Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-72 mt-4"
              data={stats.personaUsage}
              index="name"
              categories={["usage"]}
              colors={["zinc"]}
              showLegend={false}
              valueFormatter={(value: number) => value.toString()}
            />
          </CardContent>
        </Card>

        {/* Messages per Conversation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <CardTitle>Messages per Conversation</CardTitle>
              <div className="flex items-center space-x-2">
                <select
                  value={conversationsRange}
                  onChange={(e) => setConversationsRange(e.target.value as TimeRange)}
                  className="h-8 w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-72 mt-4"
              data={stats.messagesPerConversation}
              index="conversation"
              categories={["messages"]}
              colors={["zinc"]}
              showLegend={false}
              valueFormatter={(value: number) => value.toString()}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
