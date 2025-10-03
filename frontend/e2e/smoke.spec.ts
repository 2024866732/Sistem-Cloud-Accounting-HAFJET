import { test, expect, type Page } from '@playwright/test'

// Basic smoke test to ensure app loads and sidebar renders

test.describe('Smoke: App shell', () => {
  test('loads dashboard shell', async ({ page }: { page: Page }) => {
    await page.goto('/')
    // Title text from header (desktop) or mobile variant
    await expect(page.getByText('Sistem Perakaunan Cloud Malaysia').or(page.getByText('Cloud Accounting MY'))).toBeVisible()
  })

  test('sidebar navigation visible (desktop)', async ({ page, browserName }: { page: Page; browserName: string }) => {
    test.skip(browserName === 'webkit', 'Optional skip example')
    await page.goto('/')
    // Dashboard link (icon text) should appear
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  })

  test('mobile menu opens on small viewport', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 500, height: 900 })
    await page.goto('/')
    const openBtn = page.getByRole('button', { name: /open navigation menu/i })
    await openBtn.click()
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  })
})
