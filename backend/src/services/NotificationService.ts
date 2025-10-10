import { Server as SocketIOServer } from 'socket.io';
import NotificationModel, { Notification as PersistedNotification, INotification } from '../models/Notification.js';
import { notificationDeliveryCounter } from '../middleware/metrics.js';
import client from '../middleware/metrics.js';

interface Notification {
  id: string;
  /**
   * Extendable notification type union.
   * Added receipt_* lifecycle events to support Digital Shoebox real-time workflow.
   */
  type: 'invoice_payment'
    | 'einvoice_approved'
    | 'sst_update'
    | 'system_alert'
    | 'payment_received'
    | 'document_uploaded'
    | 'receipt_uploaded'
    | 'receipt_ocr_processed'
    | 'receipt_classified'
    | 'receipt_ready_review'
    | 'receipt_approved';
  title: string;
  message: string;
  data?: unknown;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  companyId: string;
  userId?: string;
  read?: boolean;
}

// Notification Service for real-time updates
export class NotificationService {
  private static io: SocketIOServer | null = null;

  static setSocketIO(io: SocketIOServer) {
    this.io = io;
  }

  // Legacy method for backward compatibility
  // Overload-like flexible signature to tolerate legacy 3-arg calls
  static async sendNotification(
    userId: string,
    messageOrNotification: string | Omit<Notification, 'id' | 'timestamp' | 'read'>,
    type?: string
  ): Promise<Notification> {
    let notification: Omit<Notification, 'id' | 'timestamp' | 'read'>;

    // Handle legacy string message format
    if (typeof messageOrNotification === 'string') {
      notification = {
        type: 'system_alert',
        title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
        message: messageOrNotification,
        priority: type === 'error' ? 'high' : 'medium',
        companyId: 'default'
      };
    } else {
      notification = messageOrNotification;
    }

    console.log(`Sending ${notification.type} notification to user ${userId}: ${notification.message}`);
    
    const fullNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    // Persist
    try {
      await NotificationModel.create({
        companyId: notification.companyId,
        userId: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        read: false
      });
      notificationDeliveryCounter.inc({ status: 'persisted' }, 1);
    } catch (err) {
      console.warn('Failed to persist notification:', err);
      notificationDeliveryCounter.inc({ status: 'persist_error' }, 1);
    }

    // Send via Socket.IO if available; measure latency using a histogram
    if (this.io) {
      const start = Date.now();
      try {
        this.io.to(`user_${userId}`).emit('notification', fullNotification);
        const latencyMs = Date.now() - start;
        // Use a histogram if available, fallback to counter labels
        try {
          const h = client.register.getSingleMetric('notification_delivery_latency_ms') as client.Histogram | undefined;
          if (h) {
            h.observe(latencyMs);
          } else {
            // create a histogram on-the-fly if missing
            const hist = new client.Histogram({ name: 'notification_delivery_latency_ms', help: 'Notification delivery latency (ms)', buckets: [10,50,100,200,500,1000,2000] });
            hist.observe(latencyMs);
          }
        } catch (e) {
          // ignore metric failures
        }
        notificationDeliveryCounter.inc({ status: 'delivered' }, 1);
        console.log(`✅ Real-time notification sent to user ${userId}`);
      } catch (e) {
        notificationDeliveryCounter.inc({ status: 'emit_error' }, 1);
        console.warn('Failed to emit notification via Socket.IO:', e);
      }
    } else {
      console.warn('⚠️ Socket.IO not available, notification queued');
      notificationDeliveryCounter.inc({ status: 'queued' }, 1);
    }

    return fullNotification;
  }

  static async sendCompanyNotification(
    companyId: string,
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ): Promise<Notification> {
    console.log(`Sending ${notification.type} notification to company ${companyId}: ${notification.message}`);
    
    const fullNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    // Persist (company broadcast, no single user)
    try {
      await NotificationModel.create({
        companyId: companyId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        read: false
      });
    } catch (err) {
      console.warn('Failed to persist company notification:', err);
    }

    // Send via Socket.IO if available
    if (this.io) {
      this.io.to(`company_${companyId}`).emit('notification', fullNotification);
      console.log(`✅ Real-time notification sent to company ${companyId}`);
    } else {
      console.warn('⚠️ Socket.IO not available, notification queued');
    }

    return fullNotification;
  }

  static async getNotifications(userId: string, companyId?: string): Promise<INotification[]> {
    console.log(`Getting notifications for user: ${userId}`);
    const query: any = { $or: [{ userId }, { userId: null } ] };
    if (companyId) query.companyId = companyId;
    return NotificationModel.find(query).sort({ createdAt: -1 }).limit(100).lean() as unknown as INotification[];
  }

  static async markAsRead(notificationId: string, userId?: string): Promise<{ success: boolean }> {
    console.log(`Marking notification as read: ${notificationId}`);
    await NotificationModel.findOneAndUpdate({ _id: notificationId, ...(userId ? { userId } : {}) }, { read: true, readAt: new Date() });
    return { success: true };
  }

  static async sendTestNotification(userId: string, companyId: string): Promise<Notification> {
    return this.sendNotification(userId, {
      type: 'system_alert',
      title: 'Test Notification',
      message: 'Sistem notifikasi real-time berfungsi dengan sempurna! 🎉',
      priority: 'medium',
      companyId: companyId,
      data: {
        source: 'test',
        timestamp: new Date().toISOString()
      }
    });
  }
}

export default NotificationService;