import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function rotatePersona() {
  try {
    // Get all available personas
    const personas = await prisma.persona.findMany({
      where: {
        isActive: true
      }
    });

    if (personas.length === 0) {
      console.log('No active personas found for rotation');
      return null;
    }

    // Get current settings
    const settings = await prisma.settings.findUnique({
      where: { id: "1" },
      include: { selectedPersona: true }
    });

    // Filter out currently selected persona
    const availablePersonas = personas.filter(p => p.id !== settings?.selectedPersonaId);
    
    if (availablePersonas.length === 0) {
      console.log('No other personas available for rotation');
      return null;
    }

    // Randomly select a persona
    const randomIndex = Math.floor(Math.random() * availablePersonas.length);
    const selectedPersona = availablePersonas[randomIndex];

    // Update settings with new persona and last rotation time
    const updatedSettings = await prisma.settings.update({
      where: { id: "1" },
      data: {
        selectedPersonaId: selectedPersona.id,
        lastRotation: new Date()
      },
      include: {
        selectedPersona: true
      }
    });

    return updatedSettings;
  } catch (error) {
    console.error('Error rotating persona:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Get current settings
    const settings = await prisma.settings.findUnique({
      where: { id: "1" }
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const lastRotation = settings.lastRotation || new Date(0);
    const minutesSinceLastRotation = Math.floor((now.getTime() - lastRotation.getTime()) / (60 * 1000));

    // Check if it's time to rotate
    if (minutesSinceLastRotation >= settings.rotationInterval) {
      const result = await rotatePersona();
      if (result) {
        return NextResponse.json({
          status: "success",
          message: "Persona rotated successfully",
          newPersona: result.selectedPersona
        });
      }
    }

    return NextResponse.json({
      status: "skipped",
      message: `Not time to rotate yet. Next rotation in ${settings.rotationInterval - minutesSinceLastRotation} minutes`,
      lastRotation,
      nextRotation: new Date(lastRotation.getTime() + settings.rotationInterval * 60 * 1000)
    });
  } catch (error) {
    console.error("Error in rotation check:", error);
    return NextResponse.json(
      { error: "Failed to check rotation" },
      { status: 500 }
    );
  }
}
