import { useContext } from 'react'
import { NotificationContext } from './useNotifications'

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    // In test environments, provide a no-op fallback so components can be
    // rendered in isolation without requiring the NotificationProvider.
    if (process.env.NODE_ENV === 'test') {
      return {
        socket: null,
        notifications: [],
        unreadCount: 0,
        isConnected: false,
        markAsRead: () => {},
        markAllAsRead: () => {},
        sendTestNotification: () => {},
      }
    }
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}