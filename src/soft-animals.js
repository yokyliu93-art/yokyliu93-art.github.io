import * as THREE from 'three';
const sphere=new THREE.SphereGeometry(1,20,14);
function oval(parent,p,s,color){const mesh=new THREE.Mesh(sphere,new THREE.MeshStandardMaterial({color,roughness:.95}));mesh.position.set(...p);mesh.scale.set(...s);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
export function softAnimal(kind){
 const g=new THREE.Group();g.userData.model=kind;g.userData.loading=false;
 if(kind==='rabbit'){
  const cream='#f4e6cf',pink='#deb7ad';
  oval(g,[0,.15,-.04],[.145,.14,.2],cream);
  oval(g,[0,.23,.13],[.12,.115,.11],cream);
  for(const x of [-1,1]){
   oval(g,[x*.095,.035,.08],[.055,.035,.1],cream);
   const ear=new THREE.Group();ear.position.set(x*.059,.30,.11);ear.rotation.z=-x*.14;g.add(ear);
   oval(ear,[0,.075,0],[.034,.11,.026],cream);oval(ear,[0,.077,.023],[.017,.078,.008],pink);
   oval(g,[x*.053,.248,.221],[.013,.016,.01],'#4a4940');oval(g,[x*.057,.253,.229],[.004,.004,.003],'#fff7e9');
   oval(g,[x*.069,.207,.219],[.025,.012,.008],pink);
  }
  oval(g,[0,.212,.244],[.013,.009,.008],pink);oval(g,[0,.17,-.235],[.063,.063,.06],cream);
  g.userData.animate=t=>{g.children[1].rotation.x=Math.sin(t*.7)*.035;};
 }else{
  oval(g,[0,.15,0],[.11,.125,.14],'#8dacb0');oval(g,[0,.135,.085],[.087,.083,.073],'#f5e7cd');
  oval(g,[0,.255,.065],[.09,.082,.087],'#a6bec0');
  const wings=[];
  for(const side of [-1,1]){const w=new THREE.Group();w.position.set(side*.08,.18,-.025);g.add(w);oval(w,[side*.065,0,-.01],[.1,.025,.075],'#729798');w.rotation.z=side*-.4;wings.push(w);oval(g,[side*.039,.27,.138],[.011,.013,.009],'#3f4d49');}
  const beak=new THREE.Mesh(new THREE.ConeGeometry(.024,.062,12),new THREE.MeshStandardMaterial({color:'#d7b476',roughness:1}));beak.rotation.x=Math.PI/2;beak.position.set(0,.24,.166);g.add(beak);
  for(const x of [-.037,.037])oval(g,[x,.015,.04],[.025,.012,.041],'#bc9974');
  const tail=oval(g,[0,.15,-.15],[.055,.025,.1],'#729798');tail.rotation.x=-.35;
  g.userData.animate=t=>wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*(.25+Math.sin(t*5)*.25));
 }
 return g;
}
