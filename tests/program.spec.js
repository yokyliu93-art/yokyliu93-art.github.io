import {test,expect} from '@playwright/test';
import {signIn} from './auth-helper.js';
test.beforeEach(async({page})=>signIn(page));
const source=`island.mesh({id:'boat',shape:'custom',color:'#d9ac9a',vertices:[-.7,0,-.3,.7,0,-.3,0,.4,0, .7,0,-.3,.7,0,.3,0,.4,0, .7,0,.3,-.7,0,.3,0,.4,0],position:[0,2,0]}); island.onFrame(t=>island.move('boat',{position:[Math.sin(t),2,0]}));`;
test('own Agent receives description, submits real code, persists and runs it',async({page,request})=>{
  const account=await (await request.post('/api/auth/register',{data:{name:'Code test',email:`code-${Date.now()}@example.com`,password:'code-test-password'}})).json();
  const headers={Authorization:`Bearer ${account.token}`};const me=await(await request.get('/api/me',{headers})).json();
  await request.post('/api/preferences',{headers,data:{preferences:{growing:true,water:'none',animals:'none',light:'balanced',home:'open',landscape:'none'},revision:me.island.revision,remember:false}});
  const key=await(await request.post(`/api/islands/${me.island.id}/agents`,{headers,data:{scopes:['scene:write'],days:1}})).json();const agentHeaders={Authorization:`Bearer ${key.token}`};
  await page.addInitScript(token=>{try{localStorage.setItem('our-island-owner-token',token);localStorage.setItem('island-agent-route','external');}catch{}},account.token);
  await page.goto('/?view=studio');await page.locator('#dream-prompt').fill('写一艘会移动的小船');await page.locator('#dream-submit').click();
  await expect(page.locator('#dream-message')).toContainText('Agent 尚未提交代码');
  const pending=await(await request.get(`/api/islands/${me.island.id}/coding-task`,{headers:agentHeaders})).json();expect(pending.task.prompt).toBe('写一艘会移动的小船');expect(pending.sdk).toContain('onFrame');
  const response=await request.put(`/api/islands/${me.island.id}/program`,{headers:agentHeaders,data:{jobId:pending.task.id,source,summary:'已编写移动小船的几何和动画代码'}});expect(response.status()).toBe(200);
  await expect(page.locator('#dream-message')).toContainText('已编写移动小船');
  await expect(page.getByText('世界代码已运行',{exact:false})).toBeVisible();
  await page.reload();await expect(page.getByText('世界代码已运行',{exact:false})).toBeVisible();
  await page.locator('#dream-prompt').fill('运行错误测试');await page.locator('#dream-submit').click();await expect(page.locator('#dream-submit')).toBeDisabled();
  const next=await(await request.get(`/api/islands/${me.island.id}/coding-task`,{headers:agentHeaders})).json();
  await request.put(`/api/islands/${me.island.id}/program`,{headers:agentHeaders,data:{jobId:next.task.id,source:'while(true){}',summary:'测试循环'}});
  await expect(page.getByText('代码运行时间超限',{exact:false})).toBeVisible();await expect(page.locator('#dream-prompt')).toBeEnabled();
});
test('program worker cannot use network or app storage',async({page})=>{
  await page.goto('/?view=studio');
  await page.evaluate(async()=>{
    const {mountProgram}=await import('/src/program-runtime.js');const THREE=await import('/node_modules/three/build/three.module.js');
    window.testProgram=mountProgram(new THREE.Group(),document.createElement('canvas'),new THREE.PerspectiveCamera(),text=>document.body.dataset.programTest=text);
    window.testProgram.load(`if(typeof localStorage!=='undefined')throw Error('storage exposed');let blocked=false,done=false;fetch('http://localhost:5173/api/me').catch(()=>{blocked=true;});island.onFrame(()=>{if(blocked&&!done){done=true;island.mesh({id:'ok',shape:'box',color:'#ffffff'});}});`);
  });
  await expect.poll(()=>page.evaluate(()=>window.testProgram.stats().meshes)).toBe(1);
  expect(await page.evaluate(()=>window.testProgram.stats().stopped)).toBe(false);
});
test('code receives mesh clicks and out-of-bounds output stops only the program',async({page})=>{
 await page.goto('/?view=studio');
 await page.evaluate(async()=>{
  const {mountProgram}=await import('/src/program-runtime.js');const THREE=await import('/node_modules/three/build/three.module.js');
  const canvas=document.createElement('canvas');canvas.id='program-test-canvas';canvas.style.cssText='position:fixed;left:0;top:0;width:100px;height:100px;z-index:99999';document.body.append(canvas);
  const camera=new THREE.PerspectiveCamera(50,1,.1,100);camera.position.z=5;camera.updateMatrixWorld();const root=new THREE.Group();
  window.programRoot=root;window.clickProgram=mountProgram(root,canvas,camera,text=>document.body.dataset.programTest=text);
  window.clickProgram.load("island.mesh({id:'boat',shape:'box',color:'#aaccdd'});island.onClick(id=>island.move(id,{position:[2,0,0]}));");
 });
 await expect.poll(()=>page.evaluate(()=>window.clickProgram.stats().meshes)).toBe(1);
 await page.locator('#program-test-canvas').click({position:{x:50,y:50}});
 await expect.poll(()=>page.evaluate(()=>window.programRoot.children[0].children[0].position.x)).toBe(2);
 await page.evaluate(()=>window.clickProgram.load("island.mesh({id:'bad',shape:'box',color:'#aaccdd',position:[14,0,0]});"));
 await expect.poll(()=>page.evaluate(()=>window.clickProgram.stats().stopped)).toBe(true);
 await expect(page.locator('body')).toHaveAttribute('data-program-test',/边界/);
 await expect(page.locator('#dream-prompt')).toBeEnabled();
});
