import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../Layout'

const logoutMock = vi.fn()

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    logout: logoutMock,
  }),
}))

const originalInnerWidth = window.innerWidth

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Layout>
        <div data-testid="content">Content</div>
      </Layout>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear()
    logoutMock.mockClear()
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
  })

  it('renders main navigation items', () => {
    renderWithRoute('/dashboard')
    expect(screen.getAllByText(/Dashboard/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/Banking/i)[0]).toBeInTheDocument()
  })

  it('highlights active link with aria-current', () => {
    renderWithRoute('/banking')
    const activeLinks = screen.getAllByRole('link', { name: /Banking/i })
    const active = activeLinks.find((link) => link.getAttribute('aria-current') === 'page')
    expect(active).toBeDefined()
  })

  it('can collapse and expand sidebar', () => {
    renderWithRoute('/dashboard')
    const collapse = screen.getByLabelText(/Collapse sidebar/i)
    fireEvent.click(collapse)
    expect(screen.getAllByText('🚪')[0]).toBeInTheDocument()
    const expand = screen.getByLabelText(/Expand sidebar/i)
    fireEvent.click(expand)
    expect(screen.getAllByText(/Log Keluar/i)[0]).toBeInTheDocument()
  })

  it('persists collapsed state', () => {
    renderWithRoute('/dashboard')
    fireEvent.click(screen.getByLabelText(/Collapse sidebar/i))
    expect(localStorage.getItem('hafjet_sidebar_collapsed')).toBe('true')
  })

  it('opens and closes mobile menu (simulated small screen)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })
    window.dispatchEvent(new Event('resize'))
    renderWithRoute('/dashboard')
    const openBtn = screen.getByRole('button', { name: /Open navigation menu/i })
    fireEvent.click(openBtn)
    // menu content present
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument()
    // close (backdrop is button with aria-label Close navigation menu)
    const closeBtn = screen.getAllByRole('button', { name: /Close navigation menu/i })
    fireEvent.click(closeBtn[0])
  })
})
