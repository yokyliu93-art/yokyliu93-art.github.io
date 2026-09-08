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
  // A round miniature world; every continent is sampled directly on the sphere.
  const ocean=['#79adb6','#a29ebe','#78b6ad'][seed%3];
  add('sphere',ocean,[0,0,0],[12,12,12],{detail:'high',roughness:.45});
  const patch=(lat,lon,width,height,color)=>{
   const vertices=[],indices=[],rings=9,steps=40;
   for(let r=0;r<=rings;r++)for(let j=0;j<=steps;j++){
    const a=j/steps*Math.PI*2,f=r/rings,wobble=1+.12*Math.sin(a*3+lat)+.08*Math.cos(a*5+lon);
    const u=lat+Math.sin(a)*height*f*wobble,v=lon+Math.cos(a)*width*f*wobble;
    const radius=6.045+.12*Math.sin(f*Math.PI);
    vertices.push(radius*Math.cos(u)*Math.cos(v),radius*Math.sin(u),radius*Math.cos(u)*Math.sin(v));
    if(r<rings&&j<steps){const k=r*(steps+1)+j;indices.push(k,k+steps+1,k+1,k+1,k+steps+1,k+steps+2);}
   }
   add('custom',color,[0,0,0],[1,1,1],{vertices,indices,smooth:true});
  };
  patch(1.35,.8,1.2,.38,'#becb99');patch(.35,.7,.55,.48,'#b4c598');patch(-.3,1.8,.45,.36,'#d3d3a5');patch(.15,-1,.5,.5,'#abc39c');patch(-.7,-2.4,.35,.24,'#c8d0ad');
  // Bands have depth and a tilted orbit, leaving the globe readable in silhouette.
  for(let band=0;band<2;band++){const vertices=[];const inner=7.5+band*.6,outer=inner+.32;for(let j=0;j<100;j++){const a=j/100*Math.PI*2,b=(j+1)/100*Math.PI*2,pt=(t,r)=>[Math.cos(t)*r,Math.sin(t)*r*.22,Math.sin(t)*r];vertices.push(...pt(a,inner),...pt(b,inner),...pt(a,outer),...pt(a,outer),...pt(b,inner),...pt(b,outer));}add('custom',band?'#d4c8b9':'#ebd7ad',[0,0,0],[1,1,1],{vertices,opacity:.8});}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,y=2.1+Math.sin(i*1.5)*1.3,r=Math.sqrt(6.6*6.6-y*y);const p=[Math.cos(a)*r,y,Math.sin(a)*r];add('sphere','#f3ecd9',p,[1.1,.42,.7]);add('sphere','#f5efdf',[p[0]+.32,p[1]+.08,p[2]],[.65,.48,.6]);}
  add('sphere','#ecdcc3',[7.4,6,-3.6],[1.45,1.45,1.45]);
  for(let i=0;i<12;i++){const a=random()*6.28,r=7+random();const p=[Math.cos(a)*r,3+random()*5,Math.sin(a)*r];const id=add('sphere','#f7e5b5',p,[.07,.07,.07],{emissive:'#f7e5b5'});movers.push({id,p,phase:random()*6});}
 }else if(kind==='ocean'){
  // Deep water, a sandy seabed, a tessellated surface and moving foam are separate volumes.
  add('sphere','#668e94',[0,-2,0],[17.8,3.8,17.8]);
  add('cylinder','#5a9fac',[0,-1.1,0],[17.6,1.9,17.6],{opacity:.52,roughness:.2});
  const vertices=[],indices=[],rings=15,steps=80;
  for(let r=0;r<=rings;r++)for(let j=0;j<=steps;j++){const a=j/steps*6.2831853,d=r/rings*8.8,x=Math.cos(a)*d,z=Math.sin(a)*d;vertices.push(x,.23+Math.sin(x*.85+z*.5)*.13+Math.cos(z*1.3-x*.3)*.09,z);if(r<rings&&j<steps){const k=r*(steps+1)+j;indices.push(k,k+steps+1,k+1,k+1,k+steps+1,k+steps+2);}}
  const surface=add('custom',['#81c4cb','#82c7bf','#87bbce'][seed%3],[0,0,0],[1,1,1],{vertices,indices,smooth:true,roughness:.22});
  add('sphere','#b3d8c5',[-3,.22,1],[5.4,.6,4.9]);add('sphere','#ece0b9',[-3,.38,1],[4.8,.65,4.3]);add('sphere','#bdcda1',[-3.6,.55,.7],[2.9,.6,2.8]);
  add('sphere','#b4d9cc',[4,.25,-3],[3.8,.55,3.4]);add('sphere','#eee2bd',[4,.36,-3],[3.2,.6,2.8]);
  for(let i=0;i<9;i++){const a=i/9*6.28;add('sphere',i%2?'#a6b8a4':'#c4c6ab',[4+Math.cos(a)*1.35,.38,-3+Math.sin(a)*1.15],[.4,.36,.5]);}
  const waves=[];
  for(let i=0;i<14;i++){const a=i*2.4,r=2+i%6,x=Math.cos(a)*r,z=Math.sin(a)*r,v=[];for(let j=0;j<16;j++){const u=j/16*1.2,w=(j+1)/16*1.2,pt=(t,d)=>[t-.6,.035*Math.sin(t*4)+d,Math.sin(t*2)*.12+d];v.push(...pt(u,0),...pt(w,0),...pt(u,.032),...pt(u,.032),...pt(w,0),...pt(w,.032));}const p=[x,.27+Math.sin(x*.85+z*.5)*.13+Math.cos(z*1.3-x*.3)*.09,z],id=add('custom','#daeee1',p,[1,1,1],{vertices:v,rotation:[0,a,0],opacity:.65});waves.push({id,p,phase:a});}
  const boat=[];const part=(shape,color,p,scale,extra)=>{const id=add(shape,color,p,scale,extra);boat.push({id,p});return id;};
  const hull=part('sphere','#a77760',[0,.5,0],[.92,.45,1.7]);part('sphere','#e5c7a0',[0,.64,0],[.78,.15,1.35]);part('cylinder','#9b7f63',[0,1.3,0],[.06,1.5,.06]);part('custom','#f4e7cb',[0,1.34,0],[1,1,1],{vertices:[.05,-.55,0,.05,.7,0,.7,-.5,0,.05,-.55,.015,.7,-.5,.015,.05,.7,.015]});part('custom','#dab6ae',[-.03,1.12,0],[1,1,1],{vertices:[0,-.32,0,0,.52,0,-.45,-.3,0]});
  let sailing=true,progress=.3,last=0;island.onClick(id=>{if(boat.some(p=>p.id===id))sailing=!sailing;});
  island.onFrame(t=>{if(sailing)progress+=Math.min(t-last,.2)*.13;last=t;island.move(surface,{position:[0,Math.sin(t*.6)*.025,0]});for(const w of waves)island.move(w.id,{position:[w.p[0]+Math.sin(t*.45+w.phase)*.18,w.p[1]+Math.sin(t*.7+w.phase)*.025,w.p[2]]});for(const part of boat){const a=-progress,cos=Math.cos(a),sin=Math.sin(a);island.move(part.id,{position:[2.4+Math.cos(progress)*1.6+part.p[0]*cos+part.p[2]*sin,part.p[1]+Math.sin(t*1.2)*.05,2.4+Math.sin(progress)*2-part.p[0]*sin+part.p[2]*cos],rotation:[0,a,Math.sin(t)*.025]});}});return;
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
export function worldProgram(kind,variant=0){return `// Generated starting world: ${kind}, variation ${variant}\n(${buildWorld.toString()})(island,${JSON.stringify(kind)},${variant});`}
export function applyWorldTemplate(scene,kind,variant=0){
 const s=structuredClone(scene);s.worldTemplate=kind;s.worldVariant=variant;s.program=worldProgram(kind,variant);
 if(kind==='planet')s.objects=s.objects.filter(o=>['house','cat','rabbit','bird','dog','bear','fox','unicorn'].includes(o.kind)).slice(0,10).map((o,i)=>({...o,x:(i%3-1)*1.2,z:-1+Math.floor(i/3)*.7,y:Math.sqrt(36-((i%3-1)*1.2)**2-(-1+Math.floor(i/3)*.7)**2)+.09+(o.kind==='bird'?1:o.kind==='house'?o.y:0)}));
 if(kind==='ocean')s.objects=s.objects.filter(o=>['house','cat','rabbit','bird','dog','bear','fox','unicorn','tree','plant'].includes(o.kind)).slice(-9).map((o,i)=>({...o,x:-3+Math.cos(i*2.4)*(o.kind==='house'?.1:1.2),z:1+Math.sin(i*2.4)*1.2,y:o.kind==='bird'?2:o.kind==='house'?o.y+.68:.68}));
 if(kind==='desert'){s.ecosystem.biome='meadow';s.objects=s.objects.filter(o=>['bird','cat','rabbit','dog','bear','fox','unicorn'].includes(o.kind)).slice(0,4);}
 if(kind==='plain'){s.ecosystem.biome='meadow';s.objects=s.objects.filter(o=>!['tree','pine','river','waterfall','pond'].includes(o.kind));}
 if(kind==='alpine'){s.ecosystem.biome='alpine';s.ecosystem.season='winter';s.objects=s.objects.filter(o=>!['flowers','river','waterfall','pond'].includes(o.kind));}
 if(kind==='society')s.objects=s.objects.filter(o=>!['river','waterfall','pond'].includes(o.kind)&&(!['tree','pine'].includes(o.kind)||Math.abs(o.x)>5||Math.abs(o.z)>5));
 return s;
}
