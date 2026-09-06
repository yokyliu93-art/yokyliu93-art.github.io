import {test,expect} from '@playwright/test';

test('logo proposal presents four distinct directions without requiring login',async({page})=>{
 await page.goto('/?view=brand');
 await expect(page.getByRole('heading',{name:/把自己/})).toBeVisible();
 await expect(page.locator('.concept')).toHaveCount(4);
 await expect(page.locator('.recommended')).toContainText('内在地形');
 await expect(page.locator('.board-header .island-logo-mark')).toBeVisible();
 await expect(page.locator('.system')).toContainText('#355C4B');
 await expect(page.locator('.auth-card')).toHaveCount(0);
});
