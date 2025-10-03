import { useState, useEffect, useCallback } from 'react'

interface CompanySettings {
  companyInfo: {
    name: string
    registrationNumber: string
    ssmNumber: string
    taxNumber: string
    businessType: string
    incorporationDate: string
    paidUpCapital: number
  }
  address: {
    street: string
    city: string
    state: string
    postcode: string
    country: string
  }
  contact: {
    phone: string
    fax: string
    email: string
    website: string
  }
  banking: {
    bankName: string
    accountNumber: string
    accountName: string
    swiftCode: string
  }
}

interface TaxSettings {
  sst: {
    enabled: boolean
    registrationNumber: string
    rate: number
    returnPeriod: string
    nextReturnDue: string
  }
  einvoice: {
    enabled: boolean
    environment: string
    taxpayerTin: string
    autoSubmit: boolean
  }
}

interface SystemSettings {
  general: {
    companyName: string
    timezone: string
    dateFormat: string
    language: string
    currency: string
  }
  invoice: {
    prefix: string
    currentNumber: number
    autoGenerate: boolean
    defaultPaymentTerms: number
  }
  security: {
    sessionTimeout: number
    twoFactorAuth: boolean
    auditLog: boolean
  }
}

type TabType = 'company' | 'tax' | 'system' | 'users'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('company')
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null)

  const loadMockData = useCallback(() => {
    setCompanySettings({
      companyInfo: {
        name: 'HAFJET Technology Sdn Bhd',
        registrationNumber: '202301234567',
        ssmNumber: '201234567890',
        taxNumber: 'C12345678901',
        businessType: 'Information Technology',
        incorporationDate: '2023-01-15',
        paidUpCapital: 100000.00
      },
      address: {
        street: '123, Jalan Teknologi 5/9',
        city: 'Cyberjaya',
        state: 'Selangor',
        postcode: '63000',
        country: 'Malaysia'
      },
      contact: {
        phone: '+603-8312-5678',
        fax: '+603-8312-5679',
        email: 'admin@hafjet.com.my',
        website: 'https://hafjet.com.my'
      },
      banking: {
        bankName: 'Maybank Islamic Berhad',
        accountNumber: '5141-2345-6789',
        accountName: 'HAFJET Technology Sdn Bhd',
        swiftCode: 'MBBEMYKL'
      }
    })

    setTaxSettings({
      sst: {
        enabled: true,
        registrationNumber: 'SST-12345678',
        rate: 6.0,
        returnPeriod: 'bi-monthly',
        nextReturnDue: '2024-11-30'
      },
      einvoice: {
        enabled: true,
        environment: 'sandbox',
        taxpayerTin: '890123456789',
        autoSubmit: true
      }
    })

    setSystemSettings({
      general: {
        companyName: 'HAFJET Technology Sdn Bhd',
        timezone: 'Asia/Kuala_Lumpur',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
        currency: 'MYR'
      },
      invoice: {
        prefix: 'INV',
        currentNumber: 1156,
        autoGenerate: true,
        defaultPaymentTerms: 30
      },
      security: {
        sessionTimeout: 60,
        twoFactorAuth: false,
        auditLog: true
      }
    })
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      
      // Try to fetch from backend first
      try {
        const companyRes = await fetch('http://localhost:3001/api/settings/company')
        if (companyRes.ok) {
          const companyData = await companyRes.json()
          setCompanySettings(companyData.data)
        }
        
        const taxRes = await fetch('http://localhost:3001/api/settings/tax')
        if (taxRes.ok) {
          const taxData = await taxRes.json()
          setTaxSettings(taxData.data)
        }
        
        const systemRes = await fetch('http://localhost:3001/api/settings/system')
        if (systemRes.ok) {
          const systemData = await systemRes.json()
          setSystemSettings(systemData.data)
        }
      } catch {
        console.log('Backend not available, using mock data')
        loadMockData()
      }
      
    } catch (error) {
      console.error('Settings fetch error:', error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }, [loadMockData])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const saveSettings = async (type: string, data: CompanySettings | TaxSettings | SystemSettings) => {
    try {
      const response = await fetch(`http://localhost:3001/api/settings/${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Save settings error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your Malaysian accounting system</p>
        </div>
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">✅ Settings saved successfully!</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'company', label: '🏢 Company' },
            { key: 'tax', label: '💰 Tax Configuration' },
            { key: 'system', label: '⚙️ System' },
            { key: 'users', label: '👥 Users' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Company Settings Tab */}
      {activeTab === 'company' && companySettings && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Info */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companySettings.companyInfo.name}
                  onChange={(e) => setCompanySettings({
                    ...companySettings,
                    companyInfo: { ...companySettings.companyInfo, name: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <input
                  type="text"
                  value={companySettings.companyInfo.businessType}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SSM Registration Number</label>
                <input
                  type="text"
                  value={companySettings.companyInfo.ssmNumber}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                <input
                  type="text"
                  value={companySettings.companyInfo.taxNumber}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Address & Contact */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Address & Contact</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={companySettings.address.street}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={companySettings.address.city}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Selangor">Selangor</option>
                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                    <option value="Johor">Johor</option>
                    <option value="Penang">Penang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={companySettings.contact.phone}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={companySettings.contact.email}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Banking Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Banking Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={companySettings.banking.bankName}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={companySettings.banking.accountNumber}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => saveSettings('company', companySettings)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              💾 Save Company Settings
            </button>
          </div>
        </div>
      )}

      {/* Tax Settings Tab */}
      {activeTab === 'tax' && taxSettings && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">🇲🇾 Malaysian Tax Configuration</h3>
          
          <div className="space-y-8">
            {/* SST Configuration */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">💰 SST (Sales & Service Tax)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SST Registration Number</label>
                  <input
                    type="text"
                    value={taxSettings.sst.registrationNumber}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SST Rate (%)</label>
                  <input
                    type="number"
                    value={taxSettings.sst.rate}
                    step="0.1"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Period</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="bi-monthly">Bi-Monthly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Return Due</label>
                  <input
                    type="date"
                    value={taxSettings.sst.nextReturnDue}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={taxSettings.sst.enabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable SST Collection</span>
                </label>
              </div>
            </div>

            {/* E-Invoice Configuration */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">📋 LHDN E-Invoice</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taxpayer TIN</label>
                  <input
                    type="text"
                    value={taxSettings.einvoice.taxpayerTin}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={taxSettings.einvoice.enabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable E-Invoice Submission</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={taxSettings.einvoice.autoSubmit}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto Submit to LHDN</span>
                </label>
              </div>
              
              <div className="mt-4">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  🔌 Test LHDN Connection
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => saveSettings('tax', taxSettings)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              💾 Save Tax Settings
            </button>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && systemSettings && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Configuration</h3>
          
          <div className="space-y-8">
            {/* General Settings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">General Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Malaysian)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="MYR">MYR (Malaysian Ringgit)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="SGD">SGD (Singapore Dollar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="en">English</option>
                    <option value="ms">Bahasa Malaysia</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</option>
                    <option value="Asia/Singapore">Asia/Singapore</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Invoice Settings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Invoice Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={systemSettings.invoice.prefix}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Invoice Number</label>
                  <input
                    type="number"
                    value={systemSettings.invoice.currentNumber}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Terms (days)</label>
                  <input
                    type="number"
                    value={systemSettings.invoice.defaultPaymentTerms}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemSettings.invoice.autoGenerate}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-generate invoice numbers</span>
                </label>
              </div>
            </div>

            {/* Security Settings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Security Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={systemSettings.security.sessionTimeout}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemSettings.security.twoFactorAuth}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Two-Factor Authentication</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemSettings.security.auditLog}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Audit Logging</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => saveSettings('system', systemSettings)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              💾 Save System Settings
            </button>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              ➕ Add New User
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">System Administrator</div>
                      <div className="text-sm text-gray-500">admin@hafjet.com.my</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Administrator
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Oct 2, 2024 08:30
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Senior Accountant</div>
                      <div className="text-sm text-gray-500">accounts@hafjet.com.my</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Accountant
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Oct 2, 2024 09:15
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}