import { useState, useEffect } from 'react'
import { receiptsService } from '../services/receiptsService'
import type { Receipt } from '../services/receiptsService'

interface UploadedDocument {
  id: string
  filename: string
  fileType: 'receipt' | 'bill' | 'invoice' | 'expense'
  uploadDate: string
  status: 'processing' | 'ready' | 'failed'
  extractedData?: {
    merchantName?: string
    amount?: number
    date?: string
    items?: Array<{
      description: string
      quantity: number
      price: number
    }>
    taxAmount?: number
    taxRate?: number
    category?: string
  }
  thumbnailUrl?: string
  originalUrl?: string
}

export default function DigitalShoebox() {
  const [activeTab, setActiveTab] = useState<'ready' | 'processing' | 'failed' | 'settings'>('ready')
  // Legacy mock documents removed; using API receipts exclusively
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null)
  const [apiReceipts, setApiReceipts] = useState<Receipt[]>([])
  const [loadingReceipts, setLoadingReceipts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New state for actual receipt under review
  const [reviewReceipt, setReviewReceipt] = useState<Receipt | null>(null)

  // Settings state
  const [settings, setSettings] = useState({
    whatsappNumber: '+60179759600',
    emailAddress: 'hafjetmalaysia@gmail.com',
    autoProcess: true,
    splitPDF: true,
    notificationEmail: '',
    defaultCategory: 'general'
  })

  useEffect(() => {
    const load = async () => {
      setLoadingReceipts(true)
      try {
        const list = await receiptsService.list()
        setApiReceipts(list)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load receipts'
        setError(msg)
      } finally {
        setLoadingReceipts(false)
      }
    }
    load()
  }, [])

  const refresh = async () => {
    try {
      const list = await receiptsService.list()
      setApiReceipts(list)
  } catch { /* ignore */ }
  }

  const mapStatus = (r: Receipt): UploadedDocument['status'] => {
    switch (r.status) {
      case 'uploaded': return 'processing'
      case 'ocr_processed': return 'processing'
      case 'classified': return 'processing'
      case 'review_pending': return 'ready'
      case 'approved': return 'ready'
      case 'posted': return 'ready'
      case 'error': return 'failed'
      default: return 'processing'
    }
  }

  // Merge API receipts into documents display (preserve mock only if no API data yet)
  const combinedDocuments: UploadedDocument[] = apiReceipts.map(r => ({
    id: r._id,
    filename: r.originalFilename,
    fileType: 'receipt',
    uploadDate: new Date(r.createdAt).toLocaleString(),
    status: mapStatus(r),
    extractedData: r.grossAmount ? {
      merchantName: r.vendorName,
      amount: r.grossAmount,
      date: r.documentDate ? new Date(r.documentDate).toISOString().split('T')[0] : undefined,
      taxAmount: r.taxAmount,
      taxRate: r.taxAmount && r.grossAmount ? +( (r.taxAmount / r.grossAmount) * 100 ).toFixed(2) : undefined,
      category: r.category
    } : undefined
  }))

  const handleApiUpload = async (files: FileList) => {
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        await receiptsService.upload(files[i])
      }
      await refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      alert(msg)
    } finally {
      setUploading(false)
    }
  }

  // Replace handleFileUpload to prefer API
  const handleFileUpload = handleApiUpload

  const beginReview = (doc: UploadedDocument) => {
    const r = apiReceipts.find(r => r._id === doc.id)
    if (r) setReviewReceipt(r)
    else setSelectedDocument(doc) // fallback to mock
  }

  const triggerOCR = async (id: string) => {
    try { await receiptsService.ocr(id); await refresh() } catch (e) { alert(e instanceof Error ? e.message : 'OCR failed') }
  }
  const triggerClassify = async (id: string) => {
    try { await receiptsService.classify(id); await refresh() } catch (e) { alert(e instanceof Error ? e.message : 'Classification failed') }
  }
  const approveReceipt = async (id: string, overrides?: Partial<Receipt>) => {
    try { await receiptsService.approve(id, overrides); await refresh(); setReviewReceipt(null) } catch (e) { alert(e instanceof Error ? e.message : 'Approval failed') }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const filteredDocuments = activeTab === 'settings' ? [] : combinedDocuments.filter(doc => doc.status === activeTab)

  return (
    <div className="space-y-6">
      {loadingReceipts && <div className="text-sm text-gray-500">Loading receipts...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📁 Digital Shoebox</h1>
          <p className="text-gray-600">Upload receipts, bills & invoices for automatic data entry</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">🇲🇾 Malaysian Format Support</p>
          <p className="text-sm text-gray-500">SST, GST & Tax Detection</p>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-6xl">📤</div>
          <h3 className="text-lg font-semibold text-gray-900">Upload Files Here</h3>
          <p className="text-gray-600">
            Click or drop files here to upload. You may upload multiple files in JPG / PNG / PDF format.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <label className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              📁 Choose Files
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </label>
            
            <div className="text-sm text-gray-500">
              <p>Split PDF Files: {settings.splitPDF ? 'ON' : 'OFF'}</p>
            </div>
          </div>

          {/* Upload Methods */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Upload */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">📱 Send Files via WhatsApp</h4>
                <p className="text-green-700 text-sm mb-2">{settings.whatsappNumber} 📱</p>
                <p className="text-xs text-green-600">
                  You must register your mobile number in Shoebox Settings first before sending in your files.
                </p>
              </div>

              {/* Email Upload */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">📧 Send Files via Email</h4>
                <p className="text-blue-700 text-sm mb-2">{settings.emailAddress} 📎</p>
                <p className="text-xs text-blue-600">
                  Employee's dedicated email address for claim submissions can be found in Shoebox Settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {uploading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
            <span className="text-yellow-800">Processing uploaded files...</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'ready', label: '✅ Ready', count: combinedDocuments.filter(d => d.status === 'ready').length },
            { key: 'processing', label: '⏳ Processing', count: combinedDocuments.filter(d => d.status === 'processing').length },
            { key: 'failed', label: '❌ Failed', count: combinedDocuments.filter(d => d.status === 'failed').length },
            { key: 'settings', label: '⚙️ Shoebox Settings', count: null }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'ready' | 'processing' | 'failed' | 'settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Document List / Settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        {activeTab === 'settings' ? (
          /* Shoebox Settings */
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">⚙️ Shoebox Settings</h2>
              <p className="text-gray-600">Configure your Digital Shoebox upload methods and preferences.</p>
            </div>

            <div className="space-y-6">
              {/* WhatsApp Settings */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">📱 WhatsApp Upload Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Registered Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+60-12-345-6789"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      Only this registered number can send files via WhatsApp
                    </p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-md">
                    <h4 className="font-medium text-green-800 mb-2">How to use WhatsApp Upload:</h4>
                    <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
                      <li>Save this number in your contacts: <strong>{settings.whatsappNumber}</strong></li>
                      <li>Send your receipt/invoice images to this number</li>
                      <li>Files will automatically appear in your Digital Shoebox</li>
                      <li>Our AI will extract the data for you</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">📧 Email Upload Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Dedicated Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.emailAddress}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailAddress: e.target.value }))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your-email@company.com"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Employees can send receipts to this email address
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Notification Email
                    </label>
                    <input
                      type="email"
                      value={settings.notificationEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@company.com"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Get notified when new documents are uploaded
                    </p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">How to use Email Upload:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                      <li>Send emails with attachments to: <strong>{settings.emailAddress}</strong></li>
                      <li>Subject line can include expense category</li>
                      <li>Attach receipt images or PDF documents</li>
                      <li>System will process them automatically</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Processing Settings */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Processing Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-process uploads</label>
                      <p className="text-xs text-gray-500">Automatically extract data from uploaded documents</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoProcess}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoProcess: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Split PDF files</label>
                      <p className="text-xs text-gray-500">Automatically split multi-page PDFs into individual receipts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.splitPDF}
                      onChange={(e) => setSettings(prev => ({ ...prev, splitPDF: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Category
                    </label>
                    <select
                      value={settings.defaultCategory}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultCategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General Expenses</option>
                      <option value="travel">Travel & Transport</option>
                      <option value="meals">Meals & Entertainment</option>
                      <option value="office">Office Supplies</option>
                      <option value="utilities">Utilities</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    // Save settings logic here
                    alert('Settings saved successfully!');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  💾 Save Settings
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Document List */
          <>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'ready' && 'Hurray! Nothing is left.'}
                  {activeTab === 'processing' && 'No files processing'}
                  {activeTab === 'failed' && 'No failed uploads'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'ready' && 'All your documents have been processed and recorded.'}
                  {activeTab === 'processing' && 'Upload some files to see them being processed here.'}
                  {activeTab === 'failed' && 'All uploads completed successfully.'}
                </p>
              </div>
            ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {doc.status === 'processing' ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      ) : (
                        <span className="text-2xl">
                          {doc.fileType === 'receipt' && '🧾'}
                          {doc.fileType === 'bill' && '📄'}
                          {doc.fileType === 'invoice' && '📊'}
                          {doc.fileType === 'expense' && '💸'}
                        </span>
                      )}
                    </div>

                    {/* Document Info */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{doc.filename}</h4>
                      <p className="text-sm text-gray-500">
                        {doc.fileType.charAt(0).toUpperCase() + doc.fileType.slice(1)} • {doc.uploadDate}
                      </p>
                      
                      {doc.extractedData && (
                        <div className="mt-2 text-sm">
                          <span className="text-green-600 font-medium">
                            {doc.extractedData.merchantName}
                          </span>
                          <span className="text-gray-500 mx-2">•</span>
                          <span className="text-blue-600 font-medium">
                            RM {doc.extractedData.amount?.toFixed(2)}
                          </span>
                          {doc.extractedData.taxAmount && (
                            <>
                              <span className="text-gray-500 mx-2">•</span>
                              <span className="text-orange-600 text-xs">
                                SST: RM {doc.extractedData.taxAmount.toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {doc.status === 'processing' && (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => triggerOCR(doc.id)} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">OCR</button>
                        <button onClick={() => triggerClassify(doc.id)} className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">Classify</button>
                      </div>
                    )}
                    {doc.status === 'ready' && (
                      <button
                        onClick={() => beginReview(doc)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                      >
                        👁️ Review
                      </button>
                    )}
                    {doc.status === 'failed' && (
                      <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">🔄 Retry</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </div>

      {/* Review Modal */}
      {(selectedDocument || reviewReceipt) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Review Document</h3>
                <button
                  onClick={() => {
                    setSelectedDocument(null)
                    setReviewReceipt(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Preview */}
                <div>
                  <h4 className="font-medium mb-3">Document Preview</h4>
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <span className="text-6xl">📄</span>
                    <p className="text-gray-600 mt-2">{selectedDocument?.filename || reviewReceipt?.originalFilename}</p>
                  </div>
                </div>

                {/* Extracted Data */}
                <div>
                  <h4 className="font-medium mb-3">Extracted Information</h4>
                  {(selectedDocument?.extractedData || reviewReceipt) && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Name</label>
                        <input
                          type="text"
                          value={selectedDocument?.extractedData?.merchantName || reviewReceipt?.vendorName || ''}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          readOnly
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RM)</label>
                          <input
                            type="number"
                            value={selectedDocument?.extractedData?.amount || reviewReceipt?.grossAmount || 0}
                            step="0.01"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={selectedDocument?.extractedData?.date || (reviewReceipt?.documentDate ? new Date(reviewReceipt.documentDate).toISOString().split('T')[0] : '')}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount (RM)</label>
                          <input
                            type="number"
                            value={selectedDocument?.extractedData?.taxAmount || reviewReceipt?.taxAmount || 0}
                            step="0.01"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                          <select className="w-full border border-gray-300 rounded px-3 py-2" disabled>
                            <option value="6">6% (SST)</option>
                            <option value="0">0% (Exempt)</option>
                            <option value="10">10% (Service Tax)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2" disabled defaultValue={selectedDocument?.extractedData?.category || reviewReceipt?.category}>
                          <option value="Meals & Entertainment">Meals & Entertainment</option>
                          <option value="Office Expenses">Office Expenses</option>
                          <option value="Travel">Travel</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Professional Services">Professional Services</option>
                        </select>
                      </div>

                      {/* Items */}
                      {/* (Optional) Line items removed for API receipts placeholder */}

                      {/* Action Buttons */}
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={() => approveReceipt(reviewReceipt!._id, { /* overrides if needed */ })}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          ✅ Approve & Record Transaction
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocument(null)
                            setReviewReceipt(null)
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}