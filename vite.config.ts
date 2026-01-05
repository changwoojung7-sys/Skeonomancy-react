import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/gateway': {
          target: 'https://gateway.ai.cloudflare.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gateway/, '/v1'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq) => {
              // LOCAL DEV KEY INJECTION
              // Read GOOGLE_AI_KEY from local .env and inject it
              const key = env.GOOGLE_AI_KEY || env.VITE_GOOGLE_AI_KEY;
              if (key) {
                proxyReq.setHeader('x-goog-api-key', key);
              }
            });
          }
        },
      },
    },
  }
})
