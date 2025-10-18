import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { TransactionModel } from '../models/TransactionModel.js';
import { Types } from 'mongoose';

const router = Router();

// Get all transactions with filtering
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { type, category, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const query: any = { companyId };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [transactions, total] = await Promise.all([
      TransactionModel.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('contactId', 'name email')
        .populate('invoiceId', 'invoiceNumber')
        .populate('billId', 'billNumber')
        .lean(),
      TransactionModel.countDocuments(query)
    ]);

    // Calculate summary
    const summary = await TransactionModel.getStatistics(companyId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as 'income' | 'expense' | undefined,
      category: category as string | undefined
    });

    res.json({
      success: true,
      data: transactions,
      summary,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    }

    const transaction = await TransactionModel.findById(id)
      .populate('createdBy', 'name email')
      .populate('contactId', 'name email')
      .populate('invoiceId', 'invoiceNumber')
      .populate('billId', 'billNumber')
      .lean();
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
});

// Create new transaction
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;
    
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const transaction = await TransactionModel.create({
      ...req.body,
      companyId,
      createdBy: userId,
      date: req.body.date ? new Date(req.body.date) : new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    }

    const updated = await TransactionModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction'
    });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    }

    const deleted = await TransactionModel.findByIdAndDelete(id).lean();
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  }
});

// Mark transaction as completed
router.post('/:id/complete', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    }

    const completed = await TransactionModel.markAsCompleted(id, userId);
    
    if (!completed) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction marked as completed',
      data: completed
    });
  } catch (error) {
    console.error('Complete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete transaction'
    });
  }
});

// Reconcile transaction
router.post('/:id/reconcile', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    }

    const reconciled = await TransactionModel.reconcile(id);
    
    if (!reconciled) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction reconciled successfully',
      data: reconciled
    });
  } catch (error) {
    console.error('Reconcile transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reconcile transaction'
    });
  }
});

// Get category breakdown
router.get('/stats/categories', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const { type, startDate, endDate } = req.query;
    
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const breakdown = await TransactionModel.getCategoryBreakdown(
      companyId,
      type as 'income' | 'expense',
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category breakdown'
    });
  }
});

export default router;

