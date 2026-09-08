import * as THREE from 'three';
import {playerAvatar} from './player-avatar.js';
export function islandWalk({camera,controls,canvas,island,scene}){
 let active=false,landing=false,yaw=0,pitch=-.15,drag=null,elapsed=0,origin,mode='third',area=island,room=null,moving=false;
 const position=new THREE.Vector3(),keys=new Set(),ray=new THREE.Raycaster(),avatar=playerAvatar(canvas,camera);(scene||island.parent).add(avatar.root);avatar.root.visible=false;
 const visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible||p.userData.player)return false;return true;};
 const surfaces=()=>{const list=[];area.traverse(m=>{if(m.isMesh&&visible(m)&&!m.userData.nonSolid)list.push(m);});return list;};
 function floor(x,z,ceiling=1.5){area.updateWorldMatrix(true,true);ray.far=Infinity;ray.set(new THREE.Vector3(x,ceiling,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(surfaces(),false).find(h=>{for(let p=h.object;p;p=p.parent)if(p.userData.noFloor)return false;return h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.65&&h.point.y>=-1;});}
 function land(){let hit;for(const [x,z] of [[0,5.5],[0,0],[-3,1],[3,0]]){hit=floor(x,z);if(hit)break;}if(!hit)for(const [x,z] of [[0,5.5],[0,0],[-3,1],[3,0]]){hit=floor(x,z,15);if(hit)break;}if(!hit)return false;position.copy(hit.point);origin=camera.position.clone();active=true;landing=true;elapsed=0;yaw=0;pitch=-.15;keys.clear();controls.enabled=false;controls.autoRotate=false;camera.clearViewOffset();camera.fov=55;camera.updateProjectionMatrix();return true;}
 function leave(){active=false;landing=false;keys.clear();drag=null;avatar.root.visible=false;controls.enabled=true;camera.fov=innerWidth<700?58:36;camera.updateProjectionMatrix();}
 function setArea(next,bounds,spawn){area=next;room=bounds;position.set(...spawn);landing=false;keys.clear();yaw=0;}
 function view(next){if(['third','first','overhead'].includes(next))mode=next;camera.fov=mode==='first'?65:55;camera.updateProjectionMatrix();return mode;}
 function update(dt){if(!active)return;elapsed+=dt;dt=Math.min(dt,.05);moving=false;
 const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 const delta=new THREE.Vector3(Math.sin(yaw)*forward+Math.cos(yaw)*side,0,-Math.cos(yaw)*forward+Math.sin(yaw)*side);
 if(!landing&&delta.lengthSq()){
  delta.normalize().multiplyScalar(dt*2.3);const next=position.clone().add(delta),ground=floor(next.x,next.z,position.y+.55);ray.set(position.clone().add(new THREE.Vector3(0,.65,0)),delta.clone().normalize());ray.far=.32+delta.length();const blocked=ray.intersectObjects(surfaces(),false).some(h=>!h.object.userData.walkable);ray.far=Infinity;
  const inside=room?Math.abs(next.x)<room.width/2-.3&&Math.abs(next.z)<room.depth/2-.3:Math.hypot(next.x,next.z)<9;
  if(!blocked&&inside&&ground&&Math.abs(ground.point.y-position.y)<.48){position.set(next.x,ground.point.y,next.z);moving=true;avatar.root.rotation.y=Math.atan2(delta.x,delta.z);}
 }
 avatar.root.position.copy(position);avatar.update(elapsed,moving,mode==='first');
 const eye=position.clone().add(new THREE.Vector3(0,1.3,0)),direction=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));let target=eye.clone(),desired;
 if(mode==='first'){desired=eye;target=eye.clone().add(direction);}
 else if(mode==='overhead'&&room){target=new THREE.Vector3(0,0,0);const halfHeight=Math.max(room.depth/2,room.width/(2*camera.aspect));desired=new THREE.Vector3(0,halfHeight/Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*1.18,.01);}
 else{const distance=room?2.6:4.2;const offset=mode==='overhead'?new THREE.Vector3(0,room?5:8, .01):new THREE.Vector3(-Math.sin(yaw)*distance,1.4-pitch*2,Math.cos(yaw)*distance);desired=eye.clone().add(offset);ray.set(eye,offset.clone().normalize());ray.far=offset.length();const obstacle=ray.intersectObjects(surfaces(),false).find(h=>!h.object.userData.walkable);if(obstacle&&mode!=='overhead')desired=eye.clone().add(offset.normalize().multiplyScalar(Math.max(.22,obstacle.distance-.2)));ray.far=Infinity;}
 if(landing){const t=Math.min(1,elapsed/1.2);camera.position.lerpVectors(origin,desired,t*t*(3-2*t));landing=t<1;}else camera.position.lerp(desired,mode==='first'?1:1-Math.exp(-dt*12));camera.lookAt(target);
 }
 const release=()=>{keys.clear();drag=null;};addEventListener('blur',release);document.addEventListener('visibilitychange',release);
 addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName)||e.target?.isContentEditable)return;const k=e.key.toLowerCase();if(active&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();keys.add(k);}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 canvas.addEventListener('pointerdown',e=>{if(active){drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointermove',e=>{if(active&&drag?.id===e.pointerId){yaw-=(e.clientX-drag.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-drag.y)*.004,-.75,.65);drag={id:e.pointerId,x:e.clientX,y:e.clientY};}});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',release);
 return {land,leave,update,setArea,view,loadAvatar:source=>avatar.load(source),get active(){return active;},get position(){return position.clone();},press(key,on){on?keys.add(key):keys.delete(key);},stats:()=>({active,landing,mode,avatar:active&&mode!=='first',room:!!room,position:position.toArray()})};
}
