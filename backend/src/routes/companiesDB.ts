import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { Company } from '../models/Company.js';
import { Types } from 'mongoose';

const router = Router();

// Get current company
router.get('/current', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const company = await Company.findById(companyId).lean();
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    res.json({ success: true, company });
  } catch (error) {
    console.error('Get current company error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch company' });
  }
});

// Get company by ID (admin only)
router.get('/:id', authenticateToken, authorize('admin.manage_users'), async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID' });
    }

    const company = await Company.findById(id).lean();
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    res.json({ success: true, company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch company' });
  }
});

// Update company (admin only)
router.put('/:id', authenticateToken, authorize('admin.manage_users'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user?.companyId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID' });
    }

    // Users can only update their own company
    if (id !== userCompanyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateData: any = {};
    const { name, registrationNumber, taxNumber, address, contact, settings } = req.body;

    if (name) updateData.name = name;
    if (registrationNumber) updateData.registrationNumber = registrationNumber;
    if (taxNumber) updateData.taxNumber = taxNumber;
    if (address) updateData.address = address;
    if (contact) updateData.contact = contact;
    if (settings) updateData.settings = settings;

    const updated = await Company.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: 'Company not found' });

    res.json({ success: true, message: 'Company updated successfully', company: updated });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ success: false, message: 'Failed to update company' });
  }
});

// Update company settings
router.patch('/current/settings', authenticateToken, authorize('admin.manage_users'), async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { currency, language, taxType } = req.body;
    const updateData: any = {};

    if (currency) updateData['settings.currency'] = currency;
    if (language) updateData['settings.language'] = language;
    if (taxType) updateData['settings.taxType'] = taxType;

    const updated = await Company.findByIdAndUpdate(
      companyId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: 'Company not found' });

    res.json({ success: true, message: 'Company settings updated successfully', company: updated });
  } catch (error) {
    console.error('Update company settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update company settings' });
  }
});

// Get company statistics
router.get('/current/statistics', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    // Import models dynamically to avoid circular dependencies
    const { InvoiceModel } = await import('../models/InvoiceModel.js');
    const { TransactionModel } = await import('../models/TransactionModel.js');
    const { ProductModel } = await import('../models/ProductModel.js');
    const { ContactModel } = await import('../models/ContactModel.js');

    const [
      invoiceCount,
      transactionCount,
      productCount,
      customerCount,
      supplierCount
    ] = await Promise.all([
      InvoiceModel.countDocuments({ companyId }),
      TransactionModel.countDocuments({ companyId }),
      ProductModel.countDocuments({ companyId, active: true }),
      ContactModel.countDocuments({ companyId, type: { $in: ['customer', 'both'] }, active: true }),
      ContactModel.countDocuments({ companyId, type: { $in: ['supplier', 'both'] }, active: true })
    ]);

    res.json({
      success: true,
      statistics: {
        invoices: invoiceCount,
        transactions: transactionCount,
        products: productCount,
        customers: customerCount,
        suppliers: supplierCount
      }
    });
  } catch (error) {
    console.error('Get company statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch company statistics' });
  }
});

export default router;

