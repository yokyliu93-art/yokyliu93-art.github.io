import {createWorld} from './world.js';
import {starterEcosystem} from '../server/ecosystem.js';
import {applyPreferences} from '../server/preferences.js';
import './visit.css';
const params=new URLSearchParams(location.search),id=params.get('island'),demo=params.get('demo'),own=params.get('own')==='1';
const names={forest:'林间来信',ocean:'潮汐停靠站',society:'晚灯小镇',planet:'星环旅居'};
const root=document.querySelector('#app');root.innerHTML=`<main id="visit-world"></main><header class="visit-header"><a href="/?view=studio">← 回我的岛</a><a href="/?view=universe">返回云海</a></header><section class="visit-panel"><small id="visit-kind">走近另一个人的世界</small><h1 id="visit-title">去远方，停留片刻。</h1><p id="visit-description">选择一座岛，落下来，慢慢走一走。</p><div id="visit-list"></div><button id="land" hidden>着陆到岛上 ↓</button><button id="takeoff" hidden>起飞 · 看看全岛</button><p id="visit-status" role="status"></p></section><div class="walk-hud" hidden><span>拖动环顾 · WASD / 方向键行走 · Esc 起飞</span><div class="walk-pad" aria-label="行走方向"><button data-walk="w" aria-label="向前走">↑</button><button data-walk="a" aria-label="向左走">←</button><button data-walk="s" aria-label="向后走">↓</button><button data-walk="d" aria-label="向右走">→</button></div></div>`;
const status=text=>document.querySelector('#visit-status').textContent=text;
async function api(path){const token=localStorage.getItem('our-island-owner-token');const response=await fetch('/api'+path,{headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(10000)});const data=await response.json();if(!response.ok)throw Error(data.error||'暂时无法探访');return data;}
let world,scene;
function link(title,href,detail){const a=document.createElement('a');a.href=href;const b=document.createElement('strong'),small=document.createElement('small');b.textContent=title;small.textContent=detail;a.append(b,small);document.querySelector('#visit-list').append(a);}
if(!id&&!demo&&!own){
 for(const [kind,title] of Object.entries(names))link(title,'/?view=visit&demo='+kind,'示例岛 · 可以着陆漫步');
 if(localStorage.getItem('our-island-owner-token')){try{const islands=await api('/world');for(const island of islands)link(island.name,'/?view=visit&island='+encodeURIComponent(island.id),'真实用户 · 已开放发现');status(islands.length?'下面也列出了已开放的用户岛屿。':'目前没有其他已开放的用户岛屿，可以先探访示例岛。');}catch(e){status(e.message);}}
 else status('先体验示例岛；创建自己的岛后，可查看已开放的用户岛屿。');
}else{
 try{
 if(own){const account=await api('/me'),record=account.island;scene=record.scene;document.querySelector('#visit-title').textContent=record.name;document.querySelector('#visit-kind').textContent='我的岛 · 岛主漫游';}
 else if(id){const record=await api('/islands/'+encodeURIComponent(id));scene=record.scene;document.querySelector('#visit-title').textContent=record.name;document.querySelector('#visit-kind').textContent='已开放的用户岛屿 · 只读探访';}
 else{if(!names[demo])throw Error('这座示例岛不存在');scene=applyPreferences(starterEcosystem(),{world:demo,variant:8,animals:'bird',home:'open',landscape:'forest',light:'balanced'});document.querySelector('#visit-title').textContent=names[demo];document.querySelector('#visit-kind').textContent='示例岛 · 非真实用户';}
 document.querySelector('#visit-description').textContent=own?'先在云端看一眼，再落到你刚刚创造的生态里。可以行走，也可以靠近并点击会回应的生命。':'先在云端看一眼，再落到这片风景里。探访不会修改岛主的世界。';
 world=createWorld(document.querySelector('#visit-world'),{...scene,objects:[],expansions:0},()=>{},()=>{},{ecosystemOnly:true});world.setEcology(scene);document.querySelector('#land').hidden=false;
 }catch(e){status(e.message);document.querySelector('#visit-description').textContent='未进入这座岛。你可以返回，选择另一座开放的岛。';}
}
function takeoff(){world?.takeoff();document.body.classList.remove('walking');document.querySelector('.walk-hud').hidden=true;document.querySelector('#land').hidden=false;document.querySelector('#takeoff').hidden=true;status('已回到空中，可以再次着陆。');}
document.querySelector('#land').onclick=()=>{if(!world?.land()){status('暂时找不到安全的落脚点，等场景加载完成后再试。');return;}document.body.classList.add('walking');document.querySelector('.walk-hud').hidden=false;document.querySelector('#land').hidden=true;document.querySelector('#takeoff').hidden=false;status('正在降落 · 到达后可以自由行走');setTimeout(()=>{if(document.body.classList.contains('walking'))status('已着陆 · 慢慢逛，也可以随时起飞');},1500);};
document.querySelector('#takeoff').onclick=takeoff;addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('walking'))takeoff();});
for(const button of document.querySelectorAll('[data-walk]')){button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);world?.walkInput(button.dataset.walk,true);};for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>world?.walkInput(button.dataset.walk,false));}
// An open page must also stop a visit when access is withdrawn.
if(id&&world){const timer=setInterval(async()=>{try{await api('/islands/'+encodeURIComponent(id));}catch{world.takeoff();document.querySelector('#visit-world').hidden=true;document.querySelector('#land').hidden=true;document.querySelector('#takeoff').hidden=true;document.querySelector('.walk-hud').hidden=true;status('探访权限已不可用，已结束本次探访。');clearInterval(timer);}},15000);addEventListener('pagehide',()=>clearInterval(timer));}
window.__visit={stats:()=>world?.getStats()};
