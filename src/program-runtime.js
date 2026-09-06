import * as THREE from 'three';

// Generated code lives in a worker inside an opaque-origin iframe, never in the app.
function workerMain(){
  const send=postMessage.bind(self);let frame=()=>{},click=()=>{},commands=[];
  const island=Object.freeze({mesh:value=>commands.push({op:'mesh',value}),move:(id,value)=>commands.push({op:'move',id,value}),onFrame:fn=>{frame=fn;},onClick:fn=>{click=fn;}});
  self.onmessage=e=>{try{commands=[];const m=e.data;if(m.type==='init')new Function('island','"use strict";\n'+m.source)(island);else if(m.type==='tick')frame(m.time);else if(m.type==='click')click(m.id);send({commands});}catch{send({error:'代码运行出错，请让 Agent 修正后重新提交。'});}};
}
function frameMain(workerSource){
  let worker,timer,port;
  addEventListener('message',function init(e){if(e.source!==parent||!e.ports[0]||port)return;port=e.ports[0];
    const stop=error=>{worker?.terminate();clearTimeout(timer);port.postMessage({error});};
    worker=new Worker(URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'})));
    worker.onmessage=e=>{clearTimeout(timer);port.postMessage(e.data);};worker.onerror=()=>stop('代码运行出错，请让 Agent 修正后重新提交。');
    port.onmessage=e=>{clearTimeout(timer);timer=setTimeout(()=>stop('代码运行时间超限，已停止这次运行。'),800);worker.postMessage(e.data);};port.postMessage({ready:true});
  });
}
export function mountProgram(parent,canvas,camera,onStatus=()=>{}){
  let iframe,port,timer,watchdog,group=null,source=null,waiting=false,start=0,stopped=false,vertices=0;
  const meshes=new Map();
  const cleanGroup=g=>{if(!g)return;g.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});g.removeFromParent();};
  function stop(){clearInterval(timer);timer=null;clearTimeout(watchdog);port?.close();iframe?.remove();port=null;iframe=null;waiting=false;stopped=true;}
  function fail(error){stop();cleanGroup(group);group=null;meshes.clear();onStatus(error);}
  const vector=(v,def,min,max)=>{if(v===undefined)return def;if(!Array.isArray(v)||v.length!==3||v.some(x=>!Number.isFinite(x)||x<min||x>max))throw Error();return v;};
  function transform(mesh,value){
    mesh.position.set(...vector(value.position,mesh.position.toArray(),-14,14));
    mesh.scale.set(...vector(value.scale,mesh.scale.toArray(),.0001,20));
    mesh.rotation.set(...vector(value.rotation,mesh.rotation.toArray().slice(0,3),-10000,10000));
    mesh.updateMatrix();mesh.geometry.computeBoundingBox();const bounds=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrix);
    if(bounds.min.x < -10||bounds.max.x>10||bounds.min.z < -10||bounds.max.z>10||bounds.min.y < -7||bounds.max.y>14)throw Error();
  }
  function apply(commands){
    if(!Array.isArray(commands)||commands.length>300)throw Error();
    for(let commandIndex=0;commandIndex<commands.length;commandIndex++){const c=commands[commandIndex];try{
      const v=c.value;if(!v||typeof v!=='object')throw Error();
      if(c.op==='move'){const mesh=meshes.get(c.id);if(!mesh)throw Error();transform(mesh,v);continue;}
      if(c.op!=='mesh'||meshes.size>=150||typeof v.id!=='string'||v.id.length>80||meshes.has(v.id)||!/^#[0-9a-f]{6}$/i.test(v.color))throw Error();
      let geo;
      switch(v.shape){
        case 'box':geo=new THREE.BoxGeometry(1,1,1);break;
        case 'sphere':geo=new THREE.IcosahedronGeometry(.5,0);break;
        case 'cone':geo=new THREE.ConeGeometry(.5,1,12);break;
        case 'cylinder':geo=new THREE.CylinderGeometry(.5,.5,1,12);break;
        case 'custom':{
          const p=v.vertices,ix=v.indices;if(!Array.isArray(p)||!p.length||p.length%3||p.length>54000||p.some(x=>!Number.isFinite(x)||Math.abs(x)>30))throw Error();
          if(ix!==undefined&&(!Array.isArray(ix)||ix.length%3||ix.length>54000||ix.some(x=>!Number.isInteger(x)||x<0||x>=p.length/3)))throw Error();
          if(!ix&&p.length%9)throw Error();geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));if(ix)geo.setIndex(ix);geo.computeVertexNormals();break;
        }
        default:throw Error();
      }
      vertices+=geo.attributes.position.count;if(vertices>18000){geo.dispose();throw Error();}
      const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:v.color,roughness:.85,flatShading:true,side:THREE.DoubleSide}));
      group.add(mesh);transform(mesh,v);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.programId=v.id;meshes.set(v.id,mesh);
      }catch(error){throw new Error(`第 ${commandIndex+1} 条 ${c?.op||'unknown'} 指令（${c?.id||c?.value?.id||'无编号'}）未通过边界检查`);}
    }
  }
  function send(data){if(waiting||stopped)return;waiting=true;port.postMessage(data);watchdog=setTimeout(()=>fail('代码没有及时响应，已停止运行，原有生态仍然保留。'),1500);}
  function load(next){if(next===source)return;source=next;stop();cleanGroup(group);group=null;meshes.clear();vertices=0;if(!next)return;
    stopped=false;group=new THREE.Group();parent.add(group);onStatus('正在检查并运行岛屿代码…');
    iframe=document.createElement('iframe');iframe.hidden=true;iframe.sandbox='allow-scripts';iframe.setAttribute('aria-hidden','true');
    const script=`(${frameMain.toString()})(${JSON.stringify('('+workerMain.toString()+')()')})`;
    iframe.srcdoc=`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:; connect-src 'none'; img-src 'none'; style-src 'none'"><script>${script.replaceAll('</script','<\\/script')}<\/script>`;
    const channel=new MessageChannel();port=channel.port1;
    port.onmessage=e=>{if(stopped)return;if(!e.data||typeof e.data!=='object'){fail('代码输出无效');return;}if(e.data.ready){start=performance.now();send({type:'init',source:next});return;}clearTimeout(watchdog);waiting=false;if(e.data.error){fail(e.data.error);return;}try{apply(e.data.commands);}catch(error){fail(`代码输出超出岛屿边界或资源规则，已停止运行。${error.message||''}`);return;}
      if(!timer){onStatus('世界代码已运行 · 有交互的作品可以点击探索');timer=setInterval(()=>send({type:'tick',time:(performance.now()-start)/1000}),100);}
    };
    iframe.onload=()=>iframe.contentWindow.postMessage({},'*',[channel.port2]);document.body.append(iframe);
  }
  canvas.addEventListener('click',e=>{if(!group||stopped)return;const rect=canvas.getBoundingClientRect();const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(group.children)[0];if(hit)send({type:'click',id:hit.object.userData.programId});});
  addEventListener('pagehide',stop);
  return {load,stats:()=>({meshes:meshes.size,stopped})};
}
