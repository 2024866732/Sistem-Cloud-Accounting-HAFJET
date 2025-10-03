import { useState } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, Zap, Wifi, WifiOff } from 'lucide-react'
import { useNotifications } from '../hooks/useNotificationHook'
import { format } from 'date-fns'

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected, sendTestNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 border-red-500/30 text-red-400'
      case 'high': return 'bg-orange-500/20 border-orange-500/30 text-orange-400'
      case 'medium': return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      case 'low': return 'bg-futuristic-gray-500/20 border-futuristic-gray-500/30 text-futuristic-gray-400'
      default: return 'bg-futuristic-gray-500/20 border-futuristic-gray-500/30 text-futuristic-gray-400'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-400" />
      case 'medium': return <Info className="h-4 w-4 text-blue-400" />
      case 'low': return <CheckCircle className="h-4 w-4 text-futuristic-gray-400" />
      default: return <Info className="h-4 w-4 text-futuristic-gray-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice_payment': return '💰'
      case 'einvoice_approved': return '✅'
      case 'sst_update': return '📋'
      case 'system_alert': return '🚨'
      case 'payment_received': return '💳'
      case 'document_uploaded': return '📄'
      default: return '🔔'
    }
  }

  return (
    <div className="relative">
      {/* Futuristic Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-3 rounded-xl bg-gradient-to-br from-futuristic-gray-800/50 to-futuristic-gray-700/50 
                   border border-futuristic-gray-600/50 hover:border-futuristic-neon-blue/50 
                   transition-all duration-300 hover:scale-110 hover:shadow-neon-blue"
      >
        <Bell className={`h-5 w-5 transition-colors duration-300 ${
          isConnected ? 'text-futuristic-neon-blue group-hover:text-futuristic-neon-cyan' : 'text-futuristic-gray-500'
        }`} />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs 
                          font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse 
                          shadow-neon border border-red-400/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full transition-all duration-300 ${
          isConnected 
            ? 'bg-futuristic-neon-green shadow-neon animate-pulse' 
            : 'bg-red-500 animate-pulse'
        }`} />
      </button>

      {/* Futuristic Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 
                         bg-gradient-to-br from-futuristic-gray-900/95 to-futuristic-dark/95 
                         backdrop-blur-xl border border-futuristic-neon-blue/20 rounded-2xl 
                         shadow-cyber animate-scale-in">
            
            {/* Header */}
            <div className="relative overflow-hidden p-6 border-b border-futuristic-gray-700/50">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-futuristic-neon-blue/10 to-transparent animate-data-flow"></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-futuristic-neon-blue/20 to-futuristic-neon-purple/20 
                                 flex items-center justify-center border border-futuristic-neon-blue/30">
                    <Bell className="h-5 w-5 text-futuristic-neon-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Pusat Notifikasi</h3>
                    <p className="text-xs text-futuristic-gray-400">
                      {filteredNotifications.length} notifikasi
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Connection Status */}
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                    isConnected 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    <span>{isConnected ? 'Live' : 'Offline'}</span>
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-futuristic-gray-800/50 text-futuristic-gray-400 
                              hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="p-4 border-b border-futuristic-gray-700/50">
              <div className="flex space-x-2 bg-futuristic-gray-800/50 p-1 rounded-xl">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-futuristic-neon-blue/20 to-futuristic-neon-purple/20 text-futuristic-neon-blue border border-futuristic-neon-blue/30'
                      : 'text-futuristic-gray-400 hover:text-white hover:bg-futuristic-gray-700/50'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-futuristic-neon-blue/20 to-futuristic-neon-purple/20 text-futuristic-neon-blue border border-futuristic-neon-blue/30'
                      : 'text-futuristic-gray-400 hover:text-white hover:bg-futuristic-gray-700/50'
                  }`}
                >
                  Belum Baca ({unreadCount})
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-2 p-4">
                  {filteredNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`
                        group relative p-4 rounded-xl cursor-pointer transition-all duration-300
                        hover:scale-[1.02] hover:shadow-glow animate-fade-in-up
                        ${notification.read 
                          ? 'bg-futuristic-gray-800/30 border border-futuristic-gray-700/30' 
                          : 'bg-gradient-to-br from-futuristic-neon-blue/10 to-futuristic-neon-purple/10 border border-futuristic-neon-blue/20 shadow-glow'
                        }
                      `}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Notification Content */}
                      <div className="flex space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center text-lg
                            ${getPriorityColor(notification.priority)} border
                          `}>
                            {getTypeIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm group-hover:text-futuristic-neon-blue transition-colors">
                                {notification.title}
                              </h4>
                              <p className="text-futuristic-gray-400 text-xs mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-2">
                              {getPriorityIcon(notification.priority)}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-futuristic-neon-blue rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-futuristic-gray-500">
                              {format(new Date(notification.timestamp), 'dd/MM/yyyy HH:mm')}
                            </span>
                            
                            {/* Priority Badge */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-futuristic-neon-blue/5 to-transparent 
                                     opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-futuristic-gray-800/50 flex items-center justify-center">
                    <Bell className="h-8 w-8 text-futuristic-gray-500" />
                  </div>
                  <p className="text-futuristic-gray-400 font-medium">Tiada notifikasi</p>
                  <p className="text-futuristic-gray-500 text-sm mt-1">
                    {filter === 'unread' ? 'Semua notifikasi telah dibaca' : 'Anda akan menerima notifikasi di sini'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-futuristic-gray-700/50 bg-futuristic-gray-800/30">
              <div className="flex space-x-3">
                <button
                  onClick={markAllAsRead}
                  className="flex-1 btn-cyber text-sm py-2"
                  disabled={unreadCount === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tandai Semua Dibaca
                </button>
                
                <button
                  onClick={sendTestNotification}
                  className="btn-futuristic text-sm py-2 px-4"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Test
                </button>
              </div>
              
              {/* Debug Info (Development Only) */}
              <div className="mt-3 text-xs text-futuristic-gray-500 text-center">
                Status: {isConnected ? '🟢 Tersambung' : '🔴 Terputus'} • 
                Total: {notifications.length} • 
                Belum Baca: {unreadCount}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}