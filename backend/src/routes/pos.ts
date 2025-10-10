import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import loyversePosService from '../services/LoyversePosService.js';
import PosSalesPostingService from '../services/PosSalesPostingService.js';

const router = Router();

router.post('/loyverse/sync', authenticateToken, authorize('pos.sync'), audit({ action: 'pos.loyverse.sync', entityType: 'PosSale', captureBody: true }), async (req: any, res) => {
  try {
    if (!loyversePosService.isEnabled()) {
      return res.status(503).json({ success: false, message: 'Loyverse integration disabled' });
    }
    const full = req.query.full === 'true' || req.body?.full === true;
    const result = await loyversePosService.syncRecentSales(req.user.companyId, { full });
    res.json({ success: true, data: result, full });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Sync failed' });
  }
});

// Daily posting endpoint: aggregates normalized (unposted) POS sales/refunds into a LedgerEntry
router.post('/loyverse/post', authenticateToken, authorize('ledger.post'), audit({ action: 'pos.loyverse.post', entityType: 'PosSale', captureBody: true }), async (req: any, res) => {
  try {
    const { businessDate, storeLocationId, status } = req.body || {};
    if (!businessDate) {
      return res.status(400).json({ success: false, message: 'businessDate (YYYY-MM-DD) required' });
    }
    const result = await PosSalesPostingService.postDaily({
      companyId: req.user.companyId,
      userId: req.user._id,
      businessDate,
      storeLocationId,
      status: status === 'draft' ? 'draft' : 'posted'
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.message && err.message.startsWith('No unposted')) {
      return res.status(422).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message || 'Posting failed' });
  }
});

export default router;
