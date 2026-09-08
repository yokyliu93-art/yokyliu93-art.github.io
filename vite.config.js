import {defineConfig} from 'vite';
import {apiMiddleware} from './server/http.js';
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.lhr.life', '.trycloudflare.com', '.loca.lt'],
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
