import {test,expect} from '@playwright/test';

test('account creation leads to onboarding, login returns to the same island, and logout protects it',async({page})=>{
 const email=`islander-${Date.now()}@example.com`,password='a-calm-island-password';
 await page.goto('/?view=studio');await expect(page.getByRole('heading',{name:/回来/})).toBeVisible();
 await page.getByRole('tab',{name:'创建账号'}).click();await page.getByLabel('怎么称呼你').fill('小满');await page.getByLabel('邮箱').fill(email);await page.getByLabel('密码').fill(password);await page.getByRole('button',{name:/创建账号/}).click();
 await expect(page).toHaveURL(/view=onboarding/);await expect(page.getByRole('heading',{name:/喜欢自己/})).toBeVisible();
 await page.locator('#arrival-next').click();for(const choice of ['none','none','balanced','open','none']){await page.locator(`[data-choice="${choice}"]`).click();await page.locator('#arrival-next').click();}
 await page.locator('#arrival-create').click();await expect(page.locator('#dream-prompt')).toBeVisible();const firstIsland=await page.evaluate(async()=>{const token=localStorage.getItem('our-island-owner-token');return (await fetch('/api/me',{headers:{Authorization:`Bearer ${token}`}})).json();});
 await page.getByRole('button',{name:'退出'}).click();await expect(page.locator('#universe canvas')).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('our-island-owner-token'))).toBeNull();await page.locator('#join').click();await expect(page.getByRole('heading',{name:/回来/})).toBeVisible();
 await page.getByLabel('邮箱').fill(email);await page.getByLabel('密码').fill(password);await page.getByRole('button',{name:/登录并回到/}).click();await expect(page.locator('#dream-prompt')).toBeVisible();
 const secondIsland=await page.evaluate(async()=>{const token=localStorage.getItem('our-island-owner-token');return (await fetch('/api/me',{headers:{Authorization:`Bearer ${token}`}})).json();});expect(secondIsland.island.id).toBe(firstIsland.island.id);expect(secondIsland.user.name).toBe('小满');
});

test('wrong password stays signed out without revealing another island',async({page,request})=>{
 const email=`wrong-${Date.now()}@example.com`;await request.post('/api/auth/register',{data:{name:'错误测试',email,password:'correct-password'}});await page.goto('/?view=auth');await page.getByLabel('邮箱').fill(email);await page.getByLabel('密码').fill('incorrect-password');await page.getByRole('button',{name:/登录并回到/}).click();await expect(page.locator('#auth-message')).toHaveText('邮箱或密码不正确');await expect(page).toHaveURL(/view=auth/);expect(await page.evaluate(()=>localStorage.getItem('our-island-owner-token'))).toBeNull();
});

test('login and onboarding fit a mobile viewport',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/?view=auth');await expect(page.locator('.auth-card')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/account-login-mobile.png'});});
