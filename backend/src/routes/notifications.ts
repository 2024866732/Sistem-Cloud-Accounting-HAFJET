import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import NotificationService from '../services/NotificationService';

const router = Router();

// List notifications (user + company scope)
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.companyId;
    const notes = await NotificationService.getNotifications(userId, companyId);
    res.json({ success: true, data: notes });
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
});

// Mark single notification as read
router.post('/:id/read', authenticateToken, async (req: any, res) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark notification read' });
  }
});

// Mark all user notifications as read
router.post('/read-all', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.companyId;
    await NotificationService.markAsRead('*'); // placeholder; implement bulk below
    // Bulk update directly
    const model = (await import('../models/Notification')).Notification;
    await model.updateMany({ $or: [{ userId }, { userId: null }], companyId, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    console.error('Read-all error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark notifications read' });
  }
});

export default router;