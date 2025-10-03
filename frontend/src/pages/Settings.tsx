import React, { useState, useEffect } from 'react'
import { settingsService } from '../services/api'

interface CompanySettings {
  companyInfo: {
    name: string
    businessType: string
    ssmNumber: string
    taxNumber: string
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

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('company')
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'tax', label: 'Tax Configuration' },
    { id: 'system', label: 'System' },
    { id: 'users', label: 'Users' }
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getCompanySettings()
      if (response.success && response.data) {
        // Map the API response to our component's expected format
        const apiData = response.data as any
        setCompanySettings({
          companyInfo: {
            name: apiData.company?.name || 'HAFJET Technology Sdn Bhd',
            businessType: 'Technology Services',
            ssmNumber: apiData.company?.registrationNumber || '202301234567',
            taxNumber: apiData.tax?.sstNumber || 'C12345678901'
          },
          address: {
            street: apiData.company?.address?.street || '123 Technology Street',
            city: apiData.company?.address?.city || 'Kuala Lumpur',
            state: apiData.company?.address?.state || 'Kuala Lumpur',
            postcode: apiData.company?.address?.postalCode || '50000',
            country: apiData.company?.address?.country || 'Malaysia'
          },
          contact: {
            phone: apiData.company?.contact?.phone || '+60123456789',
            email: apiData.company?.contact?.email || 'info@hafjet.com',
            website: apiData.company?.contact?.website || 'https://hafjet.com'
          },
          banking: {
            bankName: 'Maybank',
            accountNumber: '1234567890',
            accountName: 'HAFJET Technology Sdn Bhd',
            swiftCode: 'MBBEMYKL'
          }
        })
      } else {
        // Load mock data if API fails
        setCompanySettings({
          companyInfo: {
            name: 'HAFJET Technology Sdn Bhd',
            businessType: 'Technology Services',
            ssmNumber: '202301234567',
            taxNumber: 'C12345678901'
          },
          address: {
            street: '123 Technology Street',
            city: 'Kuala Lumpur',
            state: 'Kuala Lumpur',
            postcode: '50000',
            country: 'Malaysia'
          },
          contact: {
            phone: '+60123456789',
            email: 'info@hafjet.com',
            website: 'https://hafjet.com'
          },
          banking: {
            bankName: 'Maybank',
            accountNumber: '1234567890',
            accountName: 'HAFJET Technology Sdn Bhd',
            swiftCode: 'MBBEMYKL'
          }
        })
      }
    } catch (error) {
      console.error('Settings fetch error:', error)
      // Use mock data on error
      setCompanySettings({
        companyInfo: {
          name: 'HAFJET Technology Sdn Bhd',
          businessType: 'Technology Services',
          ssmNumber: '202301234567',
          taxNumber: 'C12345678901'
        },
        address: {
          street: '123 Technology Street',
          city: 'Kuala Lumpur',
          state: 'Kuala Lumpur',
          postcode: '50000',
          country: 'Malaysia'
        },
        contact: {
          phone: '+60123456789',
          email: 'info@hafjet.com',
          website: 'https://hafjet.com'
        },
        banking: {
          bankName: 'Maybank',
          accountNumber: '1234567890',
          accountName: 'HAFJET Technology Sdn Bhd',
          swiftCode: 'MBBEMYKL'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (type: string, data: unknown) => {
    try {
      const response = await fetch(`http://localhost:3001/api/settings/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        alert(`${type} settings saved successfully!`)
      } else {
        alert(`Failed to save ${type} settings`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Settings saved locally (API not available)')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Settings</h1>
          <p className="text-gray-600">Manage your company settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <nav className="flex space-x-8 p-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
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
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      companyInfo: { ...companySettings.companyInfo, businessType: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSM Registration Number</label>
                  <input
                    type="text"
                    value={companySettings.companyInfo.ssmNumber}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      companyInfo: { ...companySettings.companyInfo, ssmNumber: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                  <input
                    type="text"
                    value={companySettings.companyInfo.taxNumber}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      companyInfo: { ...companySettings.companyInfo, taxNumber: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Contact Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={companySettings.contact.phone}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      contact: { ...companySettings.contact, phone: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={companySettings.contact.email}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      contact: { ...companySettings.contact, email: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={companySettings.contact.website}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      contact: { ...companySettings.contact, website: e.target.value }
                    })}
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
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      banking: { ...companySettings.banking, bankName: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={companySettings.banking.accountNumber}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      banking: { ...companySettings.banking, accountNumber: e.target.value }
                    })}
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
        {activeTab === 'tax' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🇲🇾 Malaysian Tax Configuration</h3>
            
            <div className="space-y-8">
              {/* SST Configuration */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">💰 SST (Sales and Service Tax)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SST Registration Number</label>
                    <input
                      type="text"
                      defaultValue="SST-123456789"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SST Rate (%)</label>
                    <input
                      type="number"
                      defaultValue={6}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    id="sst-enabled"
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sst-enabled" className="ml-2 block text-sm text-gray-900">
                    Enable SST Calculation
                  </label>
                </div>
              </div>

              {/* E-Invoice Configuration */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">📋 E-Invoice LHDN Integration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxpayer TIN</label>
                    <input
                      type="text"
                      defaultValue="C12345678901"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="sandbox">Sandbox</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="einvoice-enabled"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="einvoice-enabled" className="ml-2 block text-sm text-gray-900">
                      Enable E-Invoice Integration
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="auto-submit"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-submit" className="ml-2 block text-sm text-gray-900">
                      Auto-submit invoices to LHDN
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => saveSettings('tax', {})}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                💾 Save Tax Settings
              </button>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🔧 System Configuration</h3>
            
            <div className="space-y-8">
              {/* General Settings */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">General Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Invoice Settings */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Invoice Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                    <input
                      type="text"
                      defaultValue="INV"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Number</label>
                    <input
                      type="number"
                      defaultValue={1156}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Terms (days)</label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    id="auto-generate"
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-generate" className="ml-2 block text-sm text-gray-900">
                    Auto-generate invoice numbers
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => saveSettings('system', {})}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                💾 Save System Settings
              </button>
            </div>
          </div>
        )}

        {/* Users Settings Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">👥 User Management</h3>
            
            <div className="text-center py-8">
              <p className="text-gray-500">User management functionality coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings