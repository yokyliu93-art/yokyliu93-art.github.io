import * as THREE from 'three';
import {mountProgram} from './program-runtime.js';
export const DEFAULT_AVATAR_CODE=`// 可以让你的 Agent 重写这些网格。脚底 y=0，正面朝 +Z。
// 圆润、低重心的治愈系旅人。每一件都仍然可以被单独改写。
island.mesh({id:'body',shape:'sphere',color:'#769681',position:[0,.68,0],scale:[.72,.76,.5]});
island.mesh({id:'shirt',shape:'sphere',color:'#f2ead7',position:[0,.83,.22],scale:[.46,.34,.18]});
island.mesh({id:'collar-left',shape:'sphere',color:'#d9b68f',position:[-.12,.91,.29],scale:[.25,.12,.1],rotation:[0,0,-.35]});
island.mesh({id:'collar-right',shape:'sphere',color:'#d9b68f',position:[.12,.91,.29],scale:[.25,.12,.1],rotation:[0,0,.35]});
island.mesh({id:'hair-back',shape:'sphere',color:'#655248',position:[0,1.4,-.06],scale:[.84,.88,.72]});
island.mesh({id:'face',shape:'sphere',color:'#f0cfad',position:[0,1.39,.05],scale:[.75,.78,.69]});
for (const x of [-.25,.25]) island.mesh({id:'bob'+x,shape:'sphere',color:'#655248',position:[x,1.35,.02],scale:[.3,.55,.47]});
for (const x of [-.17,0,.17]) island.mesh({id:'fringe'+x,shape:'sphere',color:'#655248',position:[x,1.65,.28],scale:[.3,.23,.16],rotation:[0,0,x*1.4]});
for (const x of [-.14,.14]) island.mesh({id:'eye'+x,shape:'sphere',color:'#493f3a',position:[x,1.42,.395],scale:[.055,.075,.04]});
for (const x of [-.25,.25]) island.mesh({id:'cheek'+x,shape:'sphere',color:'#dda9a0',position:[x,1.3,.38],scale:[.1,.055,.035]});
for (const x of [-.4,.4]) island.mesh({id:'arm'+x,shape:'sphere',color:'#769681',position:[x,.7,.01],scale:[.24,.58,.25],rotation:[0,0,x*.38]});
for (const x of [-.17,.17]) island.mesh({id:'leg'+x,shape:'sphere',color:'#cfbea6',position:[x,.28,0],scale:[.22,.42,.23]});
for (const x of [-.18,.18]) island.mesh({id:'shoe'+x,shape:'sphere',color:'#66594f',position:[x,.095,.09],scale:[.29,.18,.42]});
island.mesh({id:'hair-pin',shape:'sphere',color:'#d8b66f',position:[.3,1.62,.3],scale:[.1,.1,.055]});`;
export function playerAvatar(canvas,camera){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);root.userData.player=true;
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.92});
 function part(geometry,color,x,y,z){const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);m.castShadow=true;body.add(m);return m;}
 const bodyShape=part(new THREE.SphereGeometry(.5,20,14),'#769681',0,.68,0);bodyShape.scale.set(.72,.76,.5);
 const shirt=part(new THREE.SphereGeometry(.5,16,12),'#f2ead7',0,.83,.22);shirt.scale.set(.46,.34,.18);
 for(const [x,r] of [[-.12,-.35],[.12,.35]]){const collar=part(new THREE.SphereGeometry(.5,12,8),'#d9b68f',x,.91,.29);collar.scale.set(.25,.12,.1);collar.rotation.z=r;}
 const hairBack=part(new THREE.SphereGeometry(.5,20,14),'#655248',0,1.4,-.06);hairBack.scale.set(.84,.88,.72);
 const face=part(new THREE.SphereGeometry(.5,20,14),'#f0cfad',0,1.39,.05);face.scale.set(.75,.78,.69);
 for(const x of [-.25,.25]){const bob=part(new THREE.SphereGeometry(.5,14,10),'#655248',x,1.35,.02);bob.scale.set(.3,.55,.47);}
 for(const x of [-.17,0,.17]){const fringe=part(new THREE.SphereGeometry(.5,12,8),'#655248',x,1.65,.28);fringe.scale.set(.3,.23,.16);fringe.rotation.z=x*1.4;}
 const legs=[-.17,.17].map(x=>{const leg=part(new THREE.SphereGeometry(.5,12,8),'#cfbea6',x,.28,0);leg.scale.set(.22,.42,.23);return leg;});
 const arms=[-.4,.4].map(x=>{const arm=part(new THREE.SphereGeometry(.5,12,8),'#769681',x,.7,.01);arm.scale.set(.24,.58,.25);arm.rotation.z=x*.38;return arm;});
 for(const x of [-.18,.18]){const shoe=part(new THREE.SphereGeometry(.5,12,8),'#66594f',x,.095,.09);shoe.scale.set(.29,.18,.42);}
 for(const x of [-.14,.14]){const eye=part(new THREE.SphereGeometry(.5,10,8),'#493f3a',x,1.42,.395);eye.scale.set(.055,.075,.04);}
 for(const x of [-.25,.25]){const cheek=part(new THREE.SphereGeometry(.5,10,8),'#dda9a0',x,1.3,.38);cheek.scale.set(.1,.055,.035);}
 const pin=part(new THREE.SphereGeometry(.5,10,8),'#d8b66f',.3,1.62,.3);pin.scale.set(.1,.1,.055);
 const custom=new THREE.Group();root.add(custom);custom.userData.player=true;
 let resolveLoad,stableSource='',backupSource='',attemptSource='',restoring=false;
 const code=mountProgram(custom,canvas,camera,message=>{window.dispatchEvent(new CustomEvent('avatar-status',{detail:message}));if(message.includes('已运行')){body.visible=false;stableSource=attemptSource;resolveLoad?.(true);resolveLoad=null;}else if(!message.includes('正在')){body.visible=true;resolveLoad?.(false);resolveLoad=null;if(!restoring&&backupSource&&backupSource!==attemptSource){restoring=true;attemptSource=backupSource;code.load(backupSource);}}},{avatar:true});
 return {root,load(source){if(source===stableSource)return Promise.resolve(true);backupSource=stableSource;attemptSource=source||'';restoring=false;body.visible=true;if(!source){code.load(null);stableSource='';return Promise.resolve(true);}return new Promise(resolve=>{resolveLoad=resolve;code.load(source);});},update(t,moving,first){root.visible=!first;legs.forEach((m,i)=>m.rotation.x=moving?Math.sin(t*9+i*Math.PI)*.38:0);arms.forEach((m,i)=>m.rotation.x=moving?-Math.sin(t*9+i*Math.PI)*.25:0);body.position.y=moving?Math.abs(Math.sin(t*9))*.025:Math.sin(t*2)*.008;},dispose:()=>code.dispose()};
}
