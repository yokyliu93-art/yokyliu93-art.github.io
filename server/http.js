import './config.js';
import {generateReflection} from './reflection-agent.js';
import {createService,ApiError} from './service.js';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
let service;
export function apiMiddleware(){service??=createService(process.env.ISLAND_DATABASE?resolve(process.env.ISLAND_DATABASE):fileURLToPath(new URL('../data/islands.sqlite',import.meta.url)));const s=service;if(!s.mailTimer){s.mailTimer=setInterval(()=>s.mail.tick().catch(()=>{}),15000);s.mailTimer.unref();s.mail.tick().catch(()=>{});}const attempts=new Map();return async(req,res,next)=>{
if(!req.url.startsWith('/api/'))return next();res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
try{if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)throw new ApiError(403,'跨站请求不被允许');const path=new URL(req.url,'http://localhost').pathname;const method=req.method;let body={};if(['POST','PATCH','PUT'].includes(method)){if(!req.headers['content-type']?.startsWith('application/json'))throw new ApiError(415,'请使用 application/json');let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>(path==='/api/memory/import'?10*1024*1024:65536))throw new ApiError(413,'请求内容过大');}try{body=JSON.parse(data||'{}');if(!body||Array.isArray(body)||typeof body!=='object')throw new Error();}catch{throw new ApiError(400,'JSON 格式无效');}}
let result;const forwarded=String(req.headers['x-forwarded-for']||'').split(',')[0].trim(),remote=req.socket.remoteAddress,localDirect=!forwarded&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(remote);const limited=(kind,identity='',limit=30,windowMs=15*60000)=>{if(localDirect)return;const key=`${kind}:${forwarded||remote}:${identity}`;const record=attempts.get(key)||{at:Date.now(),n:0};if(Date.now()-record.at>windowMs){record.at=Date.now();record.n=0;}if(++record.n>limit)throw new ApiError(429,'尝试次数过多，请稍后再试');attempts.set(key,record);};
if(path==='/api/auth/register'&&method==='POST'){limited('register','',60,60*60000);result=s.registerAccount(body.name,body.email,body.password);}
else if(path==='/api/auth/login'&&method==='POST'){limited('login',String(body.email||'').trim().toLowerCase(),10);result=s.loginAccount(body.email,body.password);}
else if(path==='/api/accounts'&&method==='POST'){limited('legacy-register','',60,60*60000);result=s.register(body.name);}else{const c=s.auth(req.headers.authorization?.replace(/^Bearer /,''));const parts=path.split('/').filter(Boolean);const id=parts[2];
if(path==='/api/agent/status'&&method==='GET')result=s.agentStatus(c);
else if(path==='/api/journey/start'&&method==='POST')result=s.startJourney(c,body);
else if(parts[1]==='islands'&&parts[3]==='hello'&&method==='POST')result=s.agentHello(c,id,body);
else if(path==='/api/letters'&&method==='POST'){const me=s.me(c);if(!me.island.scene.program)throw new ApiError(409,'先让 Agent 完成这座岛，再准备来信');result={id:s.mail.changed(c.user_id)};}
else if(path==='/api/letters'&&method==='GET')result=s.mail.list(c);
else if(parts[1]==='letters'&&parts[3]==='retry'&&method==='POST')result=s.mail.retry(c,id);
else if(parts[1]==='letters'&&parts[3]==='correction'&&method==='POST')result=s.mail.amend(c,id,body.content);
else if(path==='/api/letters/mbti'&&method==='PUT')result=s.mail.mbti(c,body.mbti);
else if(parts[1]==='letters'&&parts.length===3&&method==='DELETE')result=s.mail.erase(c,id);
else if(parts[1]==='letters'&&parts[3]==='images'&&method==='GET'){const image=s.mail.image(c,id,Number(parts[4]));res.setHeader('Content-Type',image.mime);res.end(image.data);return;}
else if(path==='/api/island/analyze-design'&&method==='POST'){limited('reflection',c.user_id,12,60*60000);const draft=s.reflection.draftIsland(c,body.expression||'');try{const mirror=await generateReflection(c.user_id,draft.answers);result=s.reflection.saveDraft(c,draft,mirror);}finally{s.reflection.cancelDraft(c,draft.nonce);}}
else if(path==='/api/island/analyze-onboarding'&&method==='POST'){limited('reflection',c.user_id,12,60*60000);const draft=s.reflection.draft(c,body.answers,body.revision,body.analysisConsent);try{const mirror=await generateReflection(c.user_id,draft.answers);result=s.reflection.saveDraft(c,draft,mirror);}finally{s.reflection.cancelDraft(c,draft.nonce);}}
else if(path==='/api/island/listening'&&method==='GET')result=s.reflection.listening(c);
else if(path==='/api/island/listening'&&method==='PUT')result=s.reflection.listening(c,body.track);
else if(path==='/api/island/discard-draft'&&method==='POST')result=s.reflection.discard(c,body.revision);
else if(path==='/api/island/confirm-mbti'&&method==='POST')result=s.reflection.confirm(c,body);
else if(path==='/api/island/profile/export'&&method==='GET')result=s.reflection.export(c);
else if(parts[1]==='island'&&parts[2]==='profile'&&method==='GET')result=s.reflection.get(c,parts[3]||c.user_id);
else if(path==='/api/island/profile'&&method==='DELETE')result=s.reflection.erase(c);
else if(path==='/api/island/profile/settings'&&method==='PUT')result=s.reflection.settings(c,body);
else if(path==='/api/island/detect-change'&&method==='POST')result=s.reflection.detect(c);
else if(parts[1]==='island'&&parts[2]==='timeline'&&method==='GET')result=s.reflection.timeline(c,parts[3]||c.user_id);
else if(parts[1]==='island'&&parts[2]==='cards'&&method==='PUT')result=s.reflection.card(c,parts[3],body);
else if(path==='/api/island/match'&&method==='POST')result=s.reflection.match(c,body.userA,body.userB);
else if(path==='/api/session'&&method==='GET')result=s.session(c);
else if(path==='/api/auth/claim'&&method==='POST')result=s.claimAccount(c,body.name,body.email,body.password);
else if(path==='/api/auth/logout'&&method==='POST')result=s.logout(c);
else if(path==='/api/avatar'&&method==='GET')result=s.avatar(c);
else if(path==='/api/avatar'&&method==='PUT')result=s.putAvatar(c,body.revision,body.source);
else if(path==='/api/me'&&method==='GET')result=s.me(c);
else if(path==='/api/preferences'&&method==='GET')result=s.preferences(c);
else if(path==='/api/preferences'&&method==='POST')result=s.savePreferences(c,body.preferences,body.revision,body.remember);
else if(path==='/api/preferences'&&method==='DELETE')result=s.forgetPreferences(c);
else if(path==='/api/memory/export'&&method==='GET')result=s.exportMemory(c);
else if(path==='/api/memory/import'&&method==='POST')result=s.importMemory(c,body);
else if(path==='/api/memory'&&method==='GET')result=s.memory(c);
else if(path==='/api/memory'&&method==='POST')result=s.writeMemory(c,body);
else if(path==='/api/memory/settings'&&method==='PUT')result=s.memoryMatching(c,body.matchingEnabled);
else if(parts[1]==='memory'&&parts.length===3&&method==='DELETE')result=s.deleteMemory(c,id);
else if(parts[1]==='memory'&&parts[3]==='amend'&&method==='POST')result=s.amendMemory(c,id,body.content,body.reason);
else if(path==='/api/creator'&&method==='GET'){s.me(c);result={available:false,provider:'user-agent',mode:'external'};}
else if(parts[1]==='creations'&&method==='GET')result=s.creation(c,id);
else if(parts[1]==='islands'&&parts[3]==='coding-task'&&method==='GET')result=s.codingTask(c,id);
else if(parts[1]==='islands'&&parts[3]==='program'&&method==='PUT')result=s.submitProgram(c,id,body.jobId,body.source,body.summary,body.scenePatch);
else if(parts[1]==='islands'&&parts[3]==='request-code'&&method==='POST'){const job=s.requestCode(c,id,body.prompt);result={jobId:job.jobId,status:'running'};}
else if(parts[1]==='islands'&&parts[3]==='imagine'&&method==='POST')throw new ApiError(410,'请连接自己的 Agent，使用 request-code 接口创作');
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
