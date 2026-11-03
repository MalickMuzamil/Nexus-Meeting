import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const calendarApiUrl = new URL(
    env.VITE_ZOHO_CALENDAR_API_URL || 'https://calendar.zoho.com/api/v1'
  );
  const calendarApiPath = calendarApiUrl.pathname.replace(/\/+$/, '');
  const proxyPrefix = '/__zoho_calendar_proxy__';

  return {
    plugins: [react()],
    server: {
      proxy: {
        [proxyPrefix]: {
          target: calendarApiUrl.origin,
          changeOrigin: true,
          secure: true,
          rewrite: path => `${calendarApiPath}${path.replace(proxyPrefix, '')}`
        }
      }
    }
  };
});
