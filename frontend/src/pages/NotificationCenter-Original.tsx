import React, { useState, useEffect } from 'react'
import { 
  Bell, X, Check, AlertTriangle, Info, Mail, 
  Smartphone, Settings, Filter, Archive, Star,
  Clock, User, Building, Receipt, DollarSign,
  FileText, Calendar, Send, Eye, MoreHorizontal
} from 'lucide-react'

interface Notification {
  id: string
  type: 'invoice' | 'payment' | 'expense' | 'system' | 'reminder' | 'approval'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  timestamp: Date
  read: boolean
  starred: boolean
  actionUrl?: string
  actionText?: string
  metadata?: {
    amount?: number
    customerName?: string
    invoiceNumber?: string
    dueDate?: Date
  }
}

interface NotificationPreferences {
  email: {
    invoiceOverdue: boolean
    paymentReceived: boolean
    lowStock: boolean
    systemUpdates: boolean
    weeklyReports: boolean
  }
  inApp: {
    realTimeUpdates: boolean
    soundNotifications: boolean
    desktopNotifications: boolean
  }
  sms: {
    urgentOnly: boolean
    paymentReminders: boolean
    systemAlerts: boolean
  }
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'starred' | 'settings'>('all')
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'payment' | 'system'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'invoice',
          priority: 'high',
          title: 'Invoice Overdue',
          message: 'Invoice INV-2025-001 from ACME Corp is 5 days overdue',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          starred: true,
          actionUrl: '/invoices/INV-2025-001',
          actionText: 'View Invoice',
          metadata: {
            amount: 15500.00,
            customerName: 'ACME Corporation',
            invoiceNumber: 'INV-2025-001',
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        },
        {
          id: '2',
          type: 'payment',
          priority: 'medium',
          title: 'Payment Received',
          message: 'Payment of RM 8,750.00 received from Tech Solutions Sdn Bhd',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          read: false,
          starred: false,
          actionUrl: '/transactions',
          actionText: 'View Transaction',
          metadata: {
            amount: 8750.00,
            customerName: 'Tech Solutions Sdn Bhd'
          }
        },
        {
          id: '3',
          type: 'system',
          priority: 'urgent',
          title: 'E-Invoice Submission Failed',
          message: 'Failed to submit 3 invoices to LHDN MyInvois system',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          read: false,
          starred: false,
          actionUrl: '/reports/einvoice-compliance',
          actionText: 'Check Status'
        },
        {
          id: '4',
          type: 'reminder',
          priority: 'medium',
          title: 'SST Return Due',
          message: 'SST return for October 2025 is due in 3 days',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          read: true,
          starred: false,
          actionUrl: '/reports/sst-report',
          actionText: 'Prepare Return'
        },
        {
          id: '5',
          type: 'expense',
          priority: 'low',
          title: 'New Expense Categorized',
          message: 'AI automatically categorized office supplies expense',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          read: true,
          starred: false,
          actionUrl: '/transactions',
          actionText: 'Review'
        }
      ]
      
      setNotifications(mockNotifications)
      
      setPreferences({
        email: {
          invoiceOverdue: true,
          paymentReceived: true,
          lowStock: false,
          systemUpdates: true,
          weeklyReports: true
        },
        inApp: {
          realTimeUpdates: true,
          soundNotifications: true,
          desktopNotifications: false
        },
        sms: {
          urgentOnly: true,
          paymentReminders: false,
          systemAlerts: true
        }
      })
      
      setLoading(false)
    }

    fetchNotifications()
  }, [])

  const formatMYR = (amount: number) => {
    return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return Receipt
      case 'payment': return DollarSign
      case 'expense': return FileText
      case 'system': return Settings
      case 'reminder': return Calendar
      case 'approval': return Check
      default: return Bell
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const toggleStar = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, starred: !notif.starred } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread' && notif.read) return false
    if (activeTab === 'starred' && !notif.starred) return false
    if (filterType !== 'all' && notif.type !== filterType) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📧 Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(preferences?.email || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                <p className="text-white/60 text-sm">Get notified via email for these events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={value}
                  onChange={(e) => setPreferences(prev => prev ? {
                    ...prev,
                    email: { ...prev.email, [key]: e.target.checked }
                  } : null)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📱 In-App Notifications</h3>
        <div className="space-y-4">
          {Object.entries(preferences?.inApp || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                <p className="text-white/60 text-sm">Control in-app notification behavior</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={value}
                  onChange={(e) => setPreferences(prev => prev ? {
                    ...prev,
                    inApp: { ...prev.inApp, [key]: e.target.checked }
                  } : null)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📱 SMS Notifications</h3>
        <div className="space-y-4">
          {Object.entries(preferences?.sms || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                <p className="text-white/60 text-sm">SMS notifications for urgent matters</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={value}
                  onChange={(e) => setPreferences(prev => prev ? {
                    ...prev,
                    sms: { ...prev.sms, [key]: e.target.checked }
                  } : null)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderNotificationList = () => (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => {
        const TypeIcon = getTypeIcon(notification.type)
        return (
          <div 
            key={notification.id}
            className={`bg-white/20 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
              notification.read ? 'border-white/20' : 'border-blue-500/50 bg-blue-500/5'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`p-3 rounded-xl ${getPriorityColor(notification.priority)}`}>
                  <TypeIcon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-white font-semibold">{notification.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.priority.toUpperCase()}
                    </span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <p className="text-white/80 mb-3">{notification.message}</p>
                  
                  {notification.metadata && (
                    <div className="bg-white/10 rounded-xl p-3 mb-3 space-y-1">
                      {notification.metadata.amount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Amount:</span>
                          <span className="text-green-400 font-semibold">{formatMYR(notification.metadata.amount)}</span>
                        </div>
                      )}
                      {notification.metadata.customerName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Customer:</span>
                          <span className="text-white">{notification.metadata.customerName}</span>
                        </div>
                      )}
                      {notification.metadata.invoiceNumber && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Invoice:</span>
                          <span className="text-white">{notification.metadata.invoiceNumber}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white/60 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeAgo(notification.timestamp)}</span>
                    </div>
                    
                    {notification.actionUrl && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                        {notification.actionText || 'View'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => toggleStar(notification.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    notification.starred 
                      ? 'text-yellow-400 bg-yellow-500/20' 
                      : 'text-white/60 hover:text-yellow-400 hover:bg-yellow-500/10'
                  }`}
                >
                  <Star className="h-4 w-4" fill={notification.starred ? 'currentColor' : 'none'} />
                </button>
                
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 rounded-xl text-white/60 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
      
      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/80 mb-2">No notifications</h3>
          <p className="text-white/60">You're all caught up! No notifications to show.</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔔 Notification Center
          </h1>
          <p className="text-white/80 text-lg">
            Stay updated with real-time notifications and manage your preferences
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Tabs */}
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'All', count: notifications.length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'starred', label: 'Starred', count: notifications.filter(n => n.starred).length },
                { id: 'settings', label: 'Settings', count: 0 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white/30 text-white font-semibold'
                      : 'text-white/70 hover:bg-white/20'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            {activeTab !== 'settings' && (
              <div className="flex space-x-3">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-gray-800">All Types</option>
                  <option value="invoice" className="bg-gray-800">Invoices</option>
                  <option value="payment" className="bg-gray-800">Payments</option>
                  <option value="system" className="bg-gray-800">System</option>
                </select>
                
                <button
                  onClick={markAllAsRead}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  <Check className="inline h-4 w-4 mr-2" />
                  Mark All Read
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full"></div>
            </div>
          ) : activeTab === 'settings' ? (
            renderNotificationSettings()
          ) : (
            renderNotificationList()
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-center">
          <p className="text-white/60 text-sm">
            🔔 Real-time notifications enabled | 
            📧 Email notifications configured | 
            🔒 All notifications encrypted and secure
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter