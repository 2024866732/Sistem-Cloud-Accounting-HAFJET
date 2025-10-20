import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ProductModel } from '../models/ProductModel.js';
import { Types } from 'mongoose';

const router = Router();

// List products
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { page = 1, limit = 50, category, type, active, search } = req.query;
    const query: any = { companyId };
    if (category) query.category = category;
    if (type) query.type = type;
    if (active !== undefined) query.active = active === 'true';
    if (search) query.name = new RegExp(search as string, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      ProductModel.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)).populate('createdBy', 'name email').lean(),
      ProductModel.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) || 1 } });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await ProductModel.findById(id).populate('createdBy', 'name email').lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    // Map alternative field names for compatibility
    const productData: any = { ...req.body, companyId, createdBy: userId };
    if (req.body.sellingPrice) productData.price = req.body.sellingPrice;
    if (req.body.costPrice) productData.cost = req.body.costPrice;

    const product = await ProductModel.create(productData);

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update product
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const updated = await ProductModel.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const deleted = await ProductModel.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// Update stock
router.post('/:id/stock', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await ProductModel.findByIdAndUpdate(
      id, 
      { $inc: { currentStock: quantity } }, 
      { new: true }
    ).lean();
    
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Stock updated successfully', data: product });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
});

export default router;

