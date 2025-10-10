import { test, expect } from '@playwright/test'
import axe from '@axe-core/playwright'

test('Export triggers status update', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user: { name: 'Export User', email: 'export@example.com' }, token: 'export-token', isAuthenticated: true }, version: 0 }))
    localStorage.setItem('authToken', 'export-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Export User', email: 'export@example.com' }))
  })

  await page.goto('/reports')
  const results = await new axe({ page }).analyze()
  if (results.violations.length > 0) {
    console.error('Accessibility violations:', results.violations)
    throw new Error('Accessibility violations detected')
  }
  const exportBtn = page.getByTestId('export-report-button')
  await expect(exportBtn).toBeVisible()

  // Intercept download request and verify response
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    exportBtn.click()
  ])
  // Save the downloaded file to a temp path
  const filePath = await download.path()
  expect(filePath).toBeTruthy()

  // The exportStatus is exposed via an aria-live region (sr-only). Check for the completion text.
  await expect(page.locator('text=Export completed')).toBeVisible({ timeout: 3000 })
  // Run axe after export flow
  const postExportResults = await new axe({ page }).analyze()
  if (postExportResults.violations.length > 0) {
    console.error('Accessibility violations after export:', postExportResults.violations)
    throw new Error('Accessibility violations detected after export')
  }
})
// Accessibility coverage: axe-core checks run after page load and after export. CI will fail on any violation.
