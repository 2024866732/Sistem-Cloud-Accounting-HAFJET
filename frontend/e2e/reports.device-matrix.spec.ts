import { test, expect } from '@playwright/test'

// Matrix test: re-run basic Reports smoke checks across configured projects
test.describe('Reports device/browser matrix', () => {
  test('basic reports smoke (controls, export, FAB) @matrix', async ({ page }) => {
    // Seed authenticated state so the reports UI renders
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({ state: { user: { name: 'Matrix User', email: 'matrix@example.com' }, token: 'matrix-token', isAuthenticated: true }, version: 0 }))
      localStorage.setItem('authToken', 'matrix-token')
      localStorage.setItem('user', JSON.stringify({ name: 'Matrix User', email: 'matrix@example.com' }))
    })

    await page.goto('/reports')

    // Heading is present
    await expect(page.getByRole('heading').first()).toBeVisible()

    // Controls: date select and export button
    const dateSelect = page.getByTestId('select-date-range')
    await expect(dateSelect).toBeVisible()

    const exportBtn = page.getByTestId('export-report-button')
    await expect(exportBtn).toBeVisible()

    // FAB/help
    const fab = page.getByTestId('fab-help')
    await expect(fab).toBeVisible()
    // Click via DOM to avoid viewport issues in headless
    await fab.evaluate((el: HTMLElement) => el.click())
    await expect(page.locator('text=Need help with Reports')).toBeVisible()
  })
})
