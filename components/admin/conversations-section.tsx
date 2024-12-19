"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

type Message = {
  id: string
  role: string
  content: string
  createdAt: string
}

type Conversation = {
  id: string
  username: string
  createdAt: string
  messages: Message[]
  persona: {
    id: string
    name: string
  } | null
}

export function ConversationsSection() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations")
      if (!response.ok) throw new Error("Failed to fetch conversations")
      return response.json()
    },
  })

  const exportConversation = async (format: 'json' | 'csv') => {
    if (!selectedConversation) return

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          format
        })
      })

      if (!response.ok) throw new Error("Export failed")

      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 
        `conversation-${selectedConversation.id}.${format}`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to export conversation:", error)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading conversations...</div>
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[150px]">Username</TableHead>
              <TableHead className="w-[180px]">Persona</TableHead>
              <TableHead className="w-[150px]">Created At</TableHead>
              <TableHead className="w-[120px]">Messages</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations?.map((conversation: Conversation) => (
              <TableRow key={conversation.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {conversation.username || 'Anonymous'}
                </TableCell>
                <TableCell>
                  {conversation.persona ? (
                    <Badge variant="secondary" className="font-normal">
                      {conversation.persona.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-sm">
                      Default
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(conversation.createdAt), "MMM d, h:mm a")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {conversation.messages.length} messages
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Conversation with {selectedConversation?.username || 'Anonymous'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-2 mb-4">
            <Button variant="outline" onClick={() => exportConversation('json')}>
              Export as JSON
            </Button>
            <Button variant="outline" onClick={() => exportConversation('csv')}>
              Export as CSV
            </Button>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {selectedConversation?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.role === "assistant"
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium capitalize">{message.role}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(message.createdAt), 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
