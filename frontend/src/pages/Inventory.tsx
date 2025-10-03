import { useState } from 'react'
import { formatMYR } from '../utils'

interface InventoryItem {
  id: string
  code: string
  name: string
  description: string
  category: string
  unit: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unitCost: number
  sellingPrice: number
  sstRate: number
  gstRate?: number
  location: string
  supplier: string
  lastPurchaseDate: string
  lastSaleDate: string
  totalValue: number
  status: 'active' | 'inactive' | 'discontinued'
  stockMovements: StockMovement[]
}

interface StockMovement {
  id: string
  date: string
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer'
  quantity: number
  unitPrice: number
  totalAmount: number
  reference: string
  notes: string
}

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'reports' | 'adjustments'>('items')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all')

  // Mock inventory data
  const [inventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      code: 'LAPTOP-001',
      name: 'Dell Laptop Inspiron 15',
      description: 'Laptop Dell Inspiron 15 3000 Series dengan Intel Core i5',
      category: 'Electronics',
      unit: 'Unit',
      currentStock: 25,
      minimumStock: 10,
      maximumStock: 50,
      unitCost: 2500.00,
      sellingPrice: 3200.00,
      sstRate: 6,
      location: 'Warehouse A - Shelf 01',
      supplier: 'Dell Malaysia Sdn Bhd',
      lastPurchaseDate: '2024-09-15',
      lastSaleDate: '2024-10-01',
      totalValue: 62500.00,
      status: 'active',
      stockMovements: []
    },
    {
      id: '2',
      code: 'CHAIR-002',
      name: 'Kerusi Pejabat Ergonomik',
      description: 'Kerusi pejabat dengan sokongan lumbar dan armrest boleh laras',
      category: 'Furniture',
      unit: 'Unit',
      currentStock: 8,
      minimumStock: 15,
      maximumStock: 30,
      unitCost: 450.00,
      sellingPrice: 650.00,
      sstRate: 6,
      location: 'Warehouse B - Section 2',
      supplier: 'Malaysian Office Furniture Sdn Bhd',
      lastPurchaseDate: '2024-08-20',
      lastSaleDate: '2024-09-28',
      totalValue: 3600.00,
      status: 'active',
      stockMovements: []
    },
    {
      id: '3',
      code: 'PRINTER-003',
      name: 'Canon Printer PIXMA G3020',
      description: 'Printer inkjet multifungsi dengan tangki dakwat boleh isi semula',
      category: 'Electronics',
      unit: 'Unit',
      currentStock: 0,
      minimumStock: 5,
      maximumStock: 20,
      unitCost: 680.00,
      sellingPrice: 850.00,
      sstRate: 6,
      location: 'Warehouse A - Shelf 03',
      supplier: 'Canon Marketing Malaysia Sdn Bhd',
      lastPurchaseDate: '2024-07-10',
      lastSaleDate: '2024-09-30',
      totalValue: 0,
      status: 'active',
      stockMovements: []
    },
    {
      id: '4',
      code: 'DESK-004',
      name: 'Meja Pejabat L-Shape',
      description: 'Meja pejabat bentuk L dengan laci dan kabinet',
      category: 'Furniture',
      unit: 'Unit',
      currentStock: 12,
      minimumStock: 8,
      maximumStock: 25,
      unitCost: 890.00,
      sellingPrice: 1250.00,
      sstRate: 6,
      location: 'Warehouse B - Section 1',
      supplier: 'KL Office Solutions Sdn Bhd',
      lastPurchaseDate: '2024-09-05',
      lastSaleDate: '2024-09-25',
      totalValue: 10680.00,
      status: 'active',
      stockMovements: []
    }
  ])

  const filteredItems = inventoryItems.filter(item => {
    switch (filter) {
      case 'low-stock':
        return item.currentStock <= item.minimumStock && item.currentStock > 0
      case 'out-of-stock':
        return item.currentStock === 0
      default:
        return true
    }
  })

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'bg-red-100 text-red-800'
    if (item.currentStock <= item.minimumStock) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStockStatusText = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'Habis Stok'
    if (item.currentStock <= item.minimumStock) return 'Stok Rendah'
    return 'Stok Normal'
  }

  // Statistics
  const totalItems = inventoryItems.length
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minimumStock && item.currentStock > 0).length
  const outOfStockItems = inventoryItems.filter(item => item.currentStock === 0).length
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0)
  const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.currentStock, 0)

  const renderInventoryItems = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Senarai Inventori ({filteredItems.length})
          </h3>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'low-stock' | 'out-of-stock')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Item</option>
              <option value="low-stock">Stok Rendah</option>
              <option value="out-of-stock">Habis Stok</option>
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Tambah Item
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kod/Nama Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok Semasa
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga Kos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga Jual
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nilai Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Stok
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.code}</div>
                    <div className="text-sm text-gray-500">{item.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.category}</div>
                  <div className="text-sm text-gray-500">{item.unit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{item.currentStock}</div>
                  <div className="text-sm text-gray-500">Min: {item.minimumStock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">{formatMYR(item.unitCost)}</div>
                  <div className="text-sm text-gray-500">+SST {item.sstRate}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{formatMYR(item.sellingPrice)}</div>
                  <div className="text-sm text-gray-500">
                    Margin: {(((item.sellingPrice - item.unitCost) / item.unitCost) * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{formatMYR(item.totalValue)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item)}`}>
                    {getStockStatusText(item)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Lihat
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Edit
                    </button>
                    <button className="text-purple-600 hover:text-purple-900">
                      Laras
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderStockMovements = () => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Pergerakan Stok</h3>
        <p className="text-gray-600">
          Sistem tracking pergerakan stok dengan audit trail lengkap<br/>
          akan available soon.
        </p>
      </div>
    </div>
  )

  const renderInventoryReports = () => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">📈 Laporan Inventori</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Laporan Penilaian Stok</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Kaedah Penilaian:</span>
              <span className="font-medium">FIFO (First In, First Out)</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Item:</span>
              <span className="font-medium">{totalItems} jenis</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Kuantiti:</span>
              <span className="font-medium">{totalQuantity} unit</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Nilai Total:</span>
              <span className="font-bold text-blue-600">{formatMYR(totalValue)}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Analisis Stok</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Item Aktif:</span>
              <span className="font-medium text-green-600">{inventoryItems.filter(i => i.status === 'active').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Stok Rendah:</span>
              <span className="font-medium text-yellow-600">{lowStockItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Habis Stok:</span>
              <span className="font-medium text-red-600">{outOfStockItems}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Purata Margin:</span>
              <span className="font-bold text-green-600">
                {(inventoryItems.reduce((sum, item) => 
                  sum + ((item.sellingPrice - item.unitCost) / item.unitCost) * 100, 0
                ) / inventoryItems.length).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-3">Laporan mengikut Kategori</h4>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Kategori</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Bilangan Item</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Jumlah Kuantiti</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Nilai (RM)</th>
              </tr>
            </thead>
            <tbody>
              {['Electronics', 'Furniture'].map(category => {
                const categoryItems = inventoryItems.filter(item => item.category === category)
                const categoryQuantity = categoryItems.reduce((sum, item) => sum + item.currentStock, 0)
                const categoryValue = categoryItems.reduce((sum, item) => sum + item.totalValue, 0)
                
                return (
                  <tr key={category} className="border-b">
                    <td className="px-4 py-2">{category}</td>
                    <td className="px-4 py-2 text-right">{categoryItems.length}</td>
                    <td className="px-4 py-2 text-right">{categoryQuantity}</td>
                    <td className="px-4 py-2 text-right">{formatMYR(categoryValue)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-3xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">📦 Inventori Malaysia</h1>
            <p className="text-orange-100">Pengurusan stok dan inventori dengan pematuhan SST Malaysia</p>
          </div>
          <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300">
            📊 Export Laporan
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Jumlah Item</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Jenis produk aktif</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Nilai Inventori</p>
              <p className="text-2xl font-bold text-green-600">{formatMYR(totalValue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Menggunakan kaedah FIFO</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stok Rendah</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Item perlu pesanan semula</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Habis Stok</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <span className="text-2xl">🚫</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Item tidak tersedia</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'items' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            📦 Senarai Item
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'movements' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Pergerakan Stok
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'reports' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            📈 Laporan
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'adjustments' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⚖️ Pelarasan Stok
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' && renderInventoryItems()}
      {activeTab === 'movements' && renderStockMovements()}
      {activeTab === 'reports' && renderInventoryReports()}
      
      {activeTab === 'adjustments' && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Pelarasan Stok</h3>
            <p className="text-gray-600">
              Sistem pelarasan stok dengan audit trail dan kelulusan<br/>
              akan available soon.
            </p>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detail Item: {selectedItem.code}
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Maklumat Asas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kod:</span>
                      <span className="font-medium">{selectedItem.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium">{selectedItem.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kategori:</span>
                      <span className="font-medium">{selectedItem.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium">{selectedItem.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lokasi:</span>
                      <span className="font-medium">{selectedItem.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pembekal:</span>
                      <span className="font-medium">{selectedItem.supplier}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Maklumat Stok</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stok Semasa:</span>
                      <span className="font-medium text-blue-600">{selectedItem.currentStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stok Minimum:</span>
                      <span className="font-medium">{selectedItem.minimumStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stok Maximum:</span>
                      <span className="font-medium">{selectedItem.maximumStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga Kos:</span>
                      <span className="font-medium">{formatMYR(selectedItem.unitCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga Jual:</span>
                      <span className="font-medium">{formatMYR(selectedItem.sellingPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kadar SST:</span>
                      <span className="font-medium">{selectedItem.sstRate}%</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-semibold">Nilai Total:</span>
                      <span className="font-bold text-green-600">{formatMYR(selectedItem.totalValue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Penerangan</h4>
                <p className="text-gray-600">{selectedItem.description}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Pembelian Terakhir</h4>
                  <p className="text-sm text-gray-600">{new Date(selectedItem.lastPurchaseDate).toLocaleDateString('ms-MY')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Jualan Terakhir</h4>
                  <p className="text-sm text-gray-600">{new Date(selectedItem.lastSaleDate).toLocaleDateString('ms-MY')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Tambah Item Baru</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Form Tambah Item</h4>
                <p className="text-gray-600">
                  Form untuk tambah item inventori baru dengan SST configuration,<br/>
                  stock levels, dan supplier details akan available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Malaysian Inventory Notice */}
      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
        <div className="flex items-start">
          <div className="text-2xl mr-4">🇲🇾</div>
          <div>
            <h4 className="font-semibold text-orange-800 mb-2">Pematuhan Inventori Malaysia</h4>
            <p className="text-orange-700 text-sm">
              Sistem inventori ini mematuhi keperluan Malaysia:
            </p>
            <ul className="text-orange-700 text-sm mt-2 ml-4 list-disc">
              <li>SST 6% tracking untuk setiap item</li>
              <li>FIFO (First In, First Out) valuation method</li>
              <li>Malaysian Ringgit (RM) pricing</li>
              <li>Audit trail untuk semua stock movements</li>
              <li>Low stock alerts dan reorder points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}