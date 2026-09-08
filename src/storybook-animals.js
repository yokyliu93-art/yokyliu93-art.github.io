import * as THREE from 'three';
const sphere=new THREE.SphereGeometry(1,24,18),materials=new Map();
const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.92}));return materials.get(c);};
function oval(g,p,s,c){const m=new THREE.Mesh(sphere,mat(c));m.position.set(...p);m.scale.set(...s);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function taper(g,a,b,r1,r2,c){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from),m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),20),mat(c));m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=true;g.add(m);return m;}
function curve(g,points,r,c){const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),20,r,8,false),mat(c));m.castShadow=true;g.add(m);return m;}
function eyes(g,x,y,z){for(const side of [-1,1]){oval(g,[side*x,y,z],[.018,.024,.013],'#4c4845');oval(g,[side*x-.005,y+.008,z+.011],[.005,.006,.003],'#fff9e9');}}
export function storybookAnimal(kind){const root=new THREE.Group();root.userData.model=kind;root.userData.loading=false;const g=new THREE.Group();root.add(g);
 if(kind==='unicorn'){
  const cream='#f1ebdc',rose='#c9aabc';
  oval(g,[0,.77,-.05],[.265,.29,.49],cream);
  taper(g,[0,.75,.24],[0,1.22,.42],.2,.13,cream);oval(g,[0,1.23,.48],[.175,.19,.26],cream);oval(g,[0,1.15,.68],[.148,.108,.19],'#e4d8ce');
  for(const side of [-1,1]){for(const z of [-.34,.29]){taper(g,[side*.18,.66,z],[side*.2,.13,z+.025],.066,.055,cream);oval(g,[side*.2,.08,z+.06],[.078,.066,.096],'#c5b299');}taper(g,[side*.1,1.33,.38],[side*.15,1.56,.35],.068,.015,cream);taper(g,[side*.104,1.4,.421],[side*.142,1.53,.377],.027,.005,rose);oval(g,[side*.159,1.2,.55],[.027,.016,.01],'#debbb5');}
  eyes(g,.135,1.285,.665);taper(g,[0,1.38,.59],[0,1.75,.64],.052,.001,'#ceb37c');
  for(let i=0;i<4;i++)curve(g,[[.025+i*.029,1.39,.34],[.07+i*.032,1.27,.18],[.08+i*.03,1.03,.16],[.12+i*.015,.87,.11]],.037,['#c6a6bb','#dfc4cc','#bcc7cc','#d7c6af'][i]);
  const tail=new THREE.Group();tail.position.set(0,.85,-.49);g.add(tail);for(let i=0;i<4;i++)curve(tail,[[0,0,0],[.09+i*.018,-.06,-.17],[.17+i*.018,-.27,-.27],[.12+i*.012,-.49,-.2]],.04,['#c6a6bb','#dfc4cc','#bcc7cc','#d7c6af'][i]);
  root.userData.animate=t=>{g.scale.y=1+Math.sin(t*1.2)*.004;tail.rotation.z=Math.sin(t*.7)*.08;};
 }else if(kind==='bear'){
  const cream='#eae7d8',dark='#626960';oval(g,[0,.47,0],[.31,.4,.28],cream);oval(g,[0,.91,.09],[.27,.25,.23],cream);
  for(const side of [-1,1]){oval(g,[side*.21,1.105,.04],[.104,.106,.07],dark);oval(g,[side*.21,1.11,.10],[.052,.052,.018],'#aaafa3');oval(g,[side*.27,.5,.02],[.1,.24,.11],dark);oval(g,[side*.17,.11,.1],[.135,.11,.19],dark);const patch=oval(g,[side*.11,.94,.292],[.065,.09,.02],dark);patch.rotation.z=side*.25;}
  oval(g,[0,.84,.291],[.125,.088,.058],'#f3ede0');eyes(g,.106,.953,.317);oval(g,[0,.86,.35],[.044,.028,.028],dark);root.userData.animate=t=>{g.rotation.z=Math.sin(t*.7)*.018;};
 }else{
  const fox=kind==='fox',dog=kind==='dog',coat=fox?'#c99772':dog?'#cfb594':'#e6dfcc',light='#f0e9d8',dark='#575850';
  oval(g,[0,.36,-.045],[.16,.19,.28],coat);oval(g,[0,.53,.18],[dog?.155:.14,dog?.155:.137,dog?.175:.14],coat);
  oval(g,[0,.464,.309],[fox?.077:.1,.064,fox?.14:.075],light);oval(g,[0,.488,fox?.43:.374],[.027,.022,.022],dark);
  for(const side of [-1,1]){for(const z of [-.2,.17]){taper(g,[side*.1,.29,z],[side*.105,.055,z+.02],.045,.033,coat);oval(g,[side*.105,.038,z+.045],[.047,.038,.07],light);}if(dog){const ear=oval(g,[side*.15,.49,.13],[.053,.16,.088],'#aa9177');ear.rotation.z=side*.22;}else{taper(g,[side*.095,.615,.16],[side*.112,.79,.14],.072,.001,coat);taper(g,[side*.095,.646,.19],[side*.111,.76,.156],.036,.001,'#d7aea1');}if(fox)oval(g,[side*.098,.491,.28],[.06,.058,.044],light);}
  eyes(g,.083,.558,.294);
  const tail=new THREE.Group();tail.position.set(0,.38,-.29);g.add(tail);if(fox){curve(tail,[[0,0,0],[.12,-.04,-.12],[.2,-.14,-.26],[.15,-.2,-.34]],.078,coat);oval(tail,[.15,-.2,-.34],[.075,.075,.1],light);}else curve(tail,[[0,0,0],[.04,.08,-.12],[.085,.22,-.17],[.02,.29,-.15]],dog?.04:.03,coat);
  root.userData.animate=t=>{tail.rotation.y=Math.sin(t*(dog?3.5:1))*.17;g.scale.y=1+Math.sin(t*1.7)*.006;};
 }
 // Consistent fit and feet at y=0 across the library and custom-code assets.
 const targets={unicorn:[.7,1.5,1.7],bear:[.8,1.1,1.2],cat:[.45,.55,.8],dog:[.5,.7,.9],fox:[.45,.65,.95]};g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),target=targets[kind],scale=Math.min(...target.map((v,i)=>v/size.getComponent(i)));g.position.set(-center.x,-box.min.y,-center.z);const wrapper=new THREE.Group();root.remove(g);wrapper.add(g);wrapper.scale.setScalar(scale);root.add(wrapper);return root;
}
