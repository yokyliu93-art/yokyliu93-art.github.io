import {test,expect} from '@playwright/test';
import {signIn} from './auth-helper.js';
test.beforeEach(async({page})=>signIn(page,{onboarded:false}));
test('missing WebGL shows an island preview and a usable retry instead of blank sky',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args);};});
 await page.goto('/?view=onboarding');await expect(page.locator('.arrival-fallback')).toBeVisible();await expect(page.getByText('岛屿静态预览 · 3D 暂未启动')).toBeVisible();
 expect((await page.request.get('/assets/island-preview.png')).status()).toBe(200);await page.locator('#arrival-next').click();await page.locator('[data-choice="pond"]').click();await expect(page.locator('#arrival-next')).toBeEnabled();await page.screenshot({path:'artifacts/webgl-fallback.png'});
 await page.getByRole('button',{name:'以低负载模式重试'}).click();await expect(page).toHaveURL(/low3d=1/);
});
test('lightweight mode renders the live island',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?view=onboarding&low3d=1');await expect(page.locator('.arrival-rendered canvas')).toBeVisible();await expect(page.locator('.arrival-render-notice')).toBeHidden();expect(errors).toEqual([]);});
test('homepage keeps the archipelago usable when WebGL is unavailable',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args);};});
 await page.goto('/');
 await expect(page.locator('.cosmos-fallback')).toBeVisible();
 await expect(page.getByText('群岛轻盈模式')).toBeVisible();
 await expect(page.getByRole('heading',{name:/喜欢自己/})).toBeVisible();
 await expect(page.getByText('3D 世界暂时无法加载')).toHaveCount(0);
 await page.locator('#join').click();
 await expect(page).toHaveURL(/view=onboarding/);
});
