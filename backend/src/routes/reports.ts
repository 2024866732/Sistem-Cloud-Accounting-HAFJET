import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { LedgerEntry } from '../models/LedgerEntry';

const router = Router();

router.get('/', (req, res) => res.json({ message: 'Reports endpoint - Coming soon' }));

// Basic Profit & Loss aggregation (stub)
router.get('/pnl', authenticateToken, authorize('reports.view'), async (req: any, res) => {
	try {
		const companyId = req.user?.companyId; // Expect auth middleware to attach
		if (!companyId) {
			return res.status(400).json({ success: false, message: 'companyId missing in token' });
		}

		// Period filter (current month if not provided)
		const { period } = req.query; // YYYY-MM
		const now = new Date();
		const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
		const targetPeriod = typeof period === 'string' ? period : currentPeriod;

		// Pull ledger entries (draft + posted for now; later restrict to posted)
		const entries = await LedgerEntry.find({ companyId, period: targetPeriod, status: { $in: ['draft', 'posted'] } }).lean();

		// Simple classification by account code prefix
		const summary = {
			period: targetPeriod,
			revenue: 0,
			tax: 0,
			receivablesMovement: 0,
			grossProfit: 0
		} as any;

		for (const e of entries) {
			for (const s of e.splits) {
				// Revenue (4000 range)
				if (s.accountCode.startsWith('4')) {
					// Revenue stored as credit: invert sign for P&L positive
						const amt = s.type === 'credit' ? s.amount : -s.amount;
						summary.revenue += amt;
				}
				// Tax liability (2100 range)
				if (s.accountCode.startsWith('21')) {
					const amt = s.type === 'credit' ? s.amount : -s.amount;
					summary.tax += amt;
				}
				// A/R movement (1100)
				if (s.accountCode === '1100') {
					const amt = s.type === 'debit' ? s.amount : -s.amount;
					summary.receivablesMovement += amt;
				}
			}
		}

		summary.grossProfit = summary.revenue; // placeholder until COGS added

		return res.json({ success: true, data: summary, count: entries.length });
	} catch (err) {
		console.error('P&L aggregation error:', err);
		return res.status(500).json({ success: false, message: 'Failed to compute P&L' });
	}
});

export default router;