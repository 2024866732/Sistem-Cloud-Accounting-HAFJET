import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState, Suspense } from 'react'
import { createLazyComponent } from './utils/performance'
import Layout from './components/Layout'
import { useAuthStore } from './stores/authStore'
import { NotificationProvider } from './hooks/useNotifications'

// Lazy load all pages for better performance
const Dashboard = createLazyComponent(() => import('./pages/Dashboard'))
const Login = createLazyComponent(() => import('./pages/Login'))
const Register = createLazyComponent(() => import('./pages/Register'))
const Invoices = createLazyComponent(() => import('./pages/Invoices'))
const EInvoice = createLazyComponent(() => import('./pages/EInvoice'))
const Transactions = createLazyComponent(() => import('./pages/Transactions'))
const Reports = createLazyComponent(() => import('./pages/Reports'))
const Settings = createLazyComponent(() => import('./pages/Settings'))
const Inventory = createLazyComponent(() => import('./pages/Inventory'))
const Banking = createLazyComponent(() => import('./pages/Banking'))
const DigitalShoebox = createLazyComponent(() => import('./pages/DigitalShoebox'))
const AdvancedAnalytics = createLazyComponent(() => import('./pages/AdvancedAnalytics'))
const WorkflowAutomation = createLazyComponent(() => import('./pages/WorkflowAutomation'))
const MultiCompanyManagement = createLazyComponent(() => import('./pages/MultiCompanyManagement'))
const UserManagement = createLazyComponent(() => import('./pages/UserManagement'))
const DataManagement = createLazyComponent(() => import('./pages/DataManagement'))
const SecurityDashboard = createLazyComponent(() => import('./pages/SecurityDashboard'))
const TwoFactorAuth = createLazyComponent(() => import('./pages/TwoFactorAuth'))
const IPAccessControl = createLazyComponent(() => import('./pages/IPAccessControl'))
const NotificationCenter = createLazyComponent(() => import('./pages/NotificationCenter'))
const PerformanceMonitoring = createLazyComponent(() => import('./pages/PerformanceMonitoring'))

// Loading component for lazy loaded pages
const PageLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-lg text-gray-600">Loading...</span>
  </div>
)

function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore()
  const [initComplete, setInitComplete] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setInitComplete(true)
      }
    }
    
    init()
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setInitComplete(true)
    }, 3000)
    
    return () => clearTimeout(timeout)
  }, [checkAuth])

  // Show loading during auth check
  if (isLoading || !initComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading HAFJET Cloud Accounting System...</h2>
          <p className="text-white/80">🇲🇾 Initializing Malaysian Cloud Accounting System</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Suspense fallback={<PageLoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
          <Toaster position="top-right" />
        </div>
      </Router>
    )
  }

  return (
    <NotificationProvider>
      <Router>
        <Layout>
          <Suspense fallback={<PageLoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<AdvancedAnalytics />} />
              <Route path="/automation" element={<WorkflowAutomation />} />
              <Route path="/companies" element={<MultiCompanyManagement />} />
              <Route path="/banking" element={<Banking />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<Invoices />} />
              <Route path="/invoices/:id" element={<Invoices />} />
              <Route path="/einvoice" element={<EInvoice />} />
              <Route path="/einvoice/manage" element={<EInvoice />} />
              <Route path="/einvoice/create" element={<EInvoice />} />
              <Route path="/einvoice/validate" element={<EInvoice />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/digital-shoebox" element={<DigitalShoebox />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/data" element={<DataManagement />} />
              <Route path="/security" element={<SecurityDashboard />} />
              <Route path="/security/2fa" element={<TwoFactorAuth />} />
              <Route path="/security/ip-control" element={<IPAccessControl />} />
              <Route path="/performance" element={<PerformanceMonitoring />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/profit-loss" element={<Reports />} />
              <Route path="/reports/balance-sheet" element={<Reports />} />
              <Route path="/reports/cash-flow" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    </NotificationProvider>
  )
}

export default App
