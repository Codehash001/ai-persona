import { cronManager } from './cron-manager';

let isInitialized = false;

export async function initializeCronJobs() {
    if (isInitialized) {
        console.log('Cron jobs already initialized');
        return;
    }

    console.log('Initializing cron jobs...');
    try {
        await cronManager.startPersonaRotation();
        isInitialized = true;
        console.log('Cron jobs initialized successfully');
    } catch (error) {
        console.error('Failed to initialize cron jobs:', error);
    }
}
