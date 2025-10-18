import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { StockMovementModel } from '../models/StockMovementModel.js';
import { ProductModel } from '../models/ProductModel.js';
import { Types } from 'mongoose';

const router = Router();

// List stock movements
router.get('/movements', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { page = 1, limit = 50, productId, type } = req.query;
    const query: any = { companyId };
    if (productId) query.productId = productId;
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      StockMovementModel.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit))
        .populate('productId', 'name code').populate('createdBy', 'name email').lean(),
      StockMovementModel.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) || 1 } });
  } catch (error) {
    console.error('List movements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock movements' });
  }
});

// Get low stock products
router.get('/low-stock', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const products = await ProductModel.find({
      companyId,
      trackInventory: true,
      active: true,
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    }).lean();

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock products' });
  }
});

// Record stock adjustment
router.post('/adjust', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { productId, quantity, notes } = req.body;
    
    if (!productId || !Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Valid productId required' });
    }

    const product = await ProductModel.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousStock = product.currentStock || 0;
    const newStock = previousStock + Number(quantity);

    await ProductModel.findByIdAndUpdate(productId, { $set: { currentStock: newStock } });

    const movement = await StockMovementModel.create({
      companyId,
      productId,
      type: 'adjustment',
      quantity: Number(quantity),
      previousStock,
      newStock,
      unit: product.unit,
      date: new Date(),
      notes,
      createdBy: userId
    });

    res.json({ success: true, message: 'Stock adjusted successfully', data: movement });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust stock' });
  }
});

// Get inventory valuation
router.get('/valuation', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const products = await ProductModel.find({
      companyId,
      trackInventory: true,
      active: true
    }).lean();

    const valuation = products.map(p => ({
      productId: p._id,
      name: p.name,
      currentStock: p.currentStock || 0,
      cost: p.cost || 0,
      value: (p.currentStock || 0) * (p.cost || 0)
    }));

    const totalValue = valuation.reduce((sum, v) => sum + v.value, 0);

    res.json({ success: true, data: { items: valuation, totalValue } });
  } catch (error) {
    console.error('Valuation error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate inventory valuation' });
  }
});

export default router;

