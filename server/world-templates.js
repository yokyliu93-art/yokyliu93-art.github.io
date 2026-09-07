export const worldTemplates=[
 {id:'planet',name:'一颗星球',subtitle:'绕着自己的轨道，慢慢发光',mark:'◌',colors:['#e5dfef','#d2e1ec']},
 {id:'ocean',name:'一片海洋',subtitle:'有潮汐，也有可以停靠的岸',mark:'≈',colors:['#d3eceb','#bcdde6']},
 {id:'desert',name:'一座沙漠',subtitle:'风塑造沙丘，远处留一小片绿洲',mark:'⌁',colors:['#ead9b9','#d7b57f']},
 {id:'plain',name:'一片平原',subtitle:'天空很大，草浪一直伸向远方',mark:'﹋',colors:['#e2edc9','#b9d39f']},
 {id:'forest',name:'一座丛林',subtitle:'让生命在绿意里，自由生长',mark:'♧',colors:['#dfebce','#bcd5b6']},
 {id:'alpine',name:'一方雪原',subtitle:'群山、冷杉，以及会反光的雪',mark:'△',colors:['#e8eef0','#bccfd3']},
 {id:'society',name:'人类社会',subtitle:'街巷、邻居，以及日常的灯火',mark:'⌂',colors:['#f1e2cf','#e5c9c2']}
];
function buildWorld(island,kind,seed){
 let n=seed+7,index=0;const random=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
 const add=(shape,color,position,scale,extra={})=>{const id='world-'+index++;island.mesh({id,shape,color,position,scale,...extra});return id;};
 const movers=[];
 if(kind==='planet'){
  add('sphere',['#bdcbbd','#cbc0d9','#b8d5d5'][seed%3],[0,0,0],[12,12,12]);
  const vertices=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2;const pt=(t,r)=>[Math.cos(t)*r,Math.sin(t)*r*.16,Math.sin(t)*r];vertices.push(...pt(a,7),...pt(b,7),...pt(a,8.3),...pt(a,8.3),...pt(b,7),...pt(b,8.3));}
  add('custom','#eee0b9',[0,0,0],[1,1,1],{vertices});
  for(let i=0;i<24;i++){const a=random()*Math.PI*2,r=7+random()*2;const p=[Math.cos(a)*r,2+random()*6,Math.sin(a)*r];const id=add('sphere',i%2?'#fff0c1':'#e7cae3',p,[.13,.13,.13]);movers.push({id,p,phase:random()*6});}
 }else if(kind==='ocean'){
  add('cylinder',['#91c9d5','#9ed4cf','#a5cbdc'][seed%3],[0,-.5,0],[18,.4,18]);
  add('sphere','#eee4c5',[-3,-.1,1],[5,.8,5]);add('sphere','#f4e5c9',[4,-.1,-3],[3.5,.7,3]);
  for(let i=0;i<10;i++){const a=random()*6.28,r=3+random()*5;add('box','#d4eee5',[Math.cos(a)*r,-.22,Math.sin(a)*r],[.5+random(),.025,.04],{rotation:[0,a,0]});}
  const boat=add('custom','#c38e7b',[0,0,0],[1,1,1],{vertices:[-.7,0,-.3,.7,0,-.3,0,.3,0, .7,0,-.3,.7,0,.3,0,.3,0, .7,0,.3,-.7,0,.3,0,.3,0, -.7,0,.3,-.7,0,-.3,0,.3,0]});
  let sailing=true;island.onClick(id=>{if(id===boat)sailing=!sailing;});let progress=0,last=0;
  island.onFrame(t=>{if(sailing)progress+=Math.min(t-last,.2)*.2;last=t;island.move(boat,{position:[Math.cos(progress)*2.5,.13,Math.sin(progress)*4],rotation:[0,-progress,0]});});return;
 }else if(kind==='desert'){
  add('cylinder','#d9bd86',[0,-.55,0],[18,.9,18]);
  add('sphere','#e7cc98',[-3,.05,-1],[8,1.4,3.4]);add('sphere','#cfae73',[3.8,-.08,2.5],[6.2,1.1,3]);
  for(let i=0;i<7;i++){const x=-6+i*1.9,z=(random()-.5)*10;add('cylinder','#6f9a7c',[x,.8,z],[.25,2.4,.25]);if(i%2)add('cylinder','#6f9a7c',[x+.24,1,z],[.12,.8,.12],{rotation:[0,0,1]});}
  add('cylinder','#8ec5bd',[4,.05,-3],[3.6,.08,2.7]);
 }else if(kind==='plain'){
  for(let i=0;i<18;i++){const a=random()*6.28,r=1+random()*6,p=[Math.cos(a)*r,.35,Math.sin(a)*r];const id=add('cone',i%4?'#91ad75':'#d7c98a',p,[.16,.65,.16]);movers.push({id,p,phase:random()*6});}
  for(let i=0;i<4;i++)add('sphere','#c8d7a9',[-5+i*3.2,.18,-2+i%2*3],[2.8,.22,1.5]);
 }else if(kind==='alpine'){
  for(const [x,z,s] of [[-4,-1,1],[0,2,1.35],[4,-2,.85]]){add('cone','#9aadb0',[x,1.2*s,z],[3.6*s,4.8*s,3.6*s]);add('cone','#edf3ee',[x,2.4*s,z],[2.4*s,2*s,2.4*s]);}
  for(let i=0;i<8;i++){const x=(random()-.5)*13,z=(random()-.5)*13;add('cone','#65877b',[x,.8,z],[.7,2.2,.7]);}
 }else if(kind==='forest'){
  for(let i=0;i<10;i++){const x=-2+i*.45;add('box','#b49a7a',[x,.65,0],[.4,.12,1.05]);}
  for(let i=0;i<16;i++){const p=[(random()-.5)*12,.6+random()*2,(random()-.5)*12];const id=add('sphere','#fff0b8',p,[.1,.1,.1]);movers.push({id,p,phase:random()*6});}
 }else{
  add('box','#dbccb2',[0,.22,0],[12,.09,1.2]);add('box','#dbccb2',[0,.23,0],[1.2,.09,11]);
  const colors=['#e8d7b9','#d6b9b7','#d9dfc3','#c4d4dc'];
  for(let i=0;i<6;i++){const x=(i%3-1)*3.1,z=i<3?-3:3;const height=1.4+random()*.7;
   add('box',colors[(i+seed)%4],[x,height/2+.3,z],[1.8,height,1.7]);
   add('cone',i%2?'#809b96':'#b5918b',[x,height+.8,z],[2.6,1,2.6],{rotation:[0,Math.PI/4,0]});
   add('box','#ffe8ad',[x,height*.55,z+.86],[.55,.55,.03]);
  }
  for(let i=0;i<5;i++){const p=[-4+i*2,.55,(random()-.5)*.5];const id=add('sphere',colors[i%4],p,[.25,.6,.25]);movers.push({id,p,phase:random()*6});}
 }
 island.onFrame(t=>{for(const m of movers)island.move(m.id,{position:[m.p[0]+Math.sin(t*.5+m.phase)*.12,m.p[1]+Math.sin(t+m.phase)*.08,m.p[2]]});});
}
export function applyWorldTemplate(scene,kind,variant=0){
 const s=structuredClone(scene);s.worldTemplate=kind;s.worldVariant=variant;s.program=`// Generated starting world: ${kind}, variation ${variant}\n(${buildWorld.toString()})(island,${JSON.stringify(kind)},${variant});`;
 if(kind==='planet')s.objects=s.objects.filter(o=>['house','cat','rabbit','bird'].includes(o.kind)).slice(0,10).map((o,i)=>({...o,x:(i%3-1)*1.2,z:-1+Math.floor(i/3)*.7,y:6+(o.kind==='bird'?1:o.kind==='house'?o.y:0)}));
 if(kind==='ocean')s.objects=s.objects.filter(o=>['house','cat','rabbit','bird','tree','plant'].includes(o.kind)).slice(-9).map((o,i)=>({...o,x:-3+Math.cos(i*2.4)*(o.kind==='house'?.1:1.2),z:1+Math.sin(i*2.4)*1.2,y:o.kind==='bird'?2:o.kind==='house'?o.y+.15:.15}));
 if(kind==='desert'){s.ecosystem.biome='meadow';s.objects=s.objects.filter(o=>['bird','cat','rabbit'].includes(o.kind)).slice(0,4);}
 if(kind==='plain'){s.ecosystem.biome='meadow';s.objects=s.objects.filter(o=>!['tree','pine','river','waterfall','pond'].includes(o.kind));}
 if(kind==='alpine'){s.ecosystem.biome='alpine';s.ecosystem.season='winter';s.objects=s.objects.filter(o=>!['flowers','river','waterfall','pond'].includes(o.kind));}
 if(kind==='society')s.objects=s.objects.filter(o=>!['river','waterfall','pond'].includes(o.kind)&&(!['tree','pine'].includes(o.kind)||Math.abs(o.x)>5||Math.abs(o.z)>5));
 return s;
}
