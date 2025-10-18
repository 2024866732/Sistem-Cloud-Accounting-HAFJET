import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ContactModel } from '../models/ContactModel.js';
import { Types } from 'mongoose';

const router = Router();

// List contacts
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { page = 1, limit = 50, type, active, search } = req.query;
    const query: any = { companyId };
    if (type) query.type = type;
    if (active !== undefined) query.active = active === 'true';
    if (search) query.name = new RegExp(search as string, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      ContactModel.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)).populate('createdBy', 'name email').lean(),
      ContactModel.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) || 1 } });
  } catch (error) {
    console.error('List contacts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

// Get contact by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    const contact = await ContactModel.findById(id).populate('createdBy', 'name email').lean();
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });

    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact' });
  }
});

// Create contact
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const contact = await ContactModel.create({ ...req.body, companyId, createdBy: userId });

    res.status(201).json({ success: true, message: 'Contact created successfully', data: contact });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to create contact' });
  }
});

// Update contact
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    const updated = await ContactModel.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Contact not found' });

    res.json({ success: true, message: 'Contact updated successfully', data: updated });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    const deleted = await ContactModel.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Contact not found' });

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
});

export default router;

