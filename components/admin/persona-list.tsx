"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { UpdatePersonaDialog } from "./update-persona-dialog"
import { useToast } from "@/hooks/use-toast"


interface Persona {
  id: string
  name: string
  systemPrompt: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export function PersonaList() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPersonas()
  }, [])

  const fetchPersonas = async () => {
    try {
      const response = await fetch("/api/personas")
      const data = await response.json()
      setPersonas(data)
    } catch (error) {
      console.error("Failed to fetch personas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePersonaStatus = async (id: string, currentStatus: boolean) => {
    try {
      // If trying to deactivate the only active persona, prevent it
      if (currentStatus && personas.filter(p => p.isActive).length === 1) {
        toast({
          variant: "destructive",
          title: "Cannot deactivate",
          description: "At least one persona must be active"
        })
        return
      }

      const response = await fetch(`/api/personas/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update persona status")
      }

      toast({
        title: "Status updated",
        description: "Persona status has been updated successfully."
      })

      // Refresh the personas list
      fetchPersonas()
    } catch (error) {
      console.error("Error toggling persona status:", error)
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: "There was a problem updating the persona status. Please try again."
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>System Prompt</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personas && personas.map((persona) => (
              <TableRow key={persona.id}>
                <TableCell className="font-medium">{persona.name}</TableCell>
                <TableCell className="max-w-md truncate">
                  {persona.systemPrompt}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(persona.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={persona.isActive}
                    onCheckedChange={() => togglePersonaStatus(persona.id, persona.isActive)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedPersona(persona)
                      setIsUpdateDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {personas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No personas found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <UpdatePersonaDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        persona={selectedPersona}
      />
    </>
  )
}
