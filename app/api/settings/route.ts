import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cronManager } from "@/lib/cron-manager"

export async function GET() {
  try {
    // Get settings or create default if none exist
    const settings = await prisma.settings.findUnique({
      where: { id: "1" },
      include: {
        selectedPersona: true
      }
    });

    if (!settings) {
      // Create default settings
      const defaultSettings = await prisma.settings.create({
        data: {
          temperature: 0.7,
          maxTokens: 1000,
          rotationInterval: 360
        },
        include: {
          selectedPersona: true
        }
      });

      // Initialize rotation with default interval
      await cronManager.updateRotationInterval(360);
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { temperature, maxTokens, selectedPersonaId, rotationInterval } = body

    // Validate the input
    if (typeof temperature !== "number" || temperature < 0 || temperature > 2) {
      return NextResponse.json(
        { error: "Temperature must be between 0 and 2" },
        { status: 400 }
      )
    }

    if (typeof maxTokens !== "number" || maxTokens < 1) {
      return NextResponse.json(
        { error: "Max tokens must be a positive number" },
        { status: 400 }
      )
    }

    if (typeof rotationInterval !== "number" || rotationInterval < 1) {
      return NextResponse.json(
        { error: "Rotation interval must be a positive number" },
        { status: 400 }
      )
    }

    const updatedSettings = await prisma.settings.upsert({
      where: { id: "1" },
      update: {
        temperature,
        maxTokens,
        rotationInterval,
        selectedPersonaId: selectedPersonaId || null
      },
      create: {
        id: "1",
        temperature,
        maxTokens,
        rotationInterval,
        selectedPersonaId: selectedPersonaId || null
      },
      include: {
        selectedPersona: true
      }
    })

    // Always update the rotation interval when settings are updated
    console.log(`Updating rotation interval to ${rotationInterval} minutes`);
    await cronManager.updateRotationInterval(rotationInterval);

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
