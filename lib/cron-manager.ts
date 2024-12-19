import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CronManager {
  private static instance: CronManager;
  private intervalId: NodeJS.Timeout | null = null;
  private currentInterval: number = 360; // Default 6 hours in minutes
  private lastRotation: Date | null = null;

  private constructor() {}

  public static getInstance(): CronManager {
    if (!CronManager.instance) {
      CronManager.instance = new CronManager();
    }
    return CronManager.instance;
  }

  private async getRotationInterval(): Promise<number> {
    try {
      // Always fetch the latest settings
      const settings = await prisma.settings.findFirst();
      
      if (!settings) {
        console.log('No settings found, using default interval of 360 minutes');
        return 360;
      }

      // Log the found interval
      console.log(`Found rotation interval in database: ${settings.rotationInterval} minutes`);
      return settings.rotationInterval;
    } catch (error) {
      console.error('Error fetching rotation interval:', error);
      return 360; // Default to 360 minutes on error
    }
  }

  private async rotatePersona() {
    try {
      // Get all available personas
      const personas = await prisma.persona.findMany({
        where: {
          isActive: true // Only consider active personas
        }
      });

      if (personas.length === 0) {
        console.log('No active personas found for rotation');
        return;
      }

      // Get current selected persona
      const settings = await prisma.settings.findFirst();

      // Filter out currently selected persona to ensure we rotate to a different one
      const availablePersonas = personas.filter(p => p.id !== settings?.selectedPersonaId);
      
      if (availablePersonas.length === 0) {
        console.log('No other personas available for rotation');
        return;
      }

      // Randomly select a persona from available ones
      const randomIndex = Math.floor(Math.random() * availablePersonas.length);
      const selectedPersona = availablePersonas[randomIndex];

      // Update the settings with new persona and lastRotation
      const now = new Date();
      await prisma.settings.update({
        where: {
          id: "1"  // Default settings ID
        },
        data: {
          selectedPersonaId: selectedPersona.id,
          lastRotation: now
        }
      });

      this.lastRotation = now;
      console.log(`Persona rotated successfully to: ${selectedPersona.name} at ${this.lastRotation.toISOString()}`);
    } catch (error) {
      console.error('Error rotating persona:', error);
    }
  }

  public async startPersonaRotation() {
    // Get initial interval
    const minutes = await this.getRotationInterval();
    this.currentInterval = minutes;

    console.log(`Starting persona rotation with interval: ${minutes} minutes`);

    // Stop any existing interval
    this.stopPersonaRotation();

    // Immediately perform first rotation
    await this.rotatePersona();

    // Convert minutes to milliseconds for setInterval
    const intervalMs = minutes * 60 * 1000;

    // Start new interval
    this.intervalId = setInterval(async () => {
      // Get the latest interval before each rotation
      const currentMinutes = await this.getRotationInterval();
      console.log(`Current rotation interval: ${currentMinutes} minutes`);
      
      if (currentMinutes !== this.currentInterval) {
        // If interval changed, restart with new interval
        console.log(`Interval changed from ${this.currentInterval} to ${currentMinutes} minutes, restarting rotation`);
        await this.updateRotationInterval(currentMinutes);
        return;
      }

      console.log('Rotation interval triggered at:', new Date().toISOString());
      await this.rotatePersona();
    }, intervalMs);

    console.log('Persona rotation scheduled successfully');
  }

  public stopPersonaRotation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Persona rotation stopped');
    }
  }

  public getCurrentInterval(): number {
    return this.currentInterval;
  }

  public getLastRotation(): Date | null {
    return this.lastRotation;
  }

  public async updateRotationInterval(minutes: number) {
    console.log(`Updating rotation interval to: ${minutes} minutes`);
    this.currentInterval = minutes;
    await this.startPersonaRotation();
  }

  public async forceRotation() {
    console.log('Forcing immediate persona rotation');
    await this.rotatePersona();
  }
}

export const cronManager = CronManager.getInstance();
