import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HelpModal from '../HelpModal'

describe('HelpModal', () => {
  it('renders when open and calls onClose', () => {
    const onClose = vi.fn()
    render(<HelpModal open={true} onClose={onClose} />)
    expect(screen.getByText(/Need help with Reports/i)).toBeInTheDocument()
    const closeBtn = screen.getByRole('button', { name: /Close help/i })
    expect(closeBtn).toBeInTheDocument()
  })
})
