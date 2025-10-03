import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Plus,
  Download,
  Eye,
  Calendar,
  Building2,
  Users,
  DollarSign,
  Upload,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react'
import einvoiceService from '../services/einvoiceService'
import type { EInvoiceDoc, SubmissionResult } from '../services/einvoiceService'

interface EInvoicePageProps {
  className?: string
}

const EInvoicePage: React.FC<EInvoicePageProps> = ({ className = '' }) => {
  const [einvoices, setEInvoices] = useState<Array<EInvoiceDoc & { submissionResult?: SubmissionResult }>>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoiceDoc | null>(null)
  const [serviceInfo, setServiceInfo] = useState<{
    environment: string
    authenticated: boolean
    taxpayerTin: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'manage' | 'create' | 'validate'>('dashboard')
  const [validationResults, setValidationResults] = useState<{
    valid: boolean
    errors?: string[]
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [serviceData, sampleInvoice] = await Promise.all([
        einvoiceService.getServiceInfo(),
        einvoiceService.getSampleInvoice()
      ])
      
      setServiceInfo(serviceData)
      // For demo, show the sample invoice as submitted
      setEInvoices([{
        ...sampleInvoice,
        submissionResult: {
          uuid: 'DEMO-UUID-123',
          submissionUid: 'SUB-DEMO-123',
          status: 'Valid',
          submissionDateTime: new Date().toISOString()
        }
      }])
    } catch (error) {
      console.error('Failed to load E-Invoice data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEInvoice = async (invoice: EInvoiceDoc) => {
    try {
      setSubmitting(invoice.id)
      const result = await einvoiceService.submitEInvoice(invoice)
      
      // Update the invoice with submission result
      setEInvoices(prev => prev.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, submissionResult: result }
          : inv
      ))
    } catch (error) {
      console.error('Failed to submit E-Invoice:', error)
    } finally {
      setSubmitting(null)
    }
  }

  const handleValidateInvoice = async (invoice: EInvoiceDoc) => {
    try {
      setLoading(true)
      const result = await einvoiceService.validateInvoice(invoice)
      setValidationResults(result)
    } catch (error) {
      console.error('Failed to validate E-Invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'Invalid':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'Submitted':
        return <Send className="w-5 h-5 text-blue-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-100 text-green-800'
      case 'Invalid':
        return 'bg-red-100 text-red-800'
      case 'Submitted':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🇲🇾 LHDN E-Invoice Management
              </h1>
              <p className="text-gray-600">
                Manage Malaysian E-Invoices with LHDN compliance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  {serviceInfo?.environment === 'sandbox' ? 'Sandbox Mode' : 'Production'}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create E-Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/70 backdrop-blur-sm p-1 rounded-xl border border-white/20 shadow-lg">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
              { id: 'manage', label: 'Manage E-Invoices', icon: FileText },
              { id: 'create', label: 'Create New', icon: Plus },
              { id: 'validate', label: 'Validate', icon: CheckCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Total E-Invoices</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{einvoices.length}</div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Valid</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {einvoices.filter(inv => inv.submissionResult?.status === 'Valid').length}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Total Value</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(einvoices.reduce((sum, inv) => sum + inv.totalPayableAmount, 0))}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500">LHDN Status</span>
                </div>
                <div className="text-sm font-medium text-green-600">Connected</div>
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">LHDN Service Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Environment</div>
                  <div className="font-semibold text-gray-800">
                    {serviceInfo?.environment === 'sandbox' ? '🧪 Sandbox' : '🏢 Production'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Taxpayer TIN</div>
                  <div className="font-semibold text-gray-800">{serviceInfo?.taxpayerTin}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Authentication</div>
                  <div className="font-semibold text-green-600">
                    {serviceInfo?.authenticated ? '✅ Connected' : '❌ Disconnected'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent E-Invoices */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent E-Invoices</h3>
              {einvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No E-Invoices created yet</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First E-Invoice
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {einvoices.slice(0, 5).map(invoice => (
                    <div key={invoice.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{invoice.invoiceNumber}</h4>
                            <p className="text-sm text-gray-500">
                              {invoice.buyer.registrationName} • {new Date(invoice.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {formatCurrency(invoice.totalPayableAmount)}
                            </div>
                            {invoice.submissionResult && (
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.submissionResult.status)}`}>
                                {getStatusIcon(invoice.submissionResult.status)}
                                {invoice.submissionResult.status}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setShowViewModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">E-Invoice Management</h3>
              <div className="flex gap-2">
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {einvoices.map(invoice => (
                <div key={invoice.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{invoice.invoiceNumber}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {invoice.supplier.registrationName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {invoice.buyer.registrationName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          {formatCurrency(invoice.totalPayableAmount)}
                        </div>
                        {invoice.submissionResult ? (
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.submissionResult.status)}`}>
                            {getStatusIcon(invoice.submissionResult.status)}
                            {invoice.submissionResult.status}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Not submitted</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!invoice.submissionResult && (
                          <button
                            onClick={() => handleSubmitEInvoice(invoice)}
                            disabled={submitting === invoice.id}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {submitting === invoice.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Submit
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setShowViewModal(true)
                          }}
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Create New E-Invoice</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      const sample = await einvoiceService.getSampleInvoice()
                      setSelectedInvoice(sample)
                      setActiveTab('create')
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-600">Create from Template</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                    <Upload className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-600">Import from File</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-600">Convert Existing Invoice</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Malaysian E-Invoice Requirements</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Valid Malaysian TIN for supplier and buyer</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Complete business registration details</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Proper tax classification (SST/GST/Exempt)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Malaysian Ringgit (MYR) as primary currency</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>LHDN-compliant XML structure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validate Tab */}
        {activeTab === 'validate' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">E-Invoice Validation</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4">Validate E-Invoice</h4>
                  <div className="space-y-3">
                    {einvoices.map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">{invoice.buyer.registrationName}</div>
                        </div>
                        <button
                          onClick={() => handleValidateInvoice(invoice)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Validate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {validationResults && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">Validation Results</h4>
                    <div className={`p-4 rounded-lg ${validationResults.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {validationResults.valid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`font-medium ${validationResults.valid ? 'text-green-800' : 'text-red-800'}`}>
                          {validationResults.valid ? 'Validation Passed' : 'Validation Failed'}
                        </span>
                      </div>
                      {validationResults.errors && validationResults.errors.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-red-700">Errors:</div>
                          {validationResults.errors.map((error: string, index: number) => (
                            <div key={index} className="text-sm text-red-600">• {error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">E-Invoice Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Invoice Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Number:</span> {selectedInvoice.invoiceNumber}</div>
                        <div><span className="font-medium">Date:</span> {new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
                        <div><span className="font-medium">Type:</span> {selectedInvoice.invoiceType}</div>
                        <div><span className="font-medium">Currency:</span> {selectedInvoice.currencyCode}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Supplier</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {selectedInvoice.supplier.registrationName}</div>
                        <div><span className="font-medium">TIN:</span> {selectedInvoice.supplier.tin}</div>
                        <div><span className="font-medium">Address:</span> {selectedInvoice.supplier.address.addressLine1}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Buyer</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {selectedInvoice.buyer.registrationName}</div>
                        <div><span className="font-medium">ID:</span> {selectedInvoice.buyer.idValue}</div>
                        <div><span className="font-medium">Address:</span> {selectedInvoice.buyer.address.addressLine1}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Line Items</h3>
                      <div className="space-y-3">
                        {selectedInvoice.invoiceLineItems.map((item, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-800">{item.productName}</div>
                            <div className="text-sm text-gray-600">
                              {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalIncludingTax)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Totals</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(selectedInvoice.totalExcludingTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{formatCurrency(selectedInvoice.totalTaxAmount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedInvoice.totalPayableAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EInvoicePage