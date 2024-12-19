import { cronManager } from '@/lib/cron-manager';

// Start the persona rotation when the app initializes
console.log('Initializing persona rotation cron job...');
cronManager.startPersonaRotation()
  .then(() => {
    console.log('Persona rotation cron job started successfully');
  })
  .catch((error) => {
    console.error('Failed to start persona rotation cron job:', error);
  });
