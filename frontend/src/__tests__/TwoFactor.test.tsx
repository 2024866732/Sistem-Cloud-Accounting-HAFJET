import React from 'react'
import { vi } from 'vitest'
import type { Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import UserManagement from '../pages/UserManagement'

// Mock services (use Vitest `vi` global)
vi.mock('../services/api', () => ({
  settingsService: {
    setup2FA: vi.fn(),
    verify2FA: vi.fn(),
    disable2FA: vi.fn(),
  },
  authService: {
    getCurrentUser: vi.fn(),
  }
}))

import { settingsService, authService } from '../services/api'

describe('TwoFactor UI', () => {
  beforeEach(() => {
  ;(authService.getCurrentUser as unknown as Mock).mockResolvedValue({ data: { id: '3' } })
  })

  it('setup, verify, and shows backup codes', async () => {
  ;(settingsService.setup2FA as unknown as Mock).mockResolvedValue({ data: { qr: 'data:image/png;base64,AAA', secret: 'BASE32' } })
  ;(settingsService.verify2FA as unknown as Mock).mockResolvedValue({ data: { backupCodes: ['code1', 'code2'] } })

    const user = userEvent.setup()
    render(<UserManagement />)

  // wait for header
  await screen.findByRole('heading', { name: /User Management/i })

  // open Settings tab
  await user.click(screen.getByText('Security Settings'))

  // wait for Setup button to appear (loading finishes)
  const setupBtn = await screen.findByText('Setup 2FA')
  await user.click(setupBtn)

  // modal should open with QR image
  await screen.findByAltText('2FA QR')

    // enter token and verify
    await user.type(screen.getByPlaceholderText('123456'), '123456')
    await user.click(screen.getByText('Verify & Enable'))

    // expect backup codes to be shown in modal after verify
    await screen.findByText('Backup codes')
    expect(screen.getByText('code1')).toBeInTheDocument()
  })
})
