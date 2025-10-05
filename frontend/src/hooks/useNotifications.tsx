import { createContext, useEffect, useState, type ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export interface Notification {
  id: string
  type:
    | 'invoice_payment'
    | 'einvoice_approved'
    | 'sst_update'
    | 'system_alert'
    | 'payment_received'
    | 'document_uploaded'
    | 'receipt_uploaded'
    | 'receipt_ocr_processed'
    | 'receipt_classified'
    | 'receipt_ready_review'
    | 'receipt_approved'
  title: string
  message: string
  data?: unknown
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  companyId: string
  userId?: string
  read?: boolean
}

interface NotificationContextType {
  socket: Socket | null
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  sendTestNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export { NotificationContext }

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { token, user } = useAuthStore()

  const unreadCount = notifications.filter(n => !n.read).length

  // Initialize socket connection
  useEffect(() => {
    // Do not initialize socket in test mode or when notifications are disabled via env
    const disableNotifications = (import.meta.env.VITE_DISABLE_NOTIFICATIONS || 'false') === 'true' || import.meta.env.MODE === 'test' || (typeof process !== 'undefined' && process.env.NODE_ENV === 'test');
    if (disableNotifications) {
      console.log('🔕 Notifications disabled by environment, skipping socket initialization')
      return
    }

    if (token && user) {
      console.log('🔌 Connecting to notification service...')
      
      // Try to connect to the notification server
      const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      console.log('🌐 Connecting to:', serverUrl)
      
      const newSocket = io(serverUrl, {
        auth: {
          token: token,
          userId: user.id,
          userEmail: user.email
        },
        // Prefer websocket first to avoid CORS/polling transport XHR issues in some dev setups
        transports: ['websocket', 'polling'],
        // Ensure cookies/credentials are sent if server requires them for CORS
        withCredentials: true,
        timeout: 20000,
        retries: 3,
        autoConnect: true,
        forceNew: false
      })

      newSocket.on('connect', () => {
        console.log('✅ Connected to notification service')
        setIsConnected(true)
        toast.success('Real-time notifications connected')
        
        // Send test notification to verify connection
        setTimeout(() => {
          newSocket.emit('test_notification')
        }, 1000)
      })

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from notification service:', reason)
        setIsConnected(false)
        
        // Only show error for unexpected disconnects
        if (reason !== 'io client disconnect') {
          toast.error('Real-time notifications disconnected')
        }
        
        // Auto-reconnect if server disconnected
        if (reason === 'io server disconnect') {
          setTimeout(() => {
            console.log('🔄 Attempting to reconnect...')
            newSocket.connect()
          }, 2000)
        }
      })

      newSocket.on('connect_error', (error) => {
        // Surface error details for easier debugging (CORS, auth, network)
        console.error('🔴 Connection error (socket.io):', error, '\n', {
          message: (error as any)?.message,
          stack: (error as any)?.stack,
          transportError: (error as any)?.transport
        })
        setIsConnected(false)

        // If websocket transport failed due to environment/CORS, fall back to polling
        const msg = (error && error.message) ? String(error.message).toLowerCase() : ''
        if (msg.includes('websocket') || msg.includes('transport') || msg.includes('xhr') || msg.includes('poll')) {
          console.log('🔄 WebSocket/polling issue detected, falling back to polling transport and retrying...')
          try {
            newSocket.io.opts.transports = ['polling']
            setTimeout(() => {
              newSocket.connect()
            }, 1000)
          } catch (e) {
            console.error('Failed to switch transport:', e)
            toast.error(`Failed to connect to notification service: ${(error as any)?.message || (e as any)?.message}`)
          }
        } else {
          toast.error(`Failed to connect to notification service: ${error?.message || 'Unknown error'}`)
        }
      })

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
        setIsConnected(true)
        toast.success('Notifications reconnected')
      })

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection failed:', error.message)
      })

      // Listen for incoming notifications
      newSocket.on('notification', (notification: Notification) => {
        console.log('🔔 New notification:', notification)
        
        setNotifications(prev => [notification, ...prev])
        
        // Show toast notification based on priority
        const toastOptions = {
          duration: notification.priority === 'urgent' ? 8000 : 
                   notification.priority === 'high' ? 6000 : 4000,
          icon: getNotificationIcon(notification.type)
        }

        if (notification.priority === 'urgent') {
          toast.error(`${notification.title}: ${notification.message}`, toastOptions)
        } else if (notification.priority === 'high') {
          toast.success(`${notification.title}: ${notification.message}`, toastOptions)
        } else {
          toast(`${notification.title}: ${notification.message}`, toastOptions)
        }

        // Play notification sound for important notifications
        if (notification.priority === 'urgent' || notification.priority === 'high') {
          playNotificationSound()
        }
      })

      // Listen for system notifications
      newSocket.on('system_notification', (notification: Notification) => {
        console.log('🚨 System notification:', notification)
        
        setNotifications(prev => [notification, ...prev])
        toast.error(`System Alert: ${notification.message}`, {
          duration: 10000,
          icon: '🚨'
        })
        playNotificationSound()
      })

      // Load initial notifications
      newSocket.on('notifications_loaded', (data: { notifications: Notification[], unreadCount: number }) => {
        console.log('📬 Loaded notifications:', data)
        setNotifications(data.notifications || [])
      })

      setSocket(newSocket)

      return () => {
        console.log('🔌 Cleaning up socket connection')
        newSocket.disconnect()
      }
    }
  }, [token, user])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )

    if (socket) {
      socket.emit('mark_notification_read', id)
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )

    notifications.forEach(notification => {
      if (socket && !notification.read) {
        socket.emit('mark_notification_read', notification.id)
      }
    })
  }

  const sendTestNotification = () => {
    if (socket && isConnected) {
      // Send test via socket
      socket.emit('test_notification')
      toast.success('Test notification sent via Socket.IO!')
    } else {
      // Fallback: send via API
      fetch('http://localhost:3001/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || '1',
          message: 'Test notification from frontend!'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success('Test notification sent via API!')
        } else {
          toast.error('Failed to send test notification')
        }
      })
      .catch(err => {
        console.error('Failed to send test notification:', err)
        toast.error('Failed to send test notification')
      })
    }
  }

  return (
    <NotificationContext.Provider value={{
      socket,
      notifications,
      unreadCount,
      isConnected,
      markAsRead,
      markAllAsRead,
      sendTestNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'invoice_payment':
      return '💰'
    case 'einvoice_approved':
      return '✅'
    case 'sst_update':
      return '📋'
    case 'system_alert':
      return '🚨'
    case 'payment_received':
      return '💳'
    case 'document_uploaded':
      return '📄'
    case 'receipt_uploaded':
      return '🧾'
    case 'receipt_ocr_processed':
      return '🔍'
    case 'receipt_classified':
      return '🤖'
    case 'receipt_ready_review':
      return '📝'
    case 'receipt_approved':
      return '✅'
    default:
      return '🔔'
  }
}

function playNotificationSound() {
  try {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.log('Could not play notification sound:', error)
  }
}

export default NotificationProvider