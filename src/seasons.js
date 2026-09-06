import {seasonalBlend} from './season-cycle.js';
import * as T from 'three';
import './seasons.css';
export const seasonForMonth=month=>['winter','winter','spring','spring','spring','summer','summer','summer','autumn','autumn','autumn','winter'][month];
const names={spring:'春日',summer:'盛夏',autumn:'秋日',winter:'冬日'};
const colors={spring:['#acc59b','#e5b7b8','#bed1aa'],summer:['#78a882','#96bc8d','#b3ce9c'],autumn:['#cc9a68','#d8b878','#bc886c'],winter:['#dce7e3','#c7d8d4','#e8ebe0']};
const foliage=new Set(['88a685','9eb793','b7c49a','789984','dc9b9a','d68e8d','e8afa4','c77c80','6d9780','adc3a1','dfad9f','e8bdb0','98bba0','c99279']);
export function seasonalEnvironment(scene,{wide=false,onSeason=()=>{}}={}){
  let current='',day=-1,time=0,blend=seasonalBlend();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,extent=wide?110:20,count=wide?180:110;
  const group=new T.Group();group.userData.seasonEffect=true;scene.add(group);
  const data=new Float32Array(count*3);for(let i=0;i<count;i++){data[i*3]=(Math.random()-.5)*extent;data[i*3+1]=Math.random()*(wide?35:18);data[i*3+2]=(Math.random()-.5)*extent;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(data,3));
  const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.beginPath();ctx.ellipse(16,16,10,5,-.5,0,Math.PI*2);ctx.fill();
  const texture=new T.CanvasTexture(canvas),material=new T.PointsMaterial({map:texture,color:'#dfb781',size:wide?.42:.16,transparent:true,opacity:.7,depthWrite:false});const particles=new T.Points(geo,material);group.add(particles);
  const rainbow=new T.Group();rainbow.position.set(wide?-12:-3,wide?2:-1,wide?-55:-20);group.add(rainbow);
  ['#e6aaac','#e9bf9b','#e9dbad','#b9d4ad','#aacdd8','#c7bed7'].forEach((color,i)=>{const mesh=new T.Mesh(new T.TorusGeometry((wide?28:12)-i*(wide?.4:.16),wide?.2:.09,5,70,Math.PI),new T.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false}));rainbow.add(mesh);});
  const materials=new Map(),branches=[];let detected=new WeakSet();
  function refresh(){scene.traverse(obj=>{if(!obj.isMesh||detected.has(obj))return;detected.add(obj);const m=obj.material;if(!m?.color)return;const hex=m.color.getHexString();if(materials.has(m)||foliage.has(hex)){if(!materials.has(m))materials.set(m,{base:m.color.clone(),rose:['dc9b9a','d68e8d','e8afa4','c77c80','dfad9f','e8bdb0','c99279'].includes(hex),index:materials.size%3});branches.push({mesh:obj,z:obj.rotation.z,phase:branches.length*.7});}});apply();}
  function apply(){for(const [m,v] of materials){m.color.set(colors[blend.from][v.index]).lerp(new T.Color(colors[blend.to][v.index]),blend.amount);if(v.rose&&current!=='winter')m.color.lerp(new T.Color('#e0b5b0'),.85);}onSeason(current,blend);material.color.set(current==='winter'?'#f4faf8':current==='spring'?'#efc9cd':current==='summer'?'#f6eac4':'#dab07b');material.size=current==='winter'?(wide?.35:.12):(wide?.42:.17);particles.visible=!reduced;geo.setDrawRange(0,current==='summer'?Math.floor(count*.15):current==='autumn'?Math.floor(count*Math.max(.15,blend.amount)):count);document.documentElement.dataset.season=current;}
  function sync(){const date=new Date();day=date.toDateString();blend=seasonalBlend(date);current=blend.amount<.5?blend.from:blend.to;refresh();label.textContent=(date.getMonth()===8?'夏末 · 绿意未尽':names[current]+' · 微风轻拂');}
  const ui=document.createElement('details');ui.className='season-control';ui.innerHTML='<summary></summary><p>草木随日子慢慢变色。</p><button type="button">让彩虹出现</button><small>幻想天气 · 非实时天气预报</small>';
  document.body.append(ui);const label=ui.querySelector('summary');let rainbowUntil=0;ui.querySelector('button').onclick=()=>{rainbowUntil=time+24;ui.open=false;};sync();
  return {refresh,update(dt){time+=dt;if(new Date().toDateString()!==day)sync();if(!reduced){for(let i=0;i<count;i++){const j=i*3;data[j]+=dt*(current==='autumn'?.65:.23)+Math.sin(time*.7+i)*dt*.14;data[j+1]-=dt*(current==='winter'?.55:current==='summer'?.06:.32);if(data[j+1]<-4)data[j+1]=wide?35:18;if(data[j]>extent/2)data[j]=-extent/2;}geo.attributes.position.needsUpdate=true;branches.forEach(b=>b.mesh.rotation.z=b.z+Math.sin(time*.7+b.phase)*.025);}
  const cycle=time%150,auto=current!=='winter'&&cycle>65&&cycle<89;const active=time<rainbowUntil||auto;const target=active?.22:0;rainbow.children.forEach(m=>{m.material.opacity+=(target-m.material.opacity)*Math.min(1,dt*1.2);});},get season(){return current;}};
}
