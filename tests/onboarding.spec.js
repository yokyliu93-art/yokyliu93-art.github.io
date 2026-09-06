import {test,expect} from '@playwright/test';
import {signIn} from './auth-helper.js';
test.beforeEach(async({page})=>signIn(page,{onboarded:false}));
async function choose(page){await page.locator('#arrival-next').click();await expect(page.locator('#arrival-next')).toBeDisabled();for(const choice of ['pond','cat','night','floating','flowers']){await page.locator(`[data-choice="${choice}"]`).click();await expect(page.locator(`[data-choice="${choice}"]`)).toHaveAttribute('aria-pressed','true');await page.locator('#arrival-next').click();}}
test('guided choices persist island and private user-confirmed memory',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?view=onboarding');await choose(page);await expect(page.locator('#arrival-quote')).toContainText('漂浮');await page.locator('#arrival-create').click();await expect(page.locator('#dream-prompt')).toBeVisible();await expect(page.locator('.dream-memory')).toContainText('有猫');const me=await page.evaluate(async()=>{const headers={Authorization:'Bearer '+localStorage.getItem('our-island-owner-token')};return (await fetch('/api/me',{headers})).json();});expect(me.island.scene.objects.some(o=>o.kind==='cat')).toBe(true);expect(me.island.scene.objects.find(o=>o.kind==='house').y).toBeGreaterThan(0);expect(me.island.scene.daylight).toBe('night');await page.locator('.dream-memory summary').click();await page.getByRole('button',{name:'忘记这些偏好'}).click();await expect(page.locator('.dream-memory')).toHaveCount(0);expect(errors).toEqual([]);});
test('mobile guided choices fit, with optional free text and opt-out memory',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/?view=onboarding');await choose(page);await expect(page.locator('#arrival-create')).toBeVisible();await page.locator('#arrival-remember').uncheck();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#arrival-create').click();await expect(page.locator('#dream-prompt')).toBeVisible();await expect(page.locator('.dream-memory')).toHaveCount(0);});
test('start with a bare 3D island then choose water',async({page})=>{
 await page.goto('/?view=onboarding');await expect(page.locator('canvas')).toBeVisible();await page.screenshot({path:'artifacts/empty-island.png'});await page.locator('#arrival-next').click();await expect(page.locator('h1')).toContainText('水来到岛上');await page.locator('[data-choice="river"]').click();await expect(page.locator('.choice-feedback')).toContainText('预览已更新');await page.screenshot({path:'artifacts/island-first-water.png'});await page.locator('[data-choice="none"]').click();await page.locator('#arrival-next').click();await expect(page.locator('h1')).toContainText('陪你');
});
test('every step accepts custom words and inspiration appends without losing the draft',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=onboarding');await page.locator('#arrival-next').click();
 const descriptions=['一座水母城','一条会发光的龙','每一天有三次黄昏','住在巨鲸背上的花园','流向天空的河'];
 for(const description of descriptions){
  await page.locator('[data-choice="custom"]').click();await expect(page.locator('#arrival-next')).toBeDisabled();await page.locator('#arrival-custom').fill(description);await expect(page.locator('#arrival-next')).toBeEnabled();await page.locator('#arrival-next').click();
 }
 for(const description of descriptions)await expect(page.locator('#arrival-quote')).toContainText(description);
 await page.locator('#arrival-prompt').fill('保留我亲手写的这句话。');await page.getByRole('button',{name:/天气的魔法/}).click();await page.getByRole('button',{name:/天气的魔法/}).click();
 const note=await page.locator('#arrival-prompt').inputValue();expect(note).toContain('保留我亲手写的这句话。');expect(note.split('水洼里').length).toBe(2);
 await page.locator('#arrival-back').click();await expect(page.locator('#arrival-custom')).toHaveValue(descriptions[4]);await page.locator('#arrival-next').click();await expect(page.locator('#arrival-prompt')).toHaveValue(note);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/custom-inspiration-mobile.png',fullPage:true});
 await page.locator('#arrival-create').click();await expect(page.locator('#dream-prompt')).toHaveValue(/水母城/);
 const value=await page.locator('#dream-prompt').inputValue();for(const description of descriptions)expect(value).toContain(description);expect(value).toContain(note);
 const memory=await page.evaluate(async()=> (await fetch('/api/preferences',{headers:{Authorization:'Bearer '+localStorage.getItem('our-island-owner-token')}})).json());expect(memory.payload.custom.animals).toBe(descriptions[1]);
});
