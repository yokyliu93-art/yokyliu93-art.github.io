import {creatorEnabled,reserveCreator,releaseCreator,generateScene} from './creator.js';
import {createService,ApiError} from './service.js';
import {resolve} from 'node:path';
let service;
export function apiMiddleware(){service??=createService(resolve(process.env.ISLAND_DATABASE||'data/islands.sqlite'));const s=service;const attempts=new Map();return async(req,res,next)=>{
if(!req.url.startsWith('/api/'))return next();res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
try{if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)throw new ApiError(403,'跨站请求不被允许');const path=new URL(req.url,'http://localhost').pathname;const method=req.method;let body={};if(['POST','PATCH','PUT'].includes(method)){if(!req.headers['content-type']?.startsWith('application/json'))throw new ApiError(415,'请使用 application/json');let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>65536)throw new ApiError(413,'请求超过 64KB');}try{body=JSON.parse(data||'{}');if(!body||Array.isArray(body)||typeof body!=='object')throw new Error();}catch{throw new ApiError(400,'JSON 格式无效');}}
let result;const forwarded=String(req.headers['x-forwarded-for']||'').split(',')[0].trim(),remote=req.socket.remoteAddress,localDirect=!forwarded&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(remote);const limited=(kind,identity='',limit=30,windowMs=15*60000)=>{if(localDirect)return;const key=`${kind}:${forwarded||remote}:${identity}`;const record=attempts.get(key)||{at:Date.now(),n:0};if(Date.now()-record.at>windowMs){record.at=Date.now();record.n=0;}if(++record.n>limit)throw new ApiError(429,'尝试次数过多，请稍后再试');attempts.set(key,record);};
if(path==='/api/auth/register'&&method==='POST'){limited('register','',60,60*60000);result=s.registerAccount(body.name,body.email,body.password);}
else if(path==='/api/auth/login'&&method==='POST'){limited('login',String(body.email||'').trim().toLowerCase(),10);result=s.loginAccount(body.email,body.password);}
else if(path==='/api/accounts'&&method==='POST'){limited('legacy-register','',60,60*60000);result=s.register(body.name);}else{const c=s.auth(req.headers.authorization?.replace(/^Bearer /,''));const parts=path.split('/').filter(Boolean);const id=parts[2];
if(path==='/api/session'&&method==='GET')result=s.session(c);
else if(path==='/api/auth/claim'&&method==='POST')result=s.claimAccount(c,body.name,body.email,body.password);
else if(path==='/api/auth/logout'&&method==='POST')result=s.logout(c);
else if(path==='/api/me'&&method==='GET')result=s.me(c);
else if(path==='/api/preferences'&&method==='GET')result=s.preferences(c);
else if(path==='/api/preferences'&&method==='POST')result=s.savePreferences(c,body.preferences,body.revision,body.remember);
else if(path==='/api/preferences'&&method==='DELETE')result=s.forgetPreferences(c);
else if(path==='/api/memory'&&method==='GET')result=s.memory(c);
else if(path==='/api/memory'&&method==='POST')result=s.writeMemory(c,body);
else if(path==='/api/memory/settings'&&method==='PUT')result=s.memoryMatching(c,body.matchingEnabled);
else if(parts[1]==='memory'&&parts.length===3&&method==='DELETE')result=s.deleteMemory(c,id);
else if(parts[1]==='memory'&&parts[3]==='amend'&&method==='POST')result=s.amendMemory(c,id,body.content,body.reason);
else if(path==='/api/creator'&&method==='GET'){s.me(c);result={available:creatorEnabled(),provider:'Codex',mode:'local'};}
else if(parts[1]==='creations'&&method==='GET')result=s.creation(c,id);
else if(parts[1]==='islands'&&parts[3]==='coding-task'&&method==='GET')result=s.codingTask(c,id);
else if(parts[1]==='islands'&&parts[3]==='program'&&method==='PUT')result=s.submitProgram(c,id,body.jobId,body.source,body.summary);
else if(parts[1]==='islands'&&parts[3]==='request-code'&&method==='POST'){const job=s.beginCreation(c,id,body.prompt);result={jobId:job.jobId,status:'running'};}
else if(parts[1]==='islands'&&parts[3]==='imagine'&&method==='POST'){
if(!creatorEnabled()||!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))throw new ApiError(503,'请先连接可用的 Agent；本地 Codex 创作服务尚未开启');
reserveCreator();let job;try{job=s.beginCreation(c,id,body.prompt);}catch(e){releaseCreator();throw e;}
result={jobId:job.jobId,status:'running'};generateScene(body.prompt,job.scene,job.preferences).then(r=>s.completeCreation(job.credential,job.jobId,r.scene,r.summary)).catch(e=>s.failCreation(job.jobId,e.status?e.message:(e.message.startsWith('Codex')||e.message.startsWith('Agent')?e.message:'Agent 生成结果未通过校验，岛屿未改变'))).finally(releaseCreator);
}
else if(parts[1]==='islands'&&parts[3]==='undo-creation'&&method==='POST')result=s.undoCreation(c,id);
else if(path==='/api/rules'&&method==='GET')result=s.rules;
else if(path==='/api/world'&&method==='GET')result=s.world(c);
else if(path==='/api/encounters'&&method==='GET')result=s.encounters(c);
else if(path==='/api/world/round'&&method==='POST')result=s.round(c);
else if(path==='/api/audit'&&method==='GET')result=s.audit(c);
else if(parts[1]==='islands'&&parts.length===3&&method==='GET')result=s.read(c,id);
else if(parts[1]==='islands'&&parts.length===3&&method==='PATCH')result=s.patch(c,id,body.revision,body.actions);
else if(parts[1]==='islands'&&parts[3]==='visibility'&&method==='POST')result=s.visibility(c,id,body.discoverable);
else if(parts[1]==='islands'&&parts[3]==='agents'&&method==='POST')result=s.issueAgent(c,id,body.scopes,body.days);
else if(parts[1]==='agents'&&parts.length===3&&method==='DELETE')result=s.revoke(c,id);
else if(path==='/api/bonds'&&method==='POST')result=s.propose(c,body.islandId);
else if(parts[1]==='bonds'&&parts[3]==='respond'&&method==='POST')result=s.respond(c,id,body.accept);
else if(parts[1]==='bonds'&&parts[3]==='separate'&&method==='POST')result=s.separate(c,id);
else if(parts[1]==='bonds'&&parts[3]==='space'&&method==='GET')result=s.space(c,id);
else if(parts[1]==='bonds'&&parts[3]==='objects'&&method==='PUT')result=s.putShared(c,id,body.revision,body.object);
else if(parts[1]==='inventory'&&parts[3]==='restore'&&method==='POST')result=s.restore(c,id,body.revision,body.placement);
else if(path==='/api/blocks'&&method==='POST')result=s.block(c,body.userId);
else throw new ApiError(404,'接口不存在');}
res.statusCode=200;res.end(JSON.stringify(result));}catch(e){res.statusCode=e.status||500;res.end(JSON.stringify({error:e.status?e.message:'服务端异常，本次操作未完成'}));if(!e.status)console.error(e);}
};}
