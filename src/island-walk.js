import * as THREE from 'three';
export function islandWalk({camera,controls,canvas,island}){
 let active=false,landing=false,yaw=0,pitch=0,drag=null,elapsed=0,origin;const position=new THREE.Vector3(),keys=new Set(),ray=new THREE.Raycaster();
 const surfaces=()=>{const list=[];island.traverse(m=>{if(m.isMesh&&visible(m))list.push(m);});return list;};
 const visible=m=>{for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;};
 function floor(x,z,ceiling=15){island.updateWorldMatrix(true,true);ray.set(new THREE.Vector3(x,ceiling,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(surfaces(),false).find(h=>visible(h.object)&&h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.6&&h.point.y>=-1);}
 function land(){const spots=[[0,0],[0,5.5],[-3,1],[3,0]];let hit;for(const [x,z] of spots){hit=floor(x,z);if(hit)break;}if(!hit)return false;position.copy(hit.point).add(new THREE.Vector3(0,1.3,0));origin=camera.position.clone();active=true;landing=true;elapsed=0;yaw=Math.PI/2;pitch=-.22;keys.clear();controls.enabled=false;controls.autoRotate=false;camera.clearViewOffset();camera.fov=65;camera.updateProjectionMatrix();return true;}
 function leave(){active=false;landing=false;keys.clear();drag=null;controls.enabled=true;camera.fov=innerWidth<700?58:36;camera.updateProjectionMatrix();}
 function update(dt){if(!active)return;elapsed+=dt;if(landing){const t=Math.min(1,elapsed/1.4);camera.position.lerpVectors(origin,position,t*t*(3-2*t));landing=t<1;}else{
  const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
  const delta=new THREE.Vector3(Math.sin(yaw)*forward+Math.cos(yaw)*side,0,-Math.cos(yaw)*forward+Math.sin(yaw)*side);if(delta.lengthSq()){delta.normalize().multiplyScalar(dt*2.2);const next=position.clone().add(delta),ground=floor(next.x,next.z,position.y+.1);ray.set(position.clone().add(new THREE.Vector3(0,-.55,0)),delta.clone().normalize());ray.far=.45;const blocked=ray.intersectObjects(surfaces(),false).some(h=>visible(h.object));ray.far=Infinity;if(!blocked&&Math.hypot(next.x,next.z)<9&&ground&&Math.abs(ground.point.y+1.3-position.y)<.6){position.set(next.x,ground.point.y+1.3,next.z);}}
  camera.position.copy(position);
 }camera.lookAt(camera.position.clone().add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch))));}
 const release=()=>{keys.clear();drag=null;};addEventListener('blur',release);document.addEventListener('visibilitychange',release);
 addEventListener('keydown',e=>{if(active&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())){e.preventDefault();keys.add(e.key.toLowerCase());}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 canvas.addEventListener('pointerdown',e=>{if(active){drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointermove',e=>{if(active&&drag?.id===e.pointerId){yaw+=(e.clientX-drag.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-drag.y)*.004,-1,1);drag={id:e.pointerId,x:e.clientX,y:e.clientY};}});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',release);
 return {land,leave,update,get active(){return active;},press(key,on){on?keys.add(key):keys.delete(key);},stats:()=>({active,landing,position:position.toArray()})};
}
