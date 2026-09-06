import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
// A public preview must never run the host's authenticated coding tool.
process.env.ISLAND_LOCAL_CODEX='0';
process.env.ISLAND_DATABASE=resolve(process.env.ISLAND_PREVIEW_DATABASE||'data/public-preview.sqlite');
const {apiMiddleware}=await import('./http.js');
const api=apiMiddleware(),root=resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
const server=createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
 if(req.url?.startsWith('/api/'))return api(req,res,()=>{res.statusCode=404;res.end();});
 try{
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;return res.end();}
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(path!=='/'&&!path.startsWith('/assets/')&&!path.startsWith('/music/')){res.statusCode=404;return res.end('Not found');}
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+sep)){res.statusCode=404;return res.end();}
  const info=await stat(file);if(!info.isFile())throw Error();res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.setHeader('Content-Length',info.size);res.setHeader('Cache-Control',path.startsWith('/assets/')?'public,max-age=31536000,immutable':'no-cache');res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.statusCode=404;res.end('Not found');}
});
server.requestTimeout=15000;server.headersTimeout=15000;server.listen(Number(process.env.ISLAND_PREVIEW_PORT||4174),process.env.ISLAND_PREVIEW_HOST||'127.0.0.1',()=>console.log('Isolated public preview listening on 127.0.0.1:4174; host Codex disabled.'));
