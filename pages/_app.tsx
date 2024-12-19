import { useEffect } from 'react';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize cron jobs when the app starts
    fetch('/api/admin/cron/init', { method: 'POST' })
      .then(response => response.json())
      .then(data => console.log('Cron initialization:', data))
      .catch(error => console.error('Failed to initialize cron:', error));
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
