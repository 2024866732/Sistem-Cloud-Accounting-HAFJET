import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import ReconciliationSession from '../models/ReconciliationSession';
import { audit } from '../middleware/audit';

const router = Router();

const createSessionSchema = z.object({
  bankAccountRef: z.string().min(1),
  accountCode: z.string().optional(),
  dateFrom: z.string(),
  dateTo: z.string(),
  openingBalance: z.number().optional(),
  closingBalance: z.number().optional(),
  notes: z.string().optional()
});

router.post('/', authenticateToken, authorize('reconciliation.manage'), validate({ body: createSessionSchema }), async (req: any, res) => {
  try {
    const { bankAccountRef, accountCode, dateFrom, dateTo, openingBalance, closingBalance, notes } = req.body;
    const period = `${new Date(dateFrom).getFullYear()}-${String(new Date(dateFrom).getMonth() + 1).padStart(2,'0')}`;
    const session = await ReconciliationSession.create({
      companyId: req.user.companyId,
      bankAccountRef,
      accountCode,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      period,
      openingBalance,
      closingBalance,
      status: 'open',
      createdBy: req.user.id,
      notes
    });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('Create reconciliation session error:', err);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

router.get('/', authenticateToken, authorize(['reconciliation.view','reconciliation.manage']), async (req: any, res) => {
  try {
    const sessions = await ReconciliationSession.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list sessions' });
  }
});

const addMatchSchema = z.object({
  ledgerEntryId: z.string().optional(),
  bankTxnId: z.string().optional(),
  amount: z.number().positive(),
  notes: z.string().optional()
});

router.post('/:id/matches', authenticateToken, authorize('reconciliation.manage'), validate({ body: addMatchSchema }), async (req: any, res) => {
  try {
    const session = await ReconciliationSession.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    session.matches.push({
      ledgerEntryId: req.body.ledgerEntryId,
      bankTxnId: req.body.bankTxnId,
      amount: req.body.amount,
      status: 'proposed',
      notes: req.body.notes
    } as any);
    await session.save();
    res.json({ success: true, data: session });
  } catch (err) {
    console.error('Add match error:', err);
    res.status(500).json({ success: false, message: 'Failed to add match' });
  }
});

router.post('/:id/finalize', authenticateToken, authorize('reconciliation.manage'), audit({ action: 'reconciliation.finalize', entityType: 'ReconciliationSession', entityIdParam: 'id' }), async (req: any, res) => {
  try {
    const session = await ReconciliationSession.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    session.status = 'completed';
    session.finalizedBy = req.user.id;
    session.finalizedAt = new Date();
    // Compute differences placeholder
    const totalMatched = session.matches.filter(m => m.status !== 'rejected').reduce((s, m) => s + m.amount, 0);
    if (typeof session.closingBalance === 'number' && typeof session.openingBalance === 'number') {
      session.systemBalance = session.openingBalance + totalMatched; // simplistic
      if (typeof session.closingBalance === 'number') {
        session.differences = (session.systemBalance || 0) - session.closingBalance;
      }
    }
    await session.save();
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to finalize session' });
  }
});

export default router;