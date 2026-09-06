import {defineConfig} from 'vite';
import {apiMiddleware} from './server/http.js';
export default defineConfig({server:{host:'127.0.0.1',allowedHosts:['.lhr.life']},plugins:[{name:'island-api',configureServer(server){server.middlewares.use(apiMiddleware());},configurePreviewServer(server){server.middlewares.use(apiMiddleware());}}]});
