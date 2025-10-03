import React, { useState, useEffect } from 'react'
import { 
  Download, Upload, FileText, FileSpreadsheet, Database,
  Settings, RefreshCw, AlertCircle, Archive
} from 'lucide-react'

interface ExportTemplate {
  id: string
  name: string
  description: string
  type: 'excel' | 'csv' | 'pdf' | 'json'
  category: 'transactions' | 'reports' | 'invoices' | 'customers' | 'all'
  size: string
  lastUsed?: Date
  downloadCount: number
}

interface ImportJob {
  id: string
  filename: string
  type: 'excel' | 'csv' | 'json'
  status: 'processing' | 'completed' | 'failed' | 'pending'
  progress: number
  recordsProcessed: number
  totalRecords: number
  errors: string[]
  createdAt: Date
  completedAt?: Date
}

interface BackupJob {
  id: string
  name: string
  type: 'full' | 'partial' | 'incremental'
  status: 'running' | 'completed' | 'failed' | 'scheduled'
  size: string
  createdAt: Date
  downloadUrl?: string
  expiresAt?: Date
}

const DataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup' | 'templates'>('export')
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>([])
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock export templates
      setExportTemplates([
        {
          id: '1',
          name: 'Complete Financial Report',
          description: 'Comprehensive financial data including P&L, balance sheet, and cash flow',
          type: 'excel',
          category: 'reports',
          size: '2.5 MB',
          lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          downloadCount: 45
        },
        {
          id: '2',
          name: 'Monthly Transactions',
          description: 'All transaction records for specified month with categories',
          type: 'csv',
          category: 'transactions',
          size: '1.2 MB',
          lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          downloadCount: 28
        },
        {
          id: '3',
          name: 'Invoice Register',
          description: 'Complete invoice listing with payment status and amounts',
          type: 'excel',
          category: 'invoices',
          size: '3.1 MB',
          lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          downloadCount: 67
        },
        {
          id: '4',
          name: 'Customer Directory',
          description: 'Customer contact information and payment history',
          type: 'csv',
          category: 'customers',
          size: '0.8 MB',
          lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          downloadCount: 23
        },
        {
          id: '5',
          name: 'SST Compliance Report',
          description: 'Malaysian SST report with tax calculations and summaries',
          type: 'pdf',
          category: 'reports',
          size: '1.5 MB',
          lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          downloadCount: 89
        }
      ])

      // Mock import jobs
      setImportJobs([
        {
          id: '1',
          filename: 'transactions_january_2025.xlsx',
          type: 'excel',
          status: 'completed',
          progress: 100,
          recordsProcessed: 1247,
          totalRecords: 1247,
          errors: [],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
        },
        {
          id: '2',
          filename: 'customers_import.csv',
          type: 'csv',
          status: 'processing',
          progress: 67,
          recordsProcessed: 334,
          totalRecords: 500,
          errors: ['Row 45: Invalid email format', 'Row 123: Missing required field'],
          createdAt: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: '3',
          filename: 'invoice_data_backup.json',
          type: 'json',
          status: 'failed',
          progress: 23,
          recordsProcessed: 115,
          totalRecords: 500,
          errors: ['Invalid JSON format at line 45', 'Missing required field: invoice_number'],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ])

      // Mock backup jobs
      setBackupJobs([
        {
          id: '1',
          name: 'Full System Backup - January 2025',
          type: 'full',
          status: 'completed',
          size: '245 MB',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          downloadUrl: '/api/backups/download/1',
          expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Weekly Incremental Backup',
          type: 'incremental',
          status: 'running',
          size: '45 MB',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '3',
          name: 'Transaction Data Backup',
          type: 'partial',
          status: 'scheduled',
          size: '89 MB',
          createdAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
        }
      ])

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleExport = async () => {
    if (!selectedTemplate) {
      alert('Please select a template to export')
      return
    }

    // Simulate export process
    const template = exportTemplates.find(t => t.id === selectedTemplate)
    if (template) {
      // Update download count
      setExportTemplates(prev => prev.map(t => 
        t.id === selectedTemplate 
          ? { ...t, downloadCount: t.downloadCount + 1, lastUsed: new Date() }
          : t
      ))
      
      // Simulate file download
      alert(`Exporting ${template.name} as ${exportFormat.toUpperCase()}...`)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newJob: ImportJob = {
        id: Date.now().toString(),
        filename: file.name,
        type: file.name.endsWith('.xlsx') ? 'excel' : file.name.endsWith('.csv') ? 'csv' : 'json',
        status: 'processing',
        progress: 0,
        recordsProcessed: 0,
        totalRecords: Math.floor(Math.random() * 1000) + 100,
        errors: [],
        createdAt: new Date()
      }
      
      setImportJobs(prev => [newJob, ...prev])
      
      // Simulate processing
      const interval = setInterval(() => {
        setImportJobs(prev => prev.map(job => {
          if (job.id === newJob.id && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 15, 100)
            const newRecordsProcessed = Math.floor((newProgress / 100) * job.totalRecords)
            
            if (newProgress >= 100) {
              clearInterval(interval)
              return {
                ...job,
                progress: 100,
                recordsProcessed: job.totalRecords,
                status: Math.random() > 0.2 ? 'completed' : 'failed',
                completedAt: new Date(),
                errors: Math.random() > 0.2 ? [] : ['Sample error: Invalid data format']
              }
            }
            
            return {
              ...job,
              progress: newProgress,
              recordsProcessed: newRecordsProcessed
            }
          }
          return job
        }))
      }, 1000)
    }
  }

  const startBackup = (type: 'full' | 'partial' | 'incremental') => {
    const newBackup: BackupJob = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Backup - ${new Date().toLocaleDateString()}`,
      type,
      status: 'running',
      size: '0 MB',
      createdAt: new Date()
    }
    
    setBackupJobs(prev => [newBackup, ...prev])
    
    // Simulate backup process
    setTimeout(() => {
      setBackupJobs(prev => prev.map(backup =>
        backup.id === newBackup.id
          ? {
              ...backup,
              status: 'completed',
              size: `${Math.floor(Math.random() * 200) + 50} MB`,
              downloadUrl: `/api/backups/download/${backup.id}`,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          : backup
      ))
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10'
      case 'processing': 
      case 'running': return 'text-blue-400 bg-blue-500/10'
      case 'failed': return 'text-red-400 bg-red-500/10'
      case 'pending':
      case 'scheduled': return 'text-yellow-400 bg-yellow-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'excel': return <FileSpreadsheet className="h-5 w-5 text-green-400" />
      case 'csv': return <FileText className="h-5 w-5 text-blue-400" />
      case 'pdf': return <FileText className="h-5 w-5 text-red-400" />
      case 'json': return <Database className="h-5 w-5 text-purple-400" />
      default: return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const renderExportTools = () => (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📤 Data Export Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Export Template</label>
            <select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="bg-gray-800">Select template...</option>
              {exportTemplates.map(template => (
                <option key={template.id} value={template.id} className="bg-gray-800">
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Export Format</label>
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv' | 'pdf')}
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="excel" className="bg-gray-800">Excel (.xlsx)</option>
              <option value="csv" className="bg-gray-800">CSV (.csv)</option>
              <option value="pdf" className="bg-gray-800">PDF (.pdf)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleExport}
          disabled={!selectedTemplate}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="inline h-5 w-5 mr-2" />
          Export Data
        </button>
      </div>

      {/* Export Templates */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📋 Available Export Templates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exportTemplates.map((template) => (
            <div 
              key={template.id} 
              className={`bg-white/10 rounded-xl p-4 border transition-all duration-300 cursor-pointer hover:shadow-lg ${
                selectedTemplate === template.id 
                  ? 'border-blue-400 bg-blue-500/20' 
                  : 'border-white/20 hover:border-white/40'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-start justify-between mb-3">
                {getTypeIcon(template.type)}
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  template.category === 'reports' ? 'bg-purple-500/20 text-purple-400' :
                  template.category === 'transactions' ? 'bg-green-500/20 text-green-400' :
                  template.category === 'invoices' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {template.category}
                </span>
              </div>
              
              <h4 className="text-white font-semibold mb-2">{template.name}</h4>
              <p className="text-white/70 text-sm mb-3">{template.description}</p>
              
              <div className="flex justify-between text-sm text-white/60">
                <span>Size: {template.size}</span>
                <span>Downloads: {template.downloadCount}</span>
              </div>
              
              {template.lastUsed && (
                <div className="mt-2 text-xs text-white/50">
                  Last used: {template.lastUsed.toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderImportTools = () => (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📥 Data Import</h3>
        
        <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center">
          <Upload className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h4 className="text-white font-semibold mb-2">Drop files here or click to browse</h4>
          <p className="text-white/60 mb-4">Supports Excel (.xlsx), CSV (.csv), and JSON (.json) files</p>
          
          <input
            type="file"
            accept=".xlsx,.csv,.json"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 cursor-pointer inline-block"
          >
            Choose Files
          </label>
        </div>
      </div>

      {/* Import Jobs */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📋 Import Progress</h3>
        
        <div className="space-y-4">
          {importJobs.map((job) => (
            <div key={job.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(job.type)}
                  <div>
                    <h4 className="text-white font-semibold">{job.filename}</h4>
                    <p className="text-white/60 text-sm">
                      {job.recordsProcessed} / {job.totalRecords} records processed
                    </p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-white/70 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(job.progress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Errors */}
              {job.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 font-medium">Errors Found</span>
                  </div>
                  <ul className="text-red-300 text-sm space-y-1">
                    {job.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {job.errors.length > 3 && (
                      <li>• +{job.errors.length - 3} more errors...</li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-between text-xs text-white/50 mt-3">
                <span>Started: {job.createdAt.toLocaleString()}</span>
                {job.completedAt && (
                  <span>Completed: {job.completedAt.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBackupTools = () => (
    <div className="space-y-6">
      {/* Backup Actions */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">💾 Create Backup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 text-center">
            <Database className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Full Backup</h4>
            <p className="text-white/70 text-sm mb-4">Complete system backup including all data and settings</p>
            <button
              onClick={() => startBackup('full')}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Start Full Backup
            </button>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 text-center">
            <Archive className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Partial Backup</h4>
            <p className="text-white/70 text-sm mb-4">Backup specific data categories or date ranges</p>
            <button
              onClick={() => startBackup('partial')}
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Start Partial Backup
            </button>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 text-center">
            <RefreshCw className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Incremental Backup</h4>
            <p className="text-white/70 text-sm mb-4">Backup only changes since last backup</p>
            <button
              onClick={() => startBackup('incremental')}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Start Incremental
            </button>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📋 Backup History</h3>
        
        <div className="space-y-4">
          {backupJobs.map((backup) => (
            <div key={backup.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    backup.type === 'full' ? 'bg-blue-500/20' :
                    backup.type === 'partial' ? 'bg-green-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {backup.type === 'full' ? <Database className="h-5 w-5 text-blue-400" /> :
                     backup.type === 'partial' ? <Archive className="h-5 w-5 text-green-400" /> :
                     <RefreshCw className="h-5 w-5 text-purple-400" />}
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold">{backup.name}</h4>
                    <p className="text-white/60 text-sm">
                      {backup.type.charAt(0).toUpperCase() + backup.type.slice(1)} • {backup.size}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                    {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                  </span>
                  
                  {backup.downloadUrl && backup.status === 'completed' && (
                    <button className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-white/50">
                <span>Created: {backup.createdAt.toLocaleString()}</span>
                {backup.expiresAt && (
                  <span>Expires: {backup.expiresAt.toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Data Management Tools
          </h1>
          <p className="text-white/80 text-lg">
            💾 Comprehensive data export, import, and backup solutions
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'export', label: 'Export Data', icon: Download },
              { id: 'import', label: 'Import Data', icon: Upload },
              { id: 'backup', label: 'Backup & Restore', icon: Archive },
              { id: 'templates', label: 'Templates', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'export' | 'import' | 'backup' | 'templates')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white/30 text-white font-semibold shadow-lg'
                      : 'text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full"></div>
            </div>
          ) : (
            <>
              {activeTab === 'export' && renderExportTools()}
              {activeTab === 'import' && renderImportTools()}
              {activeTab === 'backup' && renderBackupTools()}
              {activeTab === 'templates' && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-center">
                  <Settings className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white/80 mb-2">Template Management</h3>
                  <p className="text-white/60">Custom export templates and configurations coming soon.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-center">
          <p className="text-white/60 text-sm">
            📤 {exportTemplates.reduce((sum, t) => sum + t.downloadCount, 0)} total exports | 
            📥 {importJobs.filter(j => j.status === 'completed').length} successful imports | 
            💾 {backupJobs.filter(b => b.status === 'completed').length} backups available
          </p>
        </div>
      </div>
    </div>
  )
}

export default DataManagement