import { test, expect, Page } from '@playwright/test'

// Auth Flow + Navigation smoke (assumes app uses localStorage persisted auth)

test.describe('Auth Flow & Navigation', () => {
  test('login seed -> navigate dashboard -> banking', async ({ page }: { page: Page }) => {
    // Seed auth state before page scripts run
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { name: 'Automation User', email: 'auto@example.com' },
          token: 'e2e-token',
          isAuthenticated: true
        },
        version: 0
      }))
      localStorage.setItem('authToken', 'e2e-token')
      localStorage.setItem('user', JSON.stringify({ name: 'Automation User', email: 'auto@example.com' }))
    })

    await page.goto('/dashboard')
    await expect(page.getByText(/Cloud Accounting|Perakaunan/i)).toBeVisible()

    // Navigate to Banking via sidebar link (ensure visible)
    const bankingLink = page.getByRole('link', { name: 'Banking' })
    await bankingLink.click()
    // Confirm banking page content (fallback to heading text if present)
    await expect(page.locator('body')).toContainText(/Banking|Akaun Bank|Reconciliation/i)
  })
})
