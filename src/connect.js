import './onboarding.css';
import {createWorld} from './world.js';
import {starterEcosystem} from '../server/ecosystem.js';
import {mountAgentConnection} from './agent-connection.js';
document.querySelector('#app').innerHTML=`<div id="arrival-world"></div><main class="connection-page"><a href="/">← 虚空大陆</a><small>01 / 连接你的创作伙伴</small><h1>你来想象，<br>它让世界生长。</h1><p>把一把岛屿钥匙交给自己的 Agent。<br>等它向你问好，我们就从第一片风景开始。</p><button id="connect-agent">连接我的 Agent ↗</button><blockquote id="hello" aria-live="polite">等待创作伙伴抵达</blockquote><a id="continue" href="/?view=onboarding" hidden>开始构想我的世界 →</a><p class="connection-note">使用你自己的模型账号或 API 配置。岛会记下你的选择和改变，在风景长成后，为你寄来一封私人的信。你随时可以查看、修改和删除记忆。</p><p id="connect-error" role="status"></p></main>`;
let me;async function api(path,method='GET',body){const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('our-island-owner-token')},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error);return data;}
const refresh=async()=>{me=await api('/me');};
mountAgentConnection({api,ensureOwner:refresh,getMe:()=>me,refresh});
function render(s){document.querySelector('#hello').textContent=s.connected?`${s.name}：${s.hello}`:'等待创作伙伴抵达';document.querySelector('#continue').hidden=!s.connected;}
addEventListener('island-agent-status',e=>render(e.detail));
const check=()=>api('/agent/status').then(render).catch(e=>document.querySelector('#connect-error').textContent=e.message);check();const timer=setInterval(check,3000);addEventListener('pagehide',()=>clearInterval(timer));
try{const initial=starterEcosystem();const world=createWorld(document.querySelector('#arrival-world'),{...initial,objects:[],expansions:0},()=>{},()=>{},{ecosystemOnly:true});world.setEcology(initial);}catch{document.querySelector('#arrival-world').remove();}
