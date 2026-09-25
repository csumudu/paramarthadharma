import { expect, test } from '@playwright/test';

test('home renders Sinhala title with lang=si', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'si');
  await expect(page.getByRole('heading', { name: 'පරමාර්ථ ධර්ම' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
