import {storybookAnimal} from './storybook-animals.js';
import * as THREE from 'three';
import {softAnimal} from './soft-animals.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
const loader=new GLTFLoader(),cache=new Map();
export const MODEL_SIZES={sofa:[2,.85,.9],bed:[1.1,.75,2],desk:[1.3,.78,.7],chair:[.55,.85,.55],table:[.9,.4,.6],plant:[.5,.8,.5],lamp:[.4,1.65,.4],tree:[2.4,3.5,2.4],pine:[1.8,3.4,1.8],rock:[1.2,.7,.9],cat:[.45,.55,.8],dog:[.5,.7,.9],rabbit:[.35,.53,.55],fox:[.45,.65,.95],bear:[.8,1.1,1.2],bird:[.5,.4,.4],unicorn:[.7,1.5,1.7]};
export function modelObject(kind){if(['cat','dog','fox','bear','unicorn'].includes(kind))return storybookAnimal(kind);if(kind==='rabbit'||kind==='bird')return softAnimal(kind);const group=new THREE.Group();group.userData.model=kind;group.userData.loading=true;
 if(!cache.has(kind))cache.set(kind,loader.loadAsync('/models/'+kind+'.glb'));
 cache.get(kind).then(gltf=>{
  const object=clone(gltf.scene);
  if(gltf.animations.length){
   const mixer=new THREE.AnimationMixer(object);
   const clip=gltf.animations.find(c=>/idle/i.test(c.name))||gltf.animations[0];
   mixer.clipAction(clip).play();mixer.update(0);
   group.userData.mixer=mixer;group.userData.animations=gltf.animations.map(c=>c.name);
  }
  // Bone world matrices must be ready before measuring the posed skinned mesh.
  object.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(object,true);
  const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  const target=MODEL_SIZES[kind]||[1,1,1];
  const scale=Math.min(...target.map((n,i)=>n/Math.max(size.getComponent(i),.001)));
  const pivot=new THREE.Group(),wrapper=new THREE.Group();
  pivot.position.set(-center.x,-box.min.y,-center.z);pivot.add(object);
  wrapper.add(pivot);wrapper.scale.setScalar(scale);
  object.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});
  group.add(wrapper);group.userData.loading=false;
 }).catch(()=>{cache.delete(kind);group.userData.loading=false;group.userData.error='模型加载失败：'+kind;window.dispatchEvent(new CustomEvent('island-asset-error',{detail:group.userData.error}));});return group;
}
export function updateModels(root,dt){root.traverse(o=>{o.userData.mixer?.update(dt);if(o.userData.animate){o.userData.age=(o.userData.age||0)+dt;o.userData.animate(o.userData.age);}});}
