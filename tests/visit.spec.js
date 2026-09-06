import {test,expect} from '@playwright/test';
import {signIn} from './auth-helper.js';
test.beforeEach(async({page})=>signIn(page));
test('landing, walking, boundary and takeoff work on a sample island',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?view=visit&demo=forest');await expect(page.locator('#land')).toBeVisible();await page.locator('#land').click();await expect(page.locator('#visit-status')).toContainText('已着陆');
 const start=await page.evaluate(()=>window.__visit.stats().walk.position);await page.keyboard.down('w');await expect.poll(()=>page.evaluate(()=>window.__visit.stats().walk.position[0])).toBeGreaterThan(start[0]+.2);await page.keyboard.up('w');
 await page.keyboard.press('Escape');await expect(page.locator('#land')).toBeVisible();expect(await page.evaluate(()=>window.__visit.stats().walk.active)).toBe(false);expect(errors).toEqual([]);
});
test('mobile direction buttons move the visitor and release stops movement',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=visit&demo=society');await page.locator('#land').click();await expect(page.locator('#visit-status')).toContainText('已着陆');
 const start=await page.evaluate(()=>window.__visit.stats().walk.position);const button=page.getByRole('button',{name:'向左走'});const bounds=await button.boundingBox();await page.mouse.move(bounds.x+24,bounds.y+24);await page.mouse.down();await expect.poll(()=>page.evaluate(()=>window.__visit.stats().walk.position[2])).toBeLessThan(start[2]-.15);await page.mouse.up();await page.screenshot({path:'artifacts/landing-mobile.png'});await page.locator('#takeoff').click();await expect(page.locator('.walk-hud')).toBeHidden();
});
test('an owner can land on the island they just created',async({page})=>{
 await page.goto('/?view=studio');await expect(page.getByRole('link',{name:/着陆到我的岛/})).toBeVisible();await page.getByRole('link',{name:/着陆到我的岛/}).click();
 await expect(page).toHaveURL(/view=visit&own=1/);await expect(page.locator('#visit-kind')).toHaveText('我的岛 · 岛主漫游');await expect(page.locator('#land')).toBeVisible();
 await page.locator('#land').click();await expect(page.locator('#visit-status')).toContainText('已着陆');expect(await page.evaluate(()=>window.__visit.stats().walk.active)).toBe(true);
});
test('private islands cannot be visited',async({page})=>{
 await page.route('**/api/islands/private',r=>r.fulfill({status:403,json:{error:'这座岛未开放发现'}}));await page.goto('/?view=visit&island=private');await expect(page.locator('#visit-status')).toHaveText('这座岛未开放发现');await expect(page.locator('#land')).toBeHidden();await expect(page.locator('canvas')).toHaveCount(0);
});
