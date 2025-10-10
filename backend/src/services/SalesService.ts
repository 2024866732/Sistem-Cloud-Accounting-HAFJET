import { SalesOrder, ISalesOrder } from '../models/SalesOrder.js';
import { Types } from 'mongoose';

class SalesService {
  async list(companyId: string, options: { page?: number; limit?: number } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 25);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SalesOrder.find({ companyId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SalesOrder.countDocuments({ companyId })
    ]);
    return { items, total, page, limit };
  }

  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return SalesOrder.findById(id).lean();
  }

  async create(doc: Partial<ISalesOrder>) {
    if (!doc.companyId) throw new Error('companyId required');
    if (!doc.orderNumber) {
      const time = Date.now().toString(36).toUpperCase();
      doc.orderNumber = `SO-${time.slice(-6)}`;
    }
    const created = await SalesOrder.create(doc as any);
    return created.toObject();
  }

  async update(id: string, patch: Partial<ISalesOrder>) {
    if (!Types.ObjectId.isValid(id)) throw new Error('invalid id');
    const updated = await SalesOrder.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
    return updated;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new Error('invalid id');
    await SalesOrder.findByIdAndDelete(id);
    return true;
  }
}

export default new SalesService();
