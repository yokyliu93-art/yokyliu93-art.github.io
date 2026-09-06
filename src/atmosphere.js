import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// Official Three.js post-processing; original stylized water and atmosphere animation.
export function livingAtmosphere({scene,island,water,waterfall,renderer,camera,controls}){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clockUniform={value:0};
  water.material=water.material.clone();
  water.material.onBeforeCompile=shader=>{
    shader.uniforms.islandTime=clockUniform;
    shader.vertexShader='varying vec2 islandWaterUV;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nislandWaterUV=position.xy;');
    shader.fragmentShader='uniform float islandTime; varying vec2 islandWaterUV;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 p=islandWaterUV; float t=islandTime;
      float ripple=sin(p.y*6.0-t*1.5+sin(p.x*3.5+t*.2))*sin(p.x*5.0+p.y*2.0-t*.8);
      float glint=pow(max(0.0,ripple),7.0);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.73,.86,.85),glint*.5);
      diffuseColor.rgb*=.97+.055*sin(p.y*3.0-t*.9);`);
  };
  water.material.customProgramCacheKey=()=> 'island-flow-v1';
  const group=new T.Group();island.add(group);
  const textureCanvas=document.createElement('canvas');textureCanvas.width=64;textureCanvas.height=64;
  const ctx=textureCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,255,255,.5)');gradient.addColorStop(.4,'rgba(255,255,255,.22)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const texture=new T.CanvasTexture(textureCanvas),mist=[];
  for(let i=0;i<12;i++){const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,color:'#e3e4dc',transparent:true,opacity:.15,depthWrite:false}));sprite.position.set(Math.cos(i*2.4)*7,-2.5-(i%4)*.8,Math.sin(i*2.4)*7);sprite.scale.set(9+(i%3),2.4,1);group.add(sprite);mist.push({sprite,x:sprite.position.x,y:sprite.position.y});}
  const stream=new T.CatmullRomCurve3([new T.Vector3(-1.1,.25,-6.4),new T.Vector3(-2.1,.25,-3.9),new T.Vector3(-.3,.25,-1.1),new T.Vector3(2,.25,1.7),new T.Vector3(2.65,.25,4.1),new T.Vector3(1.8,.25,7.25)]);
  const flow=new T.Group();island.add(flow);const beads=[];
  const beadGeo=new T.SphereGeometry(1,5,3),beadMat=new T.MeshBasicMaterial({color:'#e5f3e7',transparent:true,opacity:.55});
  for(let i=0;i<32;i++){const bead=new T.Mesh(beadGeo,beadMat);bead.scale.set(.025+(i%3)*.012,.012,.11+(i%4)*.025);flow.add(bead);beads.push(bead);}
  // Mist where the stream spills into open air.
  const spray=new T.Group();island.add(spray);
  for(let i=0;i<8;i++){const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,color:'#dcece5',transparent:true,opacity:.3,depthWrite:false}));sprite.position.set(1.6+(i%3)*.2,-3-i*.4,7.2);sprite.scale.set(1.2,1.6,1);spray.add(sprite);}
  const motes=new T.Group();island.add(motes);const moteMat=new T.SpriteMaterial({map:texture,color:'#fff0cc',transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending});
  for(let i=0;i<22;i++){const sprite=new T.Sprite(moteMat.clone());sprite.position.set(Math.cos(i*2.4)*(3+i%4),1+i%5*.7,Math.sin(i*2.4)*(3+i%4));sprite.scale.setScalar(.14+(i%3)*.055);sprite.userData.origin=sprite.position.clone();motes.add(sprite);}
  // Soft glow at high luminance only, with fewer pixels on small displays.
  const composer=new EffectComposer(renderer);composer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<750?1:1.4));composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.15,.6,1.15);composer.addPass(bloom);composer.addPass(new OutputPass());
  controls.autoRotate=!reduced;controls.autoRotateSpeed=.13;
  controls.addEventListener('start',()=>{controls.autoRotate=false;});
  addEventListener('resize',()=>{composer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<750?1:1.4));composer.setSize(innerWidth,innerHeight);});
  return {render(dt,elapsed){const t=reduced?0:elapsed;clockUniform.value=t;flow.visible=water.visible;spray.visible=waterfall.visible;
    if(!reduced){mist.forEach(({sprite,x,y},i)=>{sprite.position.x=x+Math.sin(t*.12+i)*1.4;sprite.position.y=y+Math.sin(t*.22+i)*.25;});
    beads.forEach((bead,i)=>{const u=(i/32+t*.038)%1;bead.position.copy(stream.getPointAt(u));bead.position.x+=Math.sin(i*6.7)*.15;bead.rotation.y=Math.sin(u*5)*.4;});
    spray.children.forEach((sprite,i)=>{sprite.position.y=-2-((t*.8+i*.53)%4.8);sprite.position.x=1.9+Math.sin(t*.5+i)*.4;});
    motes.children.forEach((m,i)=>{m.position.copy(m.userData.origin);m.position.x+=Math.sin(t*.3+i)*.4;m.position.y+=Math.sin(t*.6+i)*.3;m.material.opacity=.25+(Math.sin(t*.8+i)+1)*.25;});}
    composer.render(dt);
  }};
}
