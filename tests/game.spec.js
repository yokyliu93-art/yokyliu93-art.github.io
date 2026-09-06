import {test,expect} from '@playwright/test';
import {signIn} from './auth-helper.js';
test.beforeEach(async({page})=>signIn(page));
test('3D world, weather, persistence, quests, expansion and visiting',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/?view=island');await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('#loading')).toHaveCount(0);
 expect((await page.evaluate(()=>window.__island.getStats())).webgl).toBe(true);
 await page.screenshot({path:'artifacts/island-day.png'});
 await page.getByRole('button',{name:'天气与光',exact:true}).click();await page.locator('[data-weather="rain"]').click();
 await page.locator('[data-time="night"]').click();await expect(page.locator('#weather-caption')).toHaveText('细雨 · 星河入梦');
 await page.reload();await expect(page.locator('#weather-caption')).toHaveText('细雨 · 星河入梦');
 await page.getByRole('button',{name:'天气与光',exact:true}).click();await page.locator('[data-weather="rainbow"]').click();await page.locator('[data-time="sunset"]').click();
 await page.getByRole('button',{name:'岛屿成长',exact:true}).click();await page.locator('[data-reward="weather"]').click();await expect(page.locator('#coins')).toHaveText('140');await expect(page.locator('[data-reward="weather"]')).toBeDisabled();
 await page.locator('#expand').click();expect((await page.evaluate(()=>window.__island.getState())).expansions).toBe(1);await expect(page.locator('#coins')).toHaveText('40');await page.locator('#expand').click();await expect(page.locator('#coins')).toHaveText('40');
 await page.getByRole('button',{name:'遇见彼此',exact:true}).click();await page.locator('[data-visit="0"]').click();await expect(page.locator('.visit-banner')).toContainText('慢慢岛');await page.locator('#home').click();await expect(page.locator('.visit-banner')).toHaveCount(0);
 await page.getByRole('button',{name:'岛屿声音',exact:true}).click();await page.locator('[data-music="piano"]').click();await page.locator('#toggle-sound').click();await expect(page.locator('#toggle-sound')).toHaveText('暂停声音');await page.locator('#toggle-sound').click();
 await page.locator('.close').click();await page.screenshot({path:'artifacts/island-rainbow.png'});
 const download=page.waitForEvent('download');await page.locator('#capture').click();const file=await download;expect(file.suggestedFilename()).toBe('我们的岛.png');await file.saveAs('artifacts/export.png');
 expect(errors).toEqual([]);
});
test('place an object using the actual 3D canvas and refund it',async({page})=>{
 await page.goto('/?view=island');await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('#loading')).toHaveCount(0);await page.getByRole('button',{name:'布置岛屿',exact:true}).click();await page.locator('[data-object="lamp"]').click();
 // Select a clear patch in the front-left garden; real pointer events drive raycasting.
 await page.mouse.move(525,435);await page.mouse.click(525,435);
 await expect.poll(()=>page.evaluate(()=>window.__island.getState().objects.length)).toBe(1);
 await expect(page.locator('#coins')).toHaveText('105');await page.reload();await expect(page.locator('canvas')).toBeVisible();expect((await page.evaluate(()=>window.__island.getState())).objects).toHaveLength(1);
 await page.getByRole('button',{name:'布置岛屿',exact:true}).click();await page.locator('#undo').click();await expect(page.locator('#coins')).toHaveText('120');expect((await page.evaluate(()=>window.__island.getState())).objects).toHaveLength(0);
});
test('mobile controls remain within viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=island');await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('#loading')).toHaveCount(0);await page.getByRole('button',{name:'天气与光',exact:true}).click();
 const panel=await page.locator('.panel').boundingBox();expect(panel.x).toBeGreaterThanOrEqual(0);expect(panel.x+panel.width).toBeLessThanOrEqual(390);await page.locator('[data-weather="rain"]').click();await expect(page.locator('#weather-caption')).toContainText('细雨');await page.screenshot({path:'artifacts/island-mobile.png'});
});
test('collect visible stars with raycasting and claim a reward once',async({page})=>{
 await page.goto('/?view=island');await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('#loading')).toHaveCount(0);
 for(let i=0;i<3;i++){const points=await page.evaluate(()=>window.__island.getCollectibleTargets());const p=points.find(p=>p.x>360&&p.x<1050&&p.y>300&&p.y<650);expect(p).toBeTruthy();await page.mouse.click(p.x,p.y);await expect.poll(()=>page.evaluate(()=>window.__island.getState().collected)).toBe(i+1);}
 await expect(page.locator('#coins')).toHaveText('150');await page.getByRole('button',{name:'岛屿成长',exact:true}).click();await page.locator('[data-reward="collect"]').click();await expect(page.locator('#coins')).toHaveText('180');await expect(page.locator('[data-reward="collect"]')).toBeDisabled();
});
