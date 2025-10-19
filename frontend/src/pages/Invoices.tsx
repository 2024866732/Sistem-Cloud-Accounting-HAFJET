import { useState } from 'react'
import { formatMYR } from '../utils'
import LHDNEInvoiceManager from '../components/LHDNEInvoiceManager'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  sstRate: number
  amount: number
  sstAmount: number
  totalAmount: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  customerName: string
  customerEmail: string
  customerAddress: string
  items: InvoiceItem[]
  subtotal: number
  totalSST: number
  grandTotal: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  einvoiceStatus: 'pending' | 'submitted' | 'approved' | 'rejected'
}

export default function Invoices() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Mock invoice data
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      date: '2024-10-01',
      dueDate: '2024-10-31',
      customerName: 'Syarikat ABC Sdn Bhd',
      customerEmail: 'finance@abc.com.my',
      customerAddress: 'No. 123, Jalan Bukit Bintang, 50200 Kuala Lumpur',
      items: [
        {
          id: '1',
          description: 'Perkhidmatan Konsultasi IT',
          quantity: 10,
          unitPrice: 500,
          sstRate: 6,
          amount: 5000,
          sstAmount: 300,
          totalAmount: 5300
        }
      ],
      subtotal: 5000,
      totalSST: 300,
      grandTotal: 5300,
      status: 'sent',
      einvoiceStatus: 'approved'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      date: '2024-10-02',
      dueDate: '2024-11-01',
      customerName: 'Perniagaan XYZ',
      customerEmail: 'accounts@xyz.my',
      customerAddress: 'Lot 456, Jalan Raja Laut, 53000 Kuala Lumpur',
      items: [
        {
          id: '1',
          description: 'Sistem Pengurusan Stok',
          quantity: 1,
          unitPrice: 12000,
          sstRate: 6,
          amount: 12000,
          sstAmount: 720,
          totalAmount: 12720
        }
      ],
      subtotal: 12000,
      totalSST: 720,
      grandTotal: 12720,
      status: 'paid',
      einvoiceStatus: 'approved'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'submitted': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">🧾 Invois Malaysia</h1>
            <p className="text-green-100 text-sm sm:text-base">Sistem pengurusan invois dengan pematuhan SST dan E-Invoice LHDN</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto bg-white text-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
          >
            + Cipta Invois Baru
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Jumlah Invois</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <span className="text-2xl">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Jumlah Nilai</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMYR(invoices.reduce((sum, inv) => sum + inv.grandTotal, 0))}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <span className="text-2xl">�</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Jumlah SST</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMYR(invoices.reduce((sum, inv) => sum + inv.totalSST, 0))}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <span className="text-2xl">🧮</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">E-Invoice LHDN</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.einvoiceStatus === 'approved').length}/
                {invoices.length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Senarai Invois</h3>
        </div>
        
        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Invois
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarikh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.customerName}</div>
                    <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString('ms-MY')}</div>
                    <div className="text-sm text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString('ms-MY')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatMYR(invoice.grandTotal)}</div>
                    <div className="text-sm text-gray-500">SST: {formatMYR(invoice.totalSST)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEInvoiceStatusColor(invoice.einvoiceStatus)}`}>
                      {invoice.einvoiceStatus.charAt(0).toUpperCase() + invoice.einvoiceStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Lihat
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        PDF
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        E-Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Shown only on mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-600 mt-1">{invoice.customerName}</div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Tarikh</div>
                    <div className="text-gray-900">{new Date(invoice.date).toLocaleDateString('ms-MY')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Due Date</div>
                    <div className="text-gray-900">{new Date(invoice.dueDate).toLocaleDateString('ms-MY')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Jumlah</div>
                    <div className="text-gray-900 font-semibold">{formatMYR(invoice.grandTotal)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">E-Invoice</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEInvoiceStatusColor(invoice.einvoiceStatus)}`}>
                      {invoice.einvoiceStatus.charAt(0).toUpperCase() + invoice.einvoiceStatus.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedInvoice(invoice)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Lihat
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    PDF
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    E-Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Invois {selectedInvoice.invoiceNumber}
                </h3>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Invoice Header */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-600 mb-2">🇲🇾 HAFJET Cloud Accounting System</h2>
                    <p className="text-gray-600">Sistem Kewangan Malaysia</p>
                    <p className="text-sm text-gray-500 mt-2">
                      No. 789, Jalan Teknologi<br/>
                      Cyberjaya, 63000 Selangor<br/>
                      Tel: +60 3-8000 0000
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-900">INVOIS</h3>
                    <p className="text-lg font-semibold text-blue-600">{selectedInvoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Tarikh: {new Date(selectedInvoice.date).toLocaleDateString('ms-MY')}<br/>
                      Tarikh Akhir: {new Date(selectedInvoice.dueDate).toLocaleDateString('ms-MY')}
                    </p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Kepada:</h4>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedInvoice.customerAddress}</p>
                  <p className="text-sm text-gray-600">{selectedInvoice.customerEmail}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-6">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Penerangan</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-900 border-b">Kuantiti</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-900 border-b">Harga Unit</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-900 border-b">Jumlah</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-900 border-b">SST (6%)</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-900 border-b">Jumlah Keseluruhan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-b">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 border-b">{formatMYR(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 border-b">{formatMYR(item.amount)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 border-b">{formatMYR(item.sstAmount)}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 border-b">{formatMYR(item.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatMYR(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">SST (6%):</span>
                    <span className="font-medium">{formatMYR(selectedInvoice.totalSST)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-lg font-bold">
                    <span>Jumlah Keseluruhan:</span>
                    <span className="text-blue-600">{formatMYR(selectedInvoice.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* E-Invoice Status */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 text-lg mr-2">✅</span>
                  <div>
                    <p className="font-medium text-green-800">Status E-Invoice LHDN</p>
                    <p className="text-sm text-green-600">
                      {selectedInvoice.einvoiceStatus === 'approved' 
                        ? 'Diluluskan oleh LHDN - Sah untuk kegunaan rasmi'
                        : 'Menunggu kelulusan LHDN'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* LHDN E-Invoice Management */}
              <div className="mt-6">
                <LHDNEInvoiceManager 
                  invoiceId={selectedInvoice.id}
                  onSuccess={(message) => {
                    console.log('LHDN Success:', message);
                    // You could show a toast notification here
                  }}
                  onError={(error) => {
                    console.error('LHDN Error:', error);
                    // You could show an error notification here
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Cipta Invois Baru</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚧</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Form Cipta Invois</h4>
                <p className="text-gray-600">
                  Form untuk cipta invois baru dengan automatic SST calculation<br/>
                  dan E-Invoice submission ke LHDN akan available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}