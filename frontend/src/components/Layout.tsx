import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface LayoutProps {
  children: ReactNode
}

interface NavItem {
  path: string
  label: string
  icon: string
}

const mainNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/companies', label: 'Companies', icon: '🏢' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/automation', label: 'Automation', icon: '🤖' },
  { path: '/banking', label: 'Banking', icon: '🏦' },
  { path: '/invoices', label: 'Invoices', icon: '📄' },
  { path: '/einvoice', label: 'E-Invoice', icon: '⚡' },
  { path: '/transactions', label: 'Transactions', icon: '💳' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/digital-shoebox', label: 'Digital Shoebox', icon: '🗂️' },
  { path: '/reports', label: 'Reports', icon: '📊' },
]

const adminNavItems: NavItem[] = [
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/data', label: 'Data Management', icon: '💾' },
  { path: '/security', label: 'Security', icon: '🔒' },
  { path: '/performance', label: 'Performance', icon: '⚡' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const collapsed = localStorage.getItem('hafjet_sidebar_collapsed') === 'true'
    setIsCollapsed(collapsed)
  }, [])

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('hafjet_sidebar_collapsed', String(newState))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.path}
      to={item.path}
      aria-current={isActivePath(item.path) ? 'page' : undefined}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActivePath(item.path)
          ? 'bg-blue-100 text-blue-700 font-semibold'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <span className="text-xl mr-3">{item.icon}</span>
      {!isCollapsed && <span>{item.label}</span>}
    </Link>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        aria-label="Sidebar utama"
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out hidden lg:flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">HAFJET Cloud</span>
                  <span className="text-xs text-gray-600">Accounting System</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="mb-6">
            <h3 className={`text-xs font-semibold text-gray-500 mb-2 ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? '◆' : 'Main Features'}
            </h3>
            <div className="space-y-1">
              {mainNavItems.map(renderNavItem)}
            </div>
          </div>

          <div className="mb-6">
            <h3 className={`text-xs font-semibold text-gray-500 mb-2 ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? '◇' : 'Administration'}
            </h3>
            <div className="space-y-1">
              {adminNavItems.map(renderNavItem)}
            </div>
          </div>
        </nav>

        {/* Footer with collapse button and logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mb-2"
          >
            <span className="text-xl">{isCollapsed ? '→' : '←'}</span>
            {!isCollapsed && <span className="ml-2">Collapse</span>}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="text-xl">{isCollapsed ? '🚪' : '🚪'}</span>
            {!isCollapsed && <span className="ml-2">Log Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-bold text-gray-900">HAFJET</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}

        {/* Mobile Menu Panel */}
        <aside
          className={`fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">HAFJET Cloud</span>
                <span className="text-xs text-gray-600">Accounting System</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Main Features</h3>
              <div className="space-y-1">
                {mainNavItems.map(renderNavItem)}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Administration</h3>
              <div className="space-y-1">
                {adminNavItems.map(renderNavItem)}
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="ml-2">Log Keluar</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-16">
        {children}
      </main>
    </div>
  )
}

export default Layout
