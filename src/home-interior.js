import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {modelObject,updateModels} from './model-library.js';
export const FURNITURE={sofa:'沙发',bed:'床',desk:'书桌',chair:'椅子',table:'茶几',bookshelf:'书架',plant:'盆栽',lamp:'落地灯',recordPlayer:'唱片机'};
const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.86});
function box(parent,size,position,color,radius=.025){const m=new THREE.Mesh(new RoundedBoxGeometry(...size,2,Math.min(radius,...size.map(x=>x/3))),material(color));m.position.set(...position);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function recordPlayer(){const g=new THREE.Group();box(g,[.95,.42,.42],[0,.55,0],'#ac855c');box(g,[.86,.03,.36],[0,.785,0],'#82937b');for(const x of [-.37,.37])for(const z of [-.13,.13])box(g,[.07,.34,.07],[x,.17,z],'#9a7551');for(const x of [-.24,.24]){box(g,[.35,.31,.015],[x,.55,.218],'#d5be91');for(let i=0;i<7;i++)box(g,[.015,.27,.012],[x-.135+i*.045,.55,.23],'#b09970',.002);}const disc=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.012,48),material('#313738'));disc.position.set(-.08,.812,0);g.add(disc);const label=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.014,24),material('#d1a795'));disc.add(label);box(g,[.035,.06,.035],[.3,.82,-.1],'#c4a15e');const arm=box(g,[.25,.025,.025],[.19,.86,-.035],'#c4a15e',.005);arm.rotation.y=-.45;g.userData.disc=disc;return g;}
export function furniture(kind){if(kind==='recordPlayer')return recordPlayer();if(kind==='bookshelf'){const g=new THREE.Group();for(const x of [-.55,.55])box(g,[.07,1.6,.35],[x,.8,0],'#ac8c65');for(const y of [.05,.57,1.08,1.58])box(g,[1.1,.055,.35],[0,y,0],'#ac8c65');for(let i=0;i<15;i++)box(g,[.08,.3+(i%3)*.03,.22],[-.44+(i%5)*.18,.25+Math.floor(i/5)*.51,0],['#91a692','#b8a1b9','#d0b38b'][i%3]);return g;}return modelObject(kind);}
export function cottage(){
 const g=new THREE.Group();box(g,[3.8,.16,3.2],[0,.08,0],'#d7c6a6');box(g,[3.6,2.3,.15],[0,1.3,-1.5],'#f0e5cc');for(const x of [-1.73,1.73])box(g,[.15,2.3,3],[x,1.3,0],'#e7dfc8');
 const front=new THREE.Shape();front.moveTo(-1.8,.15);front.lineTo(1.8,.15);front.lineTo(1.8,2.5);front.lineTo(0,3.4);front.lineTo(-1.8,2.5);front.closePath();
 const door=new THREE.Path();door.moveTo(-.55,.15);door.lineTo(-.55,1.55);door.absarc(0,1.55,.55,Math.PI,0,true);door.lineTo(.55,.15);door.closePath();front.holes.push(door);
 for(const x of [-1.15,1.15]){const window=new THREE.Path();window.moveTo(x-.28,1.05);window.lineTo(x-.28,1.75);window.lineTo(x+.28,1.75);window.lineTo(x+.28,1.05);window.closePath();front.holes.push(window);box(g,[.53,.66,.04],[x,1.4,1.5],'#f6d89e');box(g,[.055,.7,.06],[x,1.4,1.55],'#fff0d0');box(g,[.57,.05,.06],[x,1.4,1.55],'#fff0d0');for(const side of [-1,1])box(g,[.17,.75,.08],[x+side*.37,1.4,1.55],'#8aaa97');box(g,[.75,.16,.23],[x,.97,1.65],'#bc9c76');for(let i=0;i<5;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),material(i%2?'#aaba93':'#dfb0ab'));leaf.position.set(x-.24+i*.12,1.1,1.66);g.add(leaf);}}
 const facade=new THREE.Mesh(new THREE.ExtrudeGeometry(front,{depth:.16,bevelEnabled:false}),material('#f4e8cd'));facade.position.z=1.42;facade.castShadow=true;facade.receiveShadow=true;g.add(facade);
 for(const x of [-1,1]){const roof=box(g,[2.25,.15,3.65],[x*.93,2.95,0],'#70978d');roof.rotation.z=-x*.46;for(let i=0;i<10;i++){const seam=box(g,[2.26,.025,.018],[x*.93,3.035,-1.62+i*.36],'#89aaa0',.002);seam.rotation.z=-x*.46;}}
 box(g,[1.4,.1,.75],[0,.05,1.95],'#c4b393');box(g,[.4,.9,.4],[-1.1,2.9,-.7],'#d8c3a1');box(g,[.52,.1,.5],[-1.1,3.38,-.7],'#ecdec5');g.userData.house=true;return g;
}
export function homeInterior(scene,walker,island){
 const root=new THREE.Group();root.visible=false;scene.add(root);let room=null,savedPosition,objects=[],playing=false;
 const audio=new Audio('/music/chan-ming.mp3');audio.loop=true;audio.volume=.5;
 function stop(){audio.pause();playing=false;}
 function rebuild(record,items){stop();root.traverse(m=>{let imported=false;for(let p=m;p&&p!==root;p=p.parent)if(p.userData.model)imported=true;if(!imported){m.geometry?.dispose();m.material?.dispose();}m.userData.mixer?.stopAllAction();});root.clear();room=record;const w=record.width,d=record.depth,h=record.height,winTop=Math.min(2.3,h-.1),doorTop=Math.min(2.5,h-.1),doorWidth=Math.min(2.4,w-.2);
 const floor=box(root,[w,.16,d],[0,-.08,0],'#d9c7a6');floor.userData.walkable=true;
 box(root,[w,h,.2],[0,h/2,-d/2],'#eee9d9');
 for(const x of [-w/2,w/2]){box(root,[.2,.9,d],[x,.45,0],'#e9e3d0');box(root,[.2,h-winTop,d],[x,(h+winTop)/2,0],'#e9e3d0');for(const z of [-(d+1.8)/4,(d+1.8)/4])box(root,[.2,winTop-.9,(d-1.8)/2],[x,(winTop+.9)/2,z],'#e9e3d0');}
 for(const x of [-(w+doorWidth)/4,(w+doorWidth)/4])box(root,[(w-doorWidth)/2,h,.2],[x,h/2,d/2],'#eee9d9');box(root,[Math.min(2.4,w-.2),h-doorTop,.2],[0,(h+doorTop)/2,d/2],'#eee9d9');
 const ceiling=box(root,[w,.16,d],[0,h+.08,0],'#f5f0e3');ceiling.userData.ceiling=true;
 // The roof is cut away only in overhead decoration mode.
 objects=items.filter(o=>o.roomId===record.id).map(o=>{const g=furniture(o.kind);g.position.set(o.x,o.y,o.z);g.rotation.y=o.rotation;g.userData.furnitureId=o.id;root.add(g);return {record:o,group:g};});
 const light=new THREE.PointLight('#fff0cd',12,12,2);light.position.set(0,h-.3,0);root.add(light);
 }
 return {get active(){return !!room;},get room(){return room;},enter(record,items){savedPosition=walker.position;rebuild(record,items);root.visible=true;island.visible=false;walker.setArea(root,record,[0,.01,record.depth/2-1]);},refresh(record,items){rebuild(record,items);},leave(){stop();root.visible=false;island.visible=true;room=null;walker.setArea(island,null,(savedPosition||new THREE.Vector3(0,.2,5.5)).toArray());},nearRecord(){return objects.some(o=>o.record.kind==='recordPlayer'&&o.group.position.distanceTo(walker.position)<1.8);},async toggle(){if(playing){stop();return false;}await audio.play();playing=true;return true;},get playing(){return playing;},update(dt){if(!room)return;updateModels(root,dt);root.children.filter(c=>c.userData.ceiling).forEach(c=>c.visible=walker.stats().mode!=='overhead');for(const o of objects)if(playing&&o.group.userData.disc)o.group.userData.disc.rotation.y+=dt*3.49;},dispose(){stop();audio.src='';}};
}
