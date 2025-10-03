import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import NotificationCenter from './NotificationCenter'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  // New: Desktop sidebar collapse state
  const [collapsed, setCollapsed] = useState(false)

  // Load persisted collapsed state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hafjet_sidebar_collapsed')
      if (stored === 'true') setCollapsed(true)
    } catch {
      // ignore read error (e.g., SSR or privacy mode)
    }
  }, [])

  // Persist when changes
  useEffect(() => {
    try {
      localStorage.setItem('hafjet_sidebar_collapsed', collapsed ? 'true' : 'false')
    } catch {
      // ignore write error
    }
  }, [collapsed])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', category: 'main' },
    { name: 'Analytics', href: '/analytics', icon: '🚀', category: 'advanced' },
    { name: 'Automation', href: '/automation', icon: '⚡', category: 'advanced' },
    { name: 'Companies', href: '/companies', icon: '🏢', category: 'main' },
    { name: 'Banking', href: '/banking', icon: '🏦', category: 'main' },
    { name: 'Invoices', href: '/invoices', icon: '🧾', category: 'main' },
    { name: 'E-Invoice LHDN', href: '/einvoice', icon: '🇲🇾', category: 'main' },
    { name: 'Transactions', href: '/transactions', icon: '💰', category: 'main' },
    { name: 'Inventory', href: '/inventory', icon: '📦', category: 'main' },
    { name: 'Digital Shoebox', href: '/digital-shoebox', icon: '📁', category: 'advanced' },
    { name: 'Reports', href: '/reports', icon: '📈', category: 'main' },
    { name: 'Data Management', href: '/data', icon: '💾', category: 'advanced' },
    { name: 'Security', href: '/security', icon: '🛡️', category: 'system' },
    { name: 'Performance', href: '/performance', icon: '⚡', category: 'system' },
    { name: 'User Management', href: '/users', icon: '👥', category: 'system' },
    { name: 'Settings', href: '/settings', icon: '⚙️', category: 'system' },
  ]

  const mainNavigation = navigation.filter(item => item.category === 'main')
  const advancedNavigation = navigation.filter(item => item.category === 'advanced')
  const systemNavigation = navigation.filter(item => item.category === 'system')

  return (
    <div className="flex h-screen bg-gradient-to-br from-futuristic-dark via-futuristic-gray-900 to-futuristic-darker overflow-hidden">
      
      {/* Desktop Sidebar (now visible from md breakpoint) */}
      <aside
        data-testid="sidebar"
        data-collapsed={collapsed ? 'true' : 'false'}
        className={`flex max-md:hidden ${collapsed ? 'w-20' : 'w-80'} flex-col border-r border-futuristic-neon-blue/30 shadow-[0_0_30px_rgba(0,212,255,0.25)] relative bg-[#0d1117] text-white transition-[width] duration-300 ease-in-out`}
        aria-label="Sidebar utama"
        aria-expanded={!collapsed}
      >
        {/* Opaque single layer (remove gradients to prevent bleed) */}
        <div className="absolute inset-0 bg-[#0d1117]" />
        {/* Optional subtle pattern overlay (very low opacity) */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle at 25% 25%,#1f2937 0%,transparent 60%)'}} />

        <div className="relative flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Logo */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} mb-8`}> 
            <div className="h-10 w-10 bg-gradient-to-br from-futuristic-neon-blue to-futuristic-neon-purple rounded-full flex items-center justify-center shadow-neon-blue flex-shrink-0">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-lg font-bold text-white block leading-tight truncate">HAFJET Cloud</span>
                <span className="text-sm text-futuristic-neon-blue block leading-tight">Accounting System</span>
              </div>
            )}
          </div>

          <nav className="space-y-6">
            {/* Main Features */}
            <div>
              <h3 className="text-futuristic-neon-blue text-xs font-semibold uppercase tracking-wider mb-3">Main Features</h3>
              <div className="space-y-2">
                {mainNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      title={collapsed ? item.name : undefined}
                      className={`${isActive
                        ? 'bg-futuristic-gray-800 text-futuristic-neon-blue border-l-2 border-futuristic-neon-blue shadow-glow'
                        : 'text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800'
                      } group flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-futuristic-neon-blue/50`}
                    >
                      <span className={`text-lg ${collapsed ? '' : 'mr-3'}`}>{item.icon}</span>
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Advanced Features */}
            <div>
              <h3 className="text-futuristic-neon-purple text-xs font-semibold uppercase tracking-wider mb-3">Advanced</h3>
              <div className="space-y-2">
                {advancedNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      title={collapsed ? item.name : undefined}
                      className={`${isActive
                        ? 'bg-futuristic-gray-800 text-futuristic-neon-purple border-l-2 border-futuristic-neon-purple shadow-glow'
                        : 'text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800'
                      } group flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-futuristic-neon-purple/50`}
                    >
                      <span className={`text-lg ${collapsed ? '' : 'mr-3'}`}>{item.icon}</span>
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* System Features */}
            <div>
              <h3 className="text-futuristic-neon-green text-xs font-semibold uppercase tracking-wider mb-3">System</h3>
              <div className="space-y-2">
                {systemNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      title={collapsed ? item.name : undefined}
                      className={`${isActive
                        ? 'bg-gradient-to-r from-futuristic-neon-green/20 to-futuristic-neon-yellow/20 text-futuristic-neon-green border-l-2 border-futuristic-neon-green shadow-neon'
                        : 'text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800/50'
                      } group flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-futuristic-neon-green/50`}
                    >
                      <span className={`text-lg ${collapsed ? '' : 'mr-3'}`}>{item.icon}</span>
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>
        </div>
        
        {/* User Profile Section - Desktop */}
        <div className={`relative p-6 border-t border-futuristic-neon-blue/20 bg-futuristic-gray-900 ${collapsed ? 'px-2' : ''}`}>
          <div className={`bg-futuristic-gray-800 backdrop-blur-sm rounded-2xl ${collapsed ? 'p-3 flex flex-col items-center' : 'p-4'} border border-futuristic-neon-blue/20`}>            
            <div className={`flex ${collapsed ? 'flex-col items-center space-y-2' : 'items-center space-x-3'} mb-3`}>
              <div className="h-10 w-10 bg-gradient-to-br from-futuristic-neon-green to-futuristic-neon-blue rounded-full flex items-center justify-center text-white font-bold shadow-neon">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-futuristic-gray-400 truncate">
                    {user?.email || 'user@hafjet.com'}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white ${collapsed ? 'py-2 px-2 text-xs' : 'py-2 px-4 text-sm'} rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105`}
            >
              {collapsed ? '🚪' : '🚪 Log Keluar'}
            </button>
          </div>
        </div>
      </aside>
      
      {/* (Removed duplicate old Mobile Menu Overlay block) */}

      {/* Enhanced Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Futuristic Header */}
        <header className="bg-gradient-to-r from-futuristic-gray-900/70 to-futuristic-dark/70 backdrop-blur-xl shadow-cyber border-b border-futuristic-neon-blue/20 flex-shrink-0 relative overflow-hidden">
          {/* Animated Header Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, #00D4FF 50%, transparent 100%)
            `,
            animation: 'data-flow 3s linear infinite'
          }} />
          
          <div className="relative px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Toggle (mobile only) */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800 focus:outline-none focus:ring-2 focus:ring-futuristic-neon-blue focus:ring-offset-2 focus:ring-offset-futuristic-dark transition-colors"
                  aria-label="Open navigation menu"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {/* Desktop Collapse Toggle (md and up) */}
                <button
                  type="button"
                  onClick={() => setCollapsed(c => !c)}
                  data-testid="collapse-toggle"
                  className="hidden md:inline-flex items-center justify-center p-2 rounded-lg text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800 focus:outline-none focus:ring-2 focus:ring-futuristic-neon-blue focus:ring-offset-2 focus:ring-offset-futuristic-dark transition-colors"
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  aria-pressed={collapsed}
                >
                  {collapsed ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h8.586l-2.293-2.293A1 1 0 1111.707 5.3l4 4a1 1 0 010 1.414l-4 4A1 1 0 0110.293 13.3L12.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a1 1 0 01-1 1H7.414l2.293 2.293A1 1 0 018.293 14.7l-4-4a1 1 0 010-1.414l4-4A1 1 0 019.707 5.3L7.414 8H16a1 1 0 011 1z" clipRule="evenodd" /></svg>
                  )}
                </button>
      {/* Mobile Slide-in Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Backdrop */}
          <button
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-sm focus:outline-none"
          />
          {/* Panel */}
          <div
            className="absolute top-0 left-0 h-full w-80 bg-[#0d1117] border-r border-futuristic-neon-blue/30 shadow-[0_0_25px_rgba(0,212,255,0.35)] animate-slide-in-left flex flex-col"
            data-testid="mobile-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-futuristic-neon-blue/20">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-futuristic-neon-blue to-futuristic-neon-purple rounded-full flex items-center justify-center shadow-neon-blue">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">HAFJET Cloud</p>
                  <p className="text-[11px] text-futuristic-neon-blue leading-tight">Accounting</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-md text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800 focus:outline-none focus:ring-2 focus:ring-futuristic-neon-blue"
              >
                ✕
              </button>
            </div>

            {/* Nav Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
              {/* Main */}
              <div>
                <h3 className="text-futuristic-neon-blue text-[11px] font-semibold uppercase tracking-wider mb-3">Main</h3>
                <div className="space-y-2">
                  {mainNavigation.map(item => {
                    const active = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`${active
                          ? 'bg-futuristic-gray-800 text-futuristic-neon-blue border-l-2 border-futuristic-neon-blue shadow-glow'
                          : 'text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800'
                        } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Advanced */}
              <div>
                <h3 className="text-futuristic-neon-purple text-[11px] font-semibold uppercase tracking-wider mb-3">Advanced</h3>
                <div className="space-y-2">
                  {advancedNavigation.map(item => {
                    const active = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`${active
                          ? 'bg-futuristic-gray-800 text-futuristic-neon-purple border-l-2 border-futuristic-neon-purple shadow-glow'
                          : 'text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800'
                        } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* System */}
              <div>
                <h3 className="text-futuristic-neon-green text-[11px] font-semibold uppercase tracking-wider mb-3">System</h3>
                <div className="space-y-2">
                  {systemNavigation.map(item => {
                    const active = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`${active
                          ? 'bg-gradient-to-r from-futuristic-neon-green/20 to-futuristic-neon-yellow/20 text-futuristic-neon-green border-l-2 border-futuristic-neon-green shadow-neon'
                          : 'text-futuristic-gray-300 hover:text-white hover:bg-futuristic-gray-800/50'
                        } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300`}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="border-t border-futuristic-gray-800 p-5">
              <button
                onClick={() => { logout(); setMobileOpen(false) }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                🚪 Log Keluar
              </button>
            </div>
          </div>
        </div>
      )}
                
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-futuristic-neon-blue to-futuristic-neon-purple rounded-full flex items-center justify-center shadow-neon-blue">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-tight">HAFJET</span>
                  </div>
                </div>
              </div>

              {/* Header Title */}
              <div className="hidden lg:block">
                <h1 className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-futuristic-neon-blue via-futuristic-neon-purple to-futuristic-neon-green bg-clip-text text-transparent animate-hologram">
                  🇲🇾 Sistem Perakaunan Cloud Malaysia
                </h1>
                <p className="text-sm text-futuristic-gray-400 mt-1">Futuristic Financial Management System</p>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationCenter />
                
                {/* Status Badges */}
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="bg-gradient-to-r from-futuristic-neon-green/20 to-futuristic-neon-green/40 text-futuristic-neon-green px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-neon border border-futuristic-neon-green/20 animate-glow-pulse">
                    E-Invoice Ready
                  </span>
                  <span className="bg-gradient-to-r from-futuristic-neon-blue/20 to-futuristic-neon-purple/40 text-futuristic-neon-blue px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-futuristic-neon-blue/20">
                    SST Compliant
                  </span>
                </div>

                {/* User Avatar (Mobile) */}
                <div className="lg:hidden">
                  <div className="h-8 w-8 bg-gradient-to-br from-futuristic-neon-green to-futuristic-neon-blue rounded-full flex items-center justify-center text-white font-bold text-sm shadow-neon">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Header Title */}
            <div className="lg:hidden mt-4">
              <h1 className="text-lg font-bold bg-gradient-to-r from-futuristic-neon-blue via-futuristic-neon-purple to-futuristic-neon-green bg-clip-text text-transparent">
                🇲🇾 Cloud Accounting MY
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content with Futuristic Styling */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-futuristic-dark via-futuristic-gray-900 to-futuristic-darker relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, #00D4FF 0%, transparent 70%),
                radial-gradient(circle at 80% 20%, #B537F2 0%, transparent 70%),
                radial-gradient(circle at 40% 80%, #00FF88 0%, transparent 70%)
              `
            }} />
          </div>
          
          {/* Content */}
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="animate-fade-in-up">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}