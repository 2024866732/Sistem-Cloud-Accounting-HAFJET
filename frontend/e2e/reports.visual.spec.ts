import { test, expect } from '@playwright/test'

test('Reports page visual regression after export', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user: { name: 'Visual User', email: 'visual@example.com' }, token: 'visual-token', isAuthenticated: true }, version: 0 }))
    localStorage.setItem('authToken', 'visual-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Visual User', email: 'visual@example.com' }))
  })

  await page.goto('/reports')
  await expect(page.getByTestId('export-report-button')).toBeVisible()
  await page.getByTestId('export-report-button').click()
  await expect(page.locator('text=Export completed')).toBeVisible({ timeout: 3000 })

  // Wait for any overlays to disappear
  await page.waitForTimeout(1000)

  // Capture screenshot for visual regression
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('reports-after-export.png', { threshold: 0.05 })
})
