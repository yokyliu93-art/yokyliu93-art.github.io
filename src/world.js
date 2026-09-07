import {islandWalk} from './island-walk.js';
import {mountProgram} from './program-runtime.js';
import {livingAtmosphere} from './atmosphere.js';
import {seasonalEnvironment} from './seasons.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createWorld(container, state, onCollect, onPlace, options = {}) {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({antialias:!options.lightweight,alpha:false,preserveDrawingBuffer:!options.lightweight,powerPreference:options.lightweight?'default':'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,options.lightweight?1:1.8)); renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=!options.lightweight; renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  container.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(innerWidth<700?58:36,innerWidth/innerHeight,.1,240);
  const homePosition=new THREE.Vector3(22,15,27);
  camera.position.copy(homePosition);if(options.ecosystemOnly&&innerWidth<750)camera.setViewOffset(innerWidth,innerHeight,0,innerHeight*.17,innerWidth,innerHeight);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.minDistance=16;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.18;controls.enablePan=false;
  const skyUniform={top:{value:new THREE.Color('#93c8d5')},bottom:{value:new THREE.Color('#e7f1df')}};
  const sky=new THREE.Mesh(new THREE.SphereGeometry(180,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:skyUniform,vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;uniform vec3 top;uniform vec3 bottom;void main(){float h=normalize(v).y;gl_FragColor=vec4(mix(bottom,top,smoothstep(-.8,.35,h)),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));scene.add(sky);
  scene.fog=new THREE.FogExp2('#dcebdc',.0045);
  const ambient=new THREE.HemisphereLight('#fff6dd','#55847d',1.9);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#fff0cc',2.6);sun.position.set(-12,22,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:70});sun.shadow.bias=-.0006;sun.shadow.normalBias=.08;scene.add(sun);
  const fill=new THREE.DirectionalLight('#a9d8e1',1.4);fill.position.set(12,6,-10);scene.add(fill);
  const island=new THREE.Group();scene.add(island);
  const terrain=new THREE.Group();island.add(terrain);
  const decor=new THREE.Group();island.add(decor);
  const walker=islandWalk({camera,controls,canvas:renderer.domElement,island});
  const program=mountProgram(island,renderer.domElement,camera,text=>window.dispatchEvent(new CustomEvent('island-program-status',{detail:text})));
  const mats=new Map();
  function mat(color,extra={}){const key=color+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:.88,...extra}));return mats.get(key);}
  function mesh(geo,color,pos=[0,0,0],scale=[1,1,1],parent=island,extra={}){const m=new THREE.Mesh(geo,mat(color,extra));m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const sphere=new THREE.IcosahedronGeometry(1,1),box=new THREE.BoxGeometry(1,1,1);
  function ball(c,p,s,parent=island){return mesh(sphere,c,p,s,parent)}
  function block(c,p,s,parent=island){return mesh(box,c,p,s,parent)}
  function rod(a,b,r,c,parent=island){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const m=mesh(new THREE.CylinderGeometry(r*.8,r,d.length(),7),c,av.clone().add(bv).multiplyScalar(.5).toArray(),[1,1,1],parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
  let seed=48;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
  function islandBase(parent,radius=8){
    const n=56,rings=[[radius*.91,.1],[radius,.0],[radius*.97,-.48],[radius*.83,-1.25],[radius*.68,-3.5],[radius*.36,-6.1],[radius*.04,-7.2]];
    const verts=[],cols=[];const colors=['#a1b98c','#8aa783','#719387','#54817d','#527978','#638783'];
    const wobble=Array.from({length:n},(_,i)=>1+Math.sin(i*2.7)*.035+Math.sin(i*.8)*.065);
    for(let k=0;k<rings.length-1;k++)for(let i=0;i<n;i++){
      let j=(i+1)%n;const point=(ring,v)=>[Math.cos(v/n*Math.PI*2)*rings[ring][0]*wobble[v],rings[ring][1]+(ring>1?Math.sin(v*2.1)*.2:0),Math.sin(v/n*Math.PI*2)*rings[ring][0]*wobble[v]];
      const c=new THREE.Color(colors[k]);c.multiplyScalar(.88+rnd()*.23);
      for(const p of [point(k,i),point(k+1,i),point(k,j),point(k,j),point(k+1,i),point(k+1,j)]){verts.push(...p);cols.push(c.r,c.g,c.b);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide}));m.castShadow=true;m.receiveShadow=true;parent.add(m);
    mesh(new THREE.CylinderGeometry(radius*.945,radius*.95,.15,56), '#aac49a',[0,.08,0],[1,1,1],parent);
  }
  islandBase(terrain);
  const flatGround=terrain.children[1].geometry;
  const heightAt=(x,z)=>.15+2.1*Math.exp(-((x+4)**2+(z+3.5)**2)/5)+1.4*Math.exp(-((x-4)**2+(z+4)**2)/4);
  const landVertices=[];const point=(r,a)=>{const x=Math.cos(a)*r,z=Math.sin(a)*r;return [x,heightAt(x,z),z];};
  for(let ring=0;ring<16;ring++)for(let j=0;j<56;j++){const a=j/56*Math.PI*2,b=(j+1)/56*Math.PI*2,r=ring/16*7.55,t=(ring+1)/16*7.55;landVertices.push(...point(r,a),...point(t,b),...point(t,a),...point(r,a),...point(r,b),...point(t,b));}
  const sculptedGround=new THREE.BufferGeometry();sculptedGround.setAttribute('position',new THREE.Float32BufferAttribute(landVertices,3));sculptedGround.computeVertexNormals();

  for(let i=0;i<43;i++){const a=rnd()*Math.PI*2,r=6.9+rnd()*.7;ball(i%3?'#6c9481':'#aac49a',[Math.cos(a)*r,-.25-rnd()*.8,Math.sin(a)*r],[.35+rnd()*.8,.4+rnd()*.5,.4+rnd()*.7],terrain);}
  // Curving stream, its mouth meeting the waterfall at the front edge.
  const streamShape=new THREE.Shape();streamShape.moveTo(-1.8,-6.6);streamShape.bezierCurveTo(-4,-4,-2.8,-2,-.5,-.7);streamShape.bezierCurveTo(2,1,2.6,3.5,1.1,7.55);streamShape.lineTo(2.6,7.2);streamShape.bezierCurveTo(4.5,2.7,3,.3,.6,-1.8);streamShape.bezierCurveTo(-1.8,-3.7,-1.1,-5,-.4,-6.7);streamShape.closePath();
  const water=mesh(new THREE.ShapeGeometry(streamShape,36),'#80cbd0',[0,.19,0],[1,1,1],terrain,{roughness:.23,metalness:.1});water.rotation.x=Math.PI/2;water.material.side=THREE.DoubleSide;
  // Pond bank, reeds, stepping stones.
  for(let i=0;i<14;i++){const z=-5+i*.75,x=Math.sin(z*.7)*1.6;ball('#d2d5b0',[x-1.4,.22,z],[.25+rnd()*.2,.12,.28],terrain);}
  for(let i=0;i<8;i++){const z=2.3+i*.44,x=3.4+(i%2)*.2;ball('#d7d8bd',[x,.21,z],[.48,.1,.31],terrain);}
  const waterfall=new THREE.Group();terrain.add(waterfall);
  for(let i=0;i<15;i++){const x=1.06+i*.105,z=7.1+Math.sin(i)*.1;const m=block(i%3?'#a7e6df':'#d7f4e4',[x,-2.35,z],[.1,5.1+rnd()*.8,.09],waterfall);m.material=mat(i%3?'#a7e6df':'#d7f4e4',{transparent:true,opacity:.7,roughness:.3});}
  const foam=[];for(let i=0;i<34;i++){const m=ball('#e2f6e7',[1+rnd()*1.9,-rnd()*6,7+rnd()*.4],[.04,.15,.04],waterfall);foam.push(m);}
  function tree(parent,x,z,size=1,pink=false){const g=new THREE.Group();g.position.set(x,.17,z);g.scale.setScalar(size);parent.add(g);rod([0,0,0],[.04,2.5,0],.17,'#8b7860',g);rod([0,1.3,0],[-.8,2.6,.2],.085,'#8b7860',g);rod([0,1.7,0],[.8,2.9,-.2],.09,'#8b7860',g);const palette=pink?['#dc9b9a','#d68e8d','#e8afa4','#c77c80']:['#88a685','#9eb793','#b7c49a','#789984'];for(let i=0;i<19;i++){const a=rnd()*6.28,r=rnd()*1.2;ball(palette[i%4],[Math.cos(a)*r,2.55+rnd()*1.1,Math.sin(a)*r],[.7+rnd()*.38,.55+rnd()*.35,.65+rnd()*.3],g);}return g;}
  tree(decor,-4,-2.5,1.35,true);tree(decor,-5.7,.5,.78,true);tree(decor,5,-3.2,.9);tree(decor,3.7,-5.2,.66);tree(decor,-2.7,-5.4,.66);
  function pine(parent,x,z,s=1){const g=new THREE.Group();g.position.set(x,.2,z);g.scale.setScalar(s);parent.add(g);rod([0,0,0],[0,2.2,0],.1,'#7e7e5d',g);for(let i=0;i<3;i++)mesh(new THREE.ConeGeometry(1-i*.19,1.45,7),'#6d9780',[0,1.2+i*.65,0],[1,1,1],g);return g;}
  pine(decor,-5,-4,.85);pine(decor,5.6,-1.5,.85);pine(decor,4.8,-5,.7);
  function house(parent,x,z,s=1){const g=new THREE.Group();g.position.set(x,.2,z);g.scale.setScalar(s);parent.add(g);
    block('#d4cbb0',[0,.13,0],[2.9,.25,2.7],g);block('#f5e6c8',[0,1.22,0],[2.45,2.05,2.15],g);
    const roofShape=new THREE.Shape();roofShape.moveTo(-1.52,0);roofShape.lineTo(0,1.42);roofShape.lineTo(1.52,0);roofShape.closePath();const roof=mesh(new THREE.ExtrudeGeometry(roofShape,{depth:2.7,bevelEnabled:false}),'#5c8280',[0,2.19,-1.35],[1,1,1],g);
    for(let i=-1;i<=1;i+=2){const raf=block('#3e6564',[i*.77,2.91,0],[2.1,.1,2.84],g);raf.rotation.z=-i*.75;}
    for(let i=0;i<9;i++){const z=-1.25+i*.31;rod([-1.49,2.22,z],[0,3.65,z],.028,'#779895',g);rod([0,3.65,z],[1.49,2.22,z],.028,'#779895',g);}
    block('#897d60',[.3,.73,1.085],[.59,1.37,.08],g);block('#c8e2bc',[.3,1.1,1.14],[.34,.37,.02],g);ball('#d6bb7c',[.5,.7,1.16],[.04,.04,.04],g);
    for(const x of [-.77,.87]){block('#7b927e',[x,1.45,1.095],[.57,.65,.06],g);block('#ffdc8a',[x,1.45,1.14],[.44,.52,.025],g).material=mat('#f3d28d',{emissive:'#ffc466',emissiveIntensity:.6});block('#f1e8c8',[x,1.45,1.17],[.04,.55,.03],g);block('#f1e8c8',[x,1.45,1.17],[.49,.04,.03],g);}
    block('#b8cdb2',[-1.24,1.42,0],[.04,.7,.75],g);block('#f0dfba',[-1.27,1.42,0],[.04,.05,.8],g);block('#f0dfba',[-1.27,1.42,0],[.04,.75,.05],g);
    block('#b3a289',[.7,2.95,-.65],[.38,1.25,.4],g);block('#ede0bf',[.7,3.6,-.65],[.51,.12,.52],g);
    block('#c1b292',[0,.14,1.52],[1.45,.22,.5],g);block('#d6c8a6',[0,.04,1.88],[1.7,.16,.45],g);
    return g;}
  house(decor,2.7,-2.3,1.1);
  function bench(parent,x,z){const g=new THREE.Group();g.position.set(x,.2,z);parent.add(g);for(let i=0;i<3;i++)block('#b5a27c',[0,.52,i*.18],[1.55,.1,.14],g);for(let i=0;i<2;i++)block('#b5a27c',[0,.9+i*.2,-.12],[1.55,.13,.1],g);for(const a of [-.55,.55]){rod([a,0,.05],[a,1.13,-.15],.05,'#718371',g);rod([a,0,.4],[a,.53,.4],.05,'#718371',g);}return g;}
  bench(decor,-3.6,2.1).rotation.y=.4;
  function lamp(parent,x,z){const g=new THREE.Group();g.position.set(x,.2,z);parent.add(g);rod([0,0,0],[0,1.32,0],.045,'#6d806a',g);block('#6d806a',[0,1.5,0],[.29,.36,.29],g);block('#ffe2a1',[0,1.5,.155],[.21,.25,.02],g).material=mat('#ffe2a1',{emissive:'#ffd381',emissiveIntensity:1});mesh(new THREE.ConeGeometry(.26,.18,4),'#6d806a',[0,1.78,0],[1,1,1],g).rotation.y=Math.PI/4;return g;}
  lamp(decor,-2.4,3.4);lamp(decor,4,1.3);
  // A small timber footbridge over the stream.
  const bridge=new THREE.Group();bridge.position.set(.8,.26,1.3);bridge.rotation.y=-.35;decor.add(bridge);
  for(let i=0;i<12;i++)block('#c9b38d',[-1.7+i*.3,Math.sin(i/11*Math.PI)*.26,0],[.27,.11,1.0],bridge);
  for(const z of [-.58,.58]){for(const x of [-1.5,0,1.5])rod([x,0,z],[x,.82,z],.045,'#a39376',bridge);rod([-1.5,.72,z],[0,1,z],.036,'#b4a383',bridge);rod([0,1,z],[1.5,.72,z],.036,'#b4a383',bridge);}
  // Grass and tiny wildflowers share geometry to keep the scene lightweight.
  const grassGeo=new THREE.ConeGeometry(.027,.25,3);const grass=new THREE.InstancedMesh(grassGeo,mat('#7ca078'),1100);let gi=0;const dummy=new THREE.Object3D();
  for(let i=0;i<1500&&gi<1100;i++){const x=(rnd()-.5)*15,z=(rnd()-.5)*15;if(x*x+z*z>48 || (Math.abs(x)<2.5)|| (x>1&&x<4.5&&z<-.7&&z>-4))continue;dummy.position.set(x,.3,z);dummy.rotation.set(rnd()*.3,rnd()*6,0);dummy.scale.setScalar(.6+rnd());dummy.updateMatrix();grass.setMatrixAt(gi++,dummy.matrix);}grass.count=gi;terrain.add(grass);
  for(let i=0;i<95;i++){const a=rnd()*6.28,r=3.3+rnd()*3.7;const x=Math.cos(a)*r,z=Math.sin(a)*r;if(x>0&&z<0)continue;ball(i%3?'#f1ddb2':'#e5ada0',[x,.31,z],[.065,.065,.065],terrain);}
  const clouds=[];for(let i=0;i<19;i++){const g=new THREE.Group();const a=i/19*6.28;const r=40+rnd()*40;g.position.set(Math.cos(a)*r,-5-rnd()*9,Math.sin(a)*r);for(let j=0;j<7;j++){const m=ball('#f2f0de',[(j-3)*1.6,rnd()*1.1,0],[2.6,1.1+rnd(),1.5+rnd()],g);m.castShadow=false;m.material=mat('#f2f0de',{transparent:true,opacity:.38,depthWrite:false});}scene.add(g);clouds.push(g);}
  const neighborTargets=[];const neighborLines=[];const neighbors=[];for(let i=0;i<3;i++){const g=new THREE.Group();g.position.set([-21,19,-7][i],[-2,1,-1][i],[-16,-25,-37][i]);g.scale.setScalar([.46,.39,.29][i]);scene.add(g);islandBase(g,6);tree(g,-2,-1,1.2,i===0);house(g,1.6,0,.85);pine(g,3,-3,.8);neighbors.push(g);neighborTargets.push(g.position.clone());const line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xf5e4b5,transparent:true,opacity:.25}));scene.add(line);neighborLines.push(line);}
  const planet=mesh(new THREE.SphereGeometry(3,32,24),'#ebe0c3',[-35,23,-66],[1,1,1],scene);planet.castShadow=false;
  const ring=mesh(new THREE.RingGeometry(4,4.25,90),'#ebe3d2',[-35,23,-66],[1,1,1],scene,{side:THREE.DoubleSide,transparent:true,opacity:.45});ring.rotation.set(1.0,.4,-.3);
  const starArray=[];for(let i=0;i<550;i++){starArray.push((rnd()-.5)*180,12+rnd()*70,-20-rnd()*80);}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(starArray,3));const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:'#fff5d6',size:.11,transparent:true,opacity:.25}));scene.add(stars);
  const rainArr=new Float32Array(1200*3);for(let i=0;i<rainArr.length;i+=3){rainArr[i]=(rnd()-.5)*35;rainArr[i+1]=rnd()*24;rainArr[i+2]=(rnd()-.5)*35;}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(rainArr,3));const rain=new THREE.Points(rg,new THREE.PointsMaterial({color:'#daeee5',size:.055,transparent:true,opacity:.65}));scene.add(rain);
  const rainbow=new THREE.Group();rainbow.position.set(-3,-2,-19);scene.add(rainbow);['#e4a397','#e9b696','#e6d19e','#bcd3b2','#a4cbd0','#b3bdd4'].forEach((c,i)=>{const m=mesh(new THREE.TorusGeometry(12-i*.16,.095,6,90,Math.PI),c,[0,0,0],[1,1,1],rainbow,{transparent:true,opacity:.25,depthWrite:false});m.castShadow=false;});
  const collectibles=new THREE.Group();scene.add(collectibles);const starGeo=new THREE.OctahedronGeometry(.25);for(let i=0;i<7;i++){const a=i/7*6.28,m=mesh(starGeo,'#ffedaa',[Math.cos(a)*5,1.05,Math.sin(a)*5],[1,1.6,1],collectibles,{emissive:'#ffe8a0',emissiveIntensity:.7,metalness:.1});m.userData.baseY=1.05;m.userData.star=true;}
  if(options.ecosystemOnly)decor.clear();
  const placed=new Map();
  function addObject(obj){let g;switch(obj.type){case 'plant':g=tree(decor,0,0,.32,false);break;case 'pond':g=new THREE.Group();decor.add(g);ball('#8cced0',[0,.02,0],[1.5,.05,1.1],g);break;case 'river':case 'waterfall':g=new THREE.Group();decor.add(g);break;case 'flowers':case 'grass':case 'mushroom':g=new THREE.Group();decor.add(g);for(let j=0;j<9;j++){const x=Math.sin(j*2.4)*.65,z=Math.cos(j*2.4)*.65;rod([x,0,z],[x,.25,z],.025,'#7d9e74',g);ball(obj.type==='mushroom'?'#dca48c':obj.color==='rose'?'#e4afa8':'#ecdfb1',[x,.3,z],[.13,.08,.13],g);}break;case 'bird':case 'rabbit':case 'cat':case 'firefly':g=new THREE.Group();decor.add(g);ball(obj.type==='firefly'?'#f7e0a1':'#ece8cb',[0,.4,0],[.18,.13,.13],g);if(obj.type==='firefly')g.children[0].material=mat('#ffeca2',{emissive:'#ffdf99',emissiveIntensity:2});if(obj.type==='bird'){ball('#e5e5cf',[-.19,.45,0],[.2,.04,.13],g);ball('#e5e5cf',[.19,.45,0],[.2,.04,.13],g);}if(obj.type==='rabbit'){ball('#ece8cb',[.1,.66,0],[.05,.2,.05],g);ball('#ece8cb',[-.1,.66,0],[.05,.2,.05],g);}if(obj.type==='cat'){ball('#e6cfb1',[0,.55,.12],[.17,.16,.15],g);mesh(new THREE.ConeGeometry(.075,.16,3),'#e6cfb1',[-.1,.73,.1],[1,1,1],g);mesh(new THREE.ConeGeometry(.075,.16,3),'#e6cfb1',[.1,.73,.1],[1,1,1],g);rod([.1,.38,-.1],[.3,.7,-.3],.04,'#e6cfb1',g);}g.userData.fauna=obj.type;break;case 'tree':g=tree(decor,0,0,.8,obj.color==='rose');break;case 'pine':g=pine(decor,0,0,.8);break;case 'bench':g=bench(decor,0,0);break;case 'lamp':g=lamp(decor,0,0);break;case 'house':g=house(decor,0,0,.65);break;case 'rock':g=new THREE.Group();decor.add(g);ball('#afbba2',[0,.3,0],[.75,.6,.55],g);ball('#91a68d',[.5,.2,.3],[.4,.35,.4],g);break;}g??=new THREE.Group();if(!g.parent)decor.add(g);g.position.set(obj.x,(state.growing?heightAt(obj.x,obj.z):.2)+(obj.y||0),obj.z);g.userData.originX=obj.x;g.userData.originZ=obj.z;g.userData.originY=.2+(obj.y||0);g.rotation.y=obj.rotation||0;g.userData.id=obj.id;placed.set(obj.id,g);return g;}
  state.objects.forEach(addObject);
  let selected=null,ghost=null,validPlacement=false,rotation=0,visiting=null,targetPos=null,targetLook=null;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.2),hit=new THREE.Vector3();
  function pointerRay(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);}
  renderer.domElement.addEventListener('pointermove',e=>{if(!ghost)return;pointerRay(e);if(raycaster.ray.intersectPlane(plane,hit)){ghost.position.copy(hit);const r=8+state.expansions*.8;validPlacement=hit.x*hit.x+hit.z*hit.z<(r-.9)**2 && !(hit.x>1&&hit.x<4.4&&hit.z>-4&&hit.z<-.5);ghost.visible=validPlacement;}});
  let down;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;pointerRay(e);if(selected&&ghost&&validPlacement){onPlace({type:selected,x:ghost.position.x,z:ghost.position.z,rotation});return;}if(visiting)return;const hits=raycaster.intersectObjects(collectibles.children);if(hits.length){const m=hits[0].object;collectibles.remove(m);onCollect();setTimeout(()=>collectibles.add(m),25000);}});
  function select(type){if(ghost){decor.remove(ghost);placed.delete('ghost');ghost=null;}selected=type;rotation=0;validPlacement=false;if(type){ghost=addObject({type,id:'ghost',x:0,z:0});ghost.visible=false;ghost.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.transparent=true;m.material.opacity=.55;m.castShadow=false;}});}controls.enableRotate=!type;renderer.domElement.style.cursor=type?'crosshair':'grab';}
  function rotate(){rotation+=Math.PI/4;if(ghost)ghost.rotation.y=rotation;}
  function weather(){const night=state.time==='night',wet=state.weather==='rain';skyUniform.top.value.set(night?'#353756':wet?'#829eaa':'#93c8d5');skyUniform.bottom.value.set(night?'#9c9fbc':wet?'#c7d6d0':'#e7f1df');scene.fog.color.set(night?'#668a89':wet?'#b9ccc7':'#dcebdc');sun.intensity=night?.35:wet?1.5:2.6;ambient.intensity=night?1.0:wet?1.6:1.9;stars.material.opacity=night?.95:.15;rain.visible=wet;rainbow.visible=state.weather==='rainbow';renderer.toneMappingExposure=night?1.1:1.05;}
  function expand(){terrain.scale.set(1+state.expansions*.1,1,1+state.expansions*.1);}
  weather();expand();
  const seasons=options.ecosystemOnly?seasonalEnvironment(scene,{onSeason(season,blend){const ground={spring:"#b5cba0",summer:"#9fbd8e",autumn:"#c9b183",winter:"#e1e9e4"};terrain.children[1].material.color.set(ground[blend.from]).lerp(new THREE.Color(ground[blend.to]),blend.amount);const grassColors={spring:"#7ca078",summer:"#7ca078",autumn:"#b7a075",winter:"#dae4dc"};grass.material.color.set(grassColors[blend.from]).lerp(new THREE.Color(grassColors[blend.to]),blend.amount);}}):null;
  const atmosphere=options.ecosystemOnly&&!options.lightweight?livingAtmosphere({scene,island,water,waterfall,renderer,camera,controls}):null;
  const clock=new THREE.Timer();let elapsed=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(){clock.update();const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;if(state.daylight){const ratio=state.daylight==='day'?.75:state.daylight==='night'?.25:.5;const phase=(elapsed/240+(state.daylight==='night'?.4:0))%1;const nextTime=phase<ratio?'sunset':'night';if(state.time!==nextTime){state.time=nextTime;weather();}}seasons?.update(dt);if(!reduced){clouds.forEach((g,i)=>{g.position.x+=dt*.07;if(g.position.x>75)g.position.x=-75;});foam.forEach((m,i)=>{m.position.y-=dt*(2+i%3);if(m.position.y<-6)m.position.y=.1;});collectibles.children.forEach((m,i)=>{m.rotation.y=elapsed*.6;m.position.y=1.75+Math.sin(elapsed*1.5+i)*.17;});neighbors.forEach((g,i)=>{g.position.lerp(neighborTargets[i],.01);g.position.y=Math.sin(elapsed*.3+i)*.35-1;});}
    if(rain.visible){for(let i=1;i<rainArr.length;i+=3){rainArr[i]-=dt*12;if(rainArr[i]<-5)rainArr[i]=22;}rg.attributes.position.needsUpdate=true;}
    if(targetPos&&!walker.active){camera.position.lerp(targetPos,.045);controls.target.lerp(targetLook,.045);if(camera.position.distanceTo(targetPos)<.08){targetPos=null;targetLook=null;}}
    if(options.ecosystemOnly)placed.forEach(g=>{if(g.userData.fauna){g.position.x=g.userData.originX+Math.sin(elapsed*.4)*.5;g.position.y=g.userData.originY+.25+Math.sin(elapsed*1.4)*.12;}});if(walker.active)walker.update(dt);else controls.update();if(atmosphere)atmosphere.render(dt,elapsed);else renderer.render(scene,camera);
  }
  renderer.setAnimationLoop(animate);
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?58:36;if(!walker.active&&options.ecosystemOnly&&innerWidth<750)camera.setViewOffset(innerWidth,innerHeight,0,innerHeight*.17,innerWidth,innerHeight);else camera.clearViewOffset();camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  return {land(){targetPos=null;targetLook=null;return walker.land();},takeoff(){walker.leave();targetPos=homePosition.clone();targetLook=new THREE.Vector3();},walkInput:(key,on)=>walker.press(key,on),select,rotate,addObject,weather,expand,setEcology(next){state.growing=!!next.growing;terrain.children[1].geometry=next.growing?sculptedGround:flatGround;terrain.children[1].position.y=next.growing?0:.08;terrain.children.forEach((g,i)=>{if(i>=45&&g!==water&&g!==waterfall)g.visible=!next.growing;});terrain.visible=!['planet','ocean','desert'].includes(next.worldTemplate);program.load(next.program);Object.assign(state,{weather:next.weather,time:next.time,music:next.music,daylight:next.daylight});if(next.ecosystem){terrain.children[1].material.color.set(next.ecosystem.season==='winter'?'#dae3d4':({woodland:'#aac49a',wetland:'#91b49e',meadow:'#bccca0',alpine:'#b6c8bd'}[next.ecosystem.biome]||'#aac49a'));}for(const g of placed.values())decor.remove(g);placed.clear();next.objects.filter(o=>!o.roomId).forEach(o=>addObject({...o,type:o.kind}));water.visible=next.objects.some(o=>o.kind==='river');waterfall.visible=next.objects.some(o=>o.kind==='waterfall');collectibles.visible=false;weather();seasons?.refresh();},updateMatches(scores){scores.forEach((score,i)=>{const a=[-2.25,-.65,-1.7][i];const d=20+(100-score)*.7;neighborTargets[i].set(Math.cos(a)*d,-1,Math.sin(a)*d);const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,-2,0),new THREE.Vector3(neighborTargets[i].x*.5,-5,neighborTargets[i].z*.5),neighborTargets[i]);neighborLines[i].geometry.dispose();neighborLines[i].geometry=new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));});},removeObject(id){const g=placed.get(id);if(g){decor.remove(g);placed.delete(id);}},home(){visiting=null;targetPos=homePosition.clone();targetLook=new THREE.Vector3();},visit(i){select(null);visiting=i;const p=neighbors[i].position;targetLook=p.clone();targetPos=p.clone().add(new THREE.Vector3(11,9,14));},zoom(n){camera.position.sub(controls.target).multiplyScalar(n).clampLength(16,65).add(controls.target);},getCollectibleTargets(){return collectibles.children.map(m=>{const p=m.getWorldPosition(new THREE.Vector3()).project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};});},getStats(){return {walk:walker.stats(),program:program.stats(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,objects:placed.size,webgl:!!renderer.getContext()};}};
}
