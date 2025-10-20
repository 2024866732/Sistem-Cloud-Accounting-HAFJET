import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { BillModel } from '../models/BillModel.js';
import { Types } from 'mongoose';

const router = Router();

// List bills
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const query: any = { companyId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      BillModel.find(query).sort({ issueDate: -1 }).skip(skip).limit(Number(limit))
        .populate('createdBy', 'name email').populate('supplierId', 'name email').lean(),
      BillModel.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) || 1 } });
  } catch (error) {
    console.error('List bills error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bills' });
  }
});

// Get bill by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid bill ID' });
    }

    const bill = await BillModel.findById(id).populate('createdBy', 'name email').populate('supplierId', 'name email').lean();
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bill' });
  }
});

// Create bill
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    // Calculate totals explicitly
    const billData = { ...req.body };
    if (billData.items && billData.items.length > 0) {
      let subtotal = 0;
      let taxAmount = 0;
      
      billData.items = billData.items.map((item: any) => {
        const amount = item.quantity * item.unitPrice;
        const itemTaxAmount = item.taxRate ? amount * item.taxRate : 0;
        subtotal += amount;
        taxAmount += itemTaxAmount;
        
        return {
          ...item,
          amount,
          taxAmount: itemTaxAmount
        };
      });
      
      billData.subtotal = subtotal;
      billData.taxAmount = taxAmount;
      billData.total = subtotal + taxAmount;
    }

    const billNumber = await BillModel.generateBillNumber(companyId);
    const bill = await BillModel.create({ ...billData, companyId, createdBy: userId, billNumber });

    res.status(201).json({ success: true, message: 'Bill created successfully', data: bill });
  } catch (error: any) {
    console.error('Create bill error:', error);
    console.error('Bill validation errors:', error.errors);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create bill',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error.errors || error.message || 'Unknown validation error'
    });
  }
});

// Update bill
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid bill ID' });
    }

    const updated = await BillModel.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Bill not found' });

    res.json({ success: true, message: 'Bill updated successfully', data: updated });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to update bill' });
  }
});

// Delete bill
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid bill ID' });
    }

    const deleted = await BillModel.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Bill not found' });

    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bill' });
  }
});

export default router;

