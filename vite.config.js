import {defineConfig} from 'vite';
import {apiMiddleware} from './server/http.js';
const domain = process.env.ISLAND_DOMAIN?.trim();
const extraHosts = domain ? [`.${domain}`] : [];
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.lhr.life', '.trycloudflare.com', '.loca.lt', '.vinky.live', ...extraHosts],
  },
  plugins: [
    {
      name: 'island-api',
      configureServer(server) {
        server.middlewares.use(apiMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(apiMiddleware());
      },
    },
  ],
});
