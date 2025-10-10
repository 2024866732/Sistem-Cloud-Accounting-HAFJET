import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    headless: true,
    actionTimeout: 0,
    trace: 'on-first-retry',
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173'
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120000,
    reuseExistingServer: true
  },
  projects: [
    {
      name: 'Desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } }
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad (gen 7)'] }
    },
    {
      name: 'Mobile',
      use: { ...devices['iPhone 12'] }
    }
  ]
})
