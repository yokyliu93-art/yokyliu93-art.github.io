import {test,expect} from '@playwright/test';
import {worldProgram} from '../server/world-templates.js';
test.describe.configure({timeout:120000});

test('new account connects its own Agent before onboarding; code renders before a private letter',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?view=auth');await page.locator('[data-mode="register"]').click();await page.locator('[name="name"]').fill('流程验收岛民');await page.locator('[name="email"]').fill(`journey-${Date.now()}@example.com`);await page.locator('[name="password"]').fill('journey-test-password');await page.locator('.auth-submit').click();
 await expect(page).toHaveURL(/view=connect/);await expect(page.locator('#continue')).toBeHidden();await expect(page.getByText('本机 Codex',{exact:false})).toHaveCount(0);
 await page.locator('#connect-agent').click();await page.locator('[data-issue]').click();await expect(page.locator('.agent-dialog textarea')).toHaveValue(/岛屿私密钥匙：/);const instructions=await page.locator('.agent-dialog textarea').inputValue(),agentToken=instructions.match(/岛屿私密钥匙：([^\n]+)/)[1],id=instructions.match(/岛屿 ID：([^\n]+)/)[1];expect(instructions).toContain('/hello');const downloadPromise=page.waitForEvent('download');await page.locator('[data-download]').click();const download=await downloadPromise;expect(download.suggestedFilename()).toContain('连接.md');await download.delete();await expect(page.locator('#continue')).toBeHidden();
 // Explicit test double for an external coding Agent, confined to this test account.
 const hello=await page.request.post(`/api/islands/${id}/hello`,{headers:{Authorization:'Bearer '+agentToken},data:{name:'测试专用 Agent',message:'Hello，我收到你给我的岛屿钥匙了。'}});expect(hello.ok()).toBeTruthy();await page.locator('[data-close]').click();await expect(page.locator('#continue')).toBeVisible();await page.screenshot({path:'artifacts/journey-connected.png'});await page.locator('#continue').click();await page.locator('#arrival-next').click();
 for(const choice of ['ocean','unicorn','night','floating','flowers']){await page.locator(`[data-choice="${choice}"]`).click();await page.locator('#arrival-next').click();}
 await page.locator('#arrival-prompt').fill('在属于我的海洋里留一条星光水路。');await page.locator('#arrival-create').click();await expect(page).toHaveURL(/view=studio/);await expect(page.locator('#dream-submit')).toBeDisabled();
 const headers={Authorization:'Bearer '+agentToken};const task=await(await page.request.get(`/api/islands/${id}/coding-task`,{headers})).json();expect(task.task.prompt).toContain('星光水路');expect(task.preferences.animals).toBe('unicorn');
 await page.reload();await expect(page.locator('#dream-submit')).toBeDisabled();
 const submit=await page.request.put(`/api/islands/${id}/program`,{headers,data:{jobId:task.task.id,source:worldProgram('ocean',4),summary:'测试 Agent 提交了海洋场景代码。',scenePatch:{daylight:'night'}}});expect(submit.ok()).toBeTruthy();await expect(page.locator('#dream-submit')).toBeEnabled({timeout:15000});await expect(page.locator('.dream-program-status')).toContainText('世界代码已运行');await expect(page.locator('canvas')).toBeVisible();await page.screenshot({path:'artifacts/journey-night-ocean.png'});
 await page.getByRole('link',{name:'岛内信',exact:true}).click();await expect(page.locator('#mail-content')).toContainText(/等待分析服务|等待写信|正在写信/);await expect(page.locator('#mail-content')).not.toContainText('自由生长的想象者');await page.screenshot({path:'artifacts/journey-mail-waiting.png'});expect(errors).toEqual([]);
});

test('mobile connection page fits; all seven animals load, and both worlds permit landing',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});const r=await page.request.post('/api/auth/register',{data:{name:'移动验收',email:`mobile-${Date.now()}@example.com`,password:'mobile-test-password'}}),a=await r.json();await page.addInitScript(token=>{if(window===window.top)localStorage.setItem('our-island-owner-token',token);},a.token);await page.goto('/?view=onboarding');await expect(page).toHaveURL(/view=connect/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:'artifacts/journey-connect-mobile.png'});
 await page.setViewportSize({width:1280,height:800});await page.goto('/?view=animals');for(const name of ['猫','小狗','小鸟','兔子','熊猫','狐狸','独角兽']){await page.getByRole('button',{name,exact:true}).click();await expect(page.locator('#animal-status')).toContainText('模型已加载');}
 for(const kind of ['planet','ocean']){await page.goto('/?view=visit&demo='+kind);await expect.poll(()=>page.evaluate(()=>window.__visit?.stats()?.program.meshes||0),{timeout:20000}).toBeGreaterThan(10);expect(await page.evaluate(()=>window.__visit.stats().program.stopped)).toBeFalsy();await page.locator('#land').click();await expect(page.locator('#visit-status')).toContainText('已着陆');expect(await page.evaluate(()=>window.__visit.stats().walk.active)).toBeTruthy();await page.locator('#takeoff').click();await expect(page.locator('#land')).toBeVisible();}
 expect(errors).toEqual([]);
});
