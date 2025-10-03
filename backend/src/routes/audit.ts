import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import AuditLog from '../models/AuditLog';

const router = Router();

router.get('/', authenticateToken, authorize('audit.view'), async (req: any, res) => {
  try {
    const { action, entityType, entityId, limit = 50 } = req.query;
    const q: any = {};
    if (action) q.action = action;
    if (entityType) q.entityType = entityType;
    if (entityId) q.entityId = entityId;
    if (req.user.companyId) q.companyId = req.user.companyId; // scope to company
    const logs = await AuditLog.find(q).sort({ createdAt: -1 }).limit(Number(limit)).lean();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

export default router;