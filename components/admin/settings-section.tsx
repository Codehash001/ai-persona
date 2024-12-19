"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Settings2, Zap } from "lucide-react"

interface Persona {
  id: string
  name: string
  systemPrompt: string
  isActive: boolean
}

interface Settings {
  id: string
  temperature: number
  maxTokens: number
  rotationInterval: number
  selectedPersonaId: string | null
}

const defaultSettings: Settings = {
  id: "1",
  temperature: 0.7,
  maxTokens: 1000,
  rotationInterval: 360,
  selectedPersonaId: null,
}

export function SettingsSection() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPersonas()
    loadSettings()
  }, [])

  const fetchPersonas = async () => {
    try {
      const response = await fetch("/api/personas")
      const data = await response.json()
      const activePersonas = data.filter((p: Persona) => p.isActive)
      setPersonas(activePersonas)
    } catch (error) {
      console.error("Failed to fetch personas:", error)
      toast({
        variant: "destructive",
        title: "Error loading personas",
        description: "Could not load active personas. Please try again."
      })
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings({
          id: data.id,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          rotationInterval: data.rotationInterval ?? 360,
          selectedPersonaId: data.selectedPersonaId
        })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      setSettings(defaultSettings)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your settings have been updated successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Manage your AI assistant and model settings
          </p>
        </div>
        <Button
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="persona" className="space-y-6">
        <TabsList>
          <TabsTrigger value="persona" className="space-x-2">
            <Bot className="h-4 w-4" />
            <span>Persona</span>
          </TabsTrigger>
          <TabsTrigger value="model" className="space-x-2">
            <Zap className="h-4 w-4" />
            <span>Model</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="space-x-2">
            <Settings2 className="h-4 w-4" />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="persona" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Persona Settings</CardTitle>
              <CardDescription>
                Configure persona-related settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Active Persona</Label>
                <Select
                  value={settings.selectedPersonaId || ""}
                  onValueChange={(value) =>
                    setSettings({ ...settings, selectedPersonaId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {personas.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rotation Interval (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={settings.rotationInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rotationInterval: parseInt(e.target.value) || 360,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  How often to automatically switch between personas (in minutes)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Behavior</CardTitle>
              <CardDescription>
                Configure how the language model generates responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Temperature ({settings.temperature})</Label>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[settings.temperature]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, temperature: value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Controls randomness: Lower values make the output more focused and deterministic
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Fine-tune advanced model parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxTokens: parseInt(e.target.value) || 0,
                    })
                  }
                  min={1}
                  max={4000}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of tokens to generate in the response
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
