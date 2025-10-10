// invoices routes - canonical implementation
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validate, createInvoiceSchema, updateInvoiceSchema } from '../middleware/validate.js';
import { audit } from '../middleware/audit.js';
import { authorize } from '../middleware/rbac.js';
import LedgerPostingService from '../services/LedgerPostingService.js';
import LHDNEInvoiceService, { EInvoiceDoc } from '../services/EInvoiceService.js';
import InvoiceService from '../services/InvoiceService.js';

const router = Router();

const getLhdnEnv = (): 'sandbox' | 'production' => (process.env.LHDN_ENV === 'production' ? 'production' : 'sandbox');

const buildSupplier = () => ({
  tin: process.env.LHDN_TAXPAYER_TIN || '200501234567',
  idType: process.env.LHDN_ID_TYPE || 'BRN',
  idValue: process.env.LHDN_ID_VALUE || process.env.LHDN_TAXPAYER_TIN || '200501234567',
  registrationName: process.env.COMPANY_NAME || 'HAFJET Sdn Bhd',
  msicCode: process.env.MSIC_CODE || '62011',
  businessActivityDescription: process.env.BUSINESS_ACTIVITY || 'Software Development',
  address: {
    addressLine1: process.env.COMPANY_ADDRESS_LINE1 || 'Level 12, Tower A',
    addressLine2: process.env.COMPANY_ADDRESS_LINE2 || 'Menara UOA Bangsar',
    city: process.env.COMPANY_CITY || 'Kuala Lumpur',
    postcode: process.env.COMPANY_POSTCODE || '59200',
    state: process.env.COMPANY_STATE || 'Kuala Lumpur',
    country: process.env.COMPANY_COUNTRY || 'Malaysia'
  },
  contact: process.env.COMPANY_CONTACT || '+60312345678'
});

// List invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const list = await InvoiceService.list(page, limit);
    res.json({ success: true, ...list });
  } catch (err) {
    console.error('List invoices error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

// Get invoice by id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.get(id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
  }
});

// Create invoice
router.post('/', authenticateToken, validate({ body: createInvoiceSchema }), audit({ action: 'invoice.create', entityType: 'Invoice', captureBody: true }), async (req, res) => {
  try {
    const created = await InvoiceService.create(req.body, { userId: (req as any).user?.id, companyId: (req as any).user?.companyId });
    // Non-blocking ledger draft
    try {
      const companyId = (req as any).user?.companyId || '000000000000000000000000';
      const userId = (req as any).user?.id || '000000000000000000000000';
      await LedgerPostingService.postInvoice({ companyId, userId, invoice: { _id: created.id, invoiceNumber: created.invoiceNumber, customerName: created.customerName, subtotal: created.subtotal, taxAmount: created.taxAmount, total: created.total, currency: created.currency, date: created.issueDate }, status: 'draft' });
    } catch (e) { console.warn('Ledger draft failed:', e); }
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authenticateToken, validate({ body: updateInvoiceSchema }), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await InvoiceService.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to update invoice' });
  }
});

// Patch invoice (partial update)
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patched = await InvoiceService.patch(id, req.body as any);
    if (!patched) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: patched });
  } catch (err) {
    console.error('Patch invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to patch invoice' });
  }
});

// Delete invoice
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await InvoiceService.delete(id);
    if (!removed) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: removed });
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete invoice' });
  }
});

// Submit to LHDN (validate + submit)
router.post('/:id/submit-einvoice', authenticateToken, authorize('invoice.submit_einvoice'), audit({ action: 'invoice.submit_einvoice', entityType: 'Invoice', entityIdParam: 'id' }), async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.get(id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const lhdn = new LHDNEInvoiceService({ environment: getLhdnEnv() });
    const supplier = buildSupplier();
    const einvoiceDoc: EInvoiceDoc = {
      id: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      issueTime: '12:00:00',
      invoiceType: '01',
      invoiceNumber: invoice.invoiceNumber,
      currencyCode: invoice.currency === 'MYR' ? 'MYR' : 'USD',
      supplier,
      buyer: {
        idType: 'BRN',
        idValue: invoice.customerName ? invoice.customerName.replace(/\s+/g, '').slice(0, 12) : '200501234568',
        registrationName: invoice.customerName || 'Unknown',
        email: invoice.customerEmail || 'customer@example.com',
        address: { addressLine1: invoice.customerName ? `Address for ${invoice.customerName}` : 'Buyer Address', city: 'Kuala Lumpur', postcode: '50000', state: 'Kuala Lumpur', country: 'Malaysia' }
      },
      invoiceLineItems: invoice.items.map(it => ({ classification: 'C', productName: it.description, quantity: it.quantity, unitPrice: it.unitPrice, measurement: 'C62', subtotal: it.amount || 0, totalExcludingTax: it.amount || 0, taxType: it.taxRate && it.taxRate > 0 ? 'SST' : 'NONE', taxRate: it.taxRate ? Math.round(it.taxRate * 100) : 0, taxAmount: it.taxAmount || 0, totalIncludingTax: (it.amount || 0) + (it.taxAmount || 0) })),
      taxSummary: [{ taxType: 'SST', taxableAmount: invoice.subtotal, taxRate: Math.round((invoice.malaysianTax?.taxRate || 0) * 100), taxAmount: invoice.taxAmount }],
      totalExcludingTax: invoice.subtotal,
      totalIncludingTax: invoice.total,
      totalTaxAmount: invoice.taxAmount,
      totalPayableAmount: invoice.total
    };
    const validation = await lhdn.validateInvoice(einvoiceDoc);
    if (!validation.valid) return res.status(400).json({ success: false, message: 'E-Invoice validation failed', errors: validation.errors });
    const result = await lhdn.submitEInvoice(einvoiceDoc);
    const mappedStatus = result.status === 'Valid' ? 'approved' : result.status.toLowerCase();
    await InvoiceService.upsertEinvoice(id, { status: mappedStatus, submissionDate: result.submissionDateTime, uuid: result.uuid });
    const updated = await InvoiceService.get(id);
    if (mappedStatus === 'approved') {
      try {
        await LedgerPostingService.postInvoice({ companyId: (req as any).user?.companyId || '000000000000000000000000', userId: (req as any).user?.id || '000000000000000000000000', invoice: { _id: updated!.id, invoiceNumber: updated!.invoiceNumber, customerName: updated!.customerName, subtotal: updated!.subtotal, taxAmount: updated!.taxAmount, total: updated!.total, currency: updated!.currency, date: updated!.issueDate }, status: 'posted' });
      } catch (e) { console.warn('Ledger post failed:', e); }
    }
    res.json({ success: true, data: { uuid: result.uuid, status: mappedStatus, submissionDateTime: result.submissionDateTime, originalStatus: result.status } });
  } catch (err) {
    console.error('Submit einvoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit invoice to LHDN' });
  }
});

// Validate einvoice only
router.post('/:id/validate-einvoice', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.get(id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const lhdn = new LHDNEInvoiceService({ environment: getLhdnEnv() });
    const supplier = buildSupplier();
    const einvoiceDoc: EInvoiceDoc = {
      id: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      issueTime: '12:00:00',
      invoiceType: '01',
      invoiceNumber: invoice.invoiceNumber,
      currencyCode: invoice.currency === 'MYR' ? 'MYR' : 'USD',
      supplier,
      buyer: { idType: 'BRN', idValue: invoice.customerName ? invoice.customerName.replace(/\s+/g, '').slice(0, 12) : '200501234568', registrationName: invoice.customerName || 'Unknown', email: invoice.customerEmail || 'customer@example.com', address: { addressLine1: invoice.customerName ? `Address for ${invoice.customerName}` : 'Buyer Address', city: 'Kuala Lumpur', postcode: '50000', state: 'Kuala Lumpur', country: 'Malaysia' } },
      invoiceLineItems: invoice.items.map(it => ({ classification: 'C', productName: it.description, quantity: it.quantity, unitPrice: it.unitPrice, measurement: 'C62', subtotal: it.amount || 0, totalExcludingTax: it.amount || 0, taxType: it.taxRate && it.taxRate > 0 ? 'SST' : 'NONE', taxRate: it.taxRate ? Math.round(it.taxRate * 100) : 0, taxAmount: it.taxAmount || 0, totalIncludingTax: (it.amount || 0) + (it.taxAmount || 0) })),
      taxSummary: [{ taxType: 'SST', taxableAmount: invoice.subtotal, taxRate: Math.round((invoice.malaysianTax?.taxRate || 0) * 100), taxAmount: invoice.taxAmount }],
      totalExcludingTax: invoice.subtotal,
      totalIncludingTax: invoice.total,
      totalTaxAmount: invoice.taxAmount,
      totalPayableAmount: invoice.total
    };
    const validation = await lhdn.validateInvoice(einvoiceDoc);
    res.json({ success: true, data: { invoiceId: id, valid: validation.valid, errors: validation.errors } });
  } catch (err) {
    console.error('Validate einvoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to validate invoice' });
  }
});

// Get einvoice status
router.get('/:id/einvoice-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.get(id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (!invoice.einvoice || !invoice.einvoice.uuid) return res.json({ success: true, data: { invoiceId: id, status: invoice.einvoice?.status || 'not_submitted' } });
    const lhdn = new LHDNEInvoiceService({ environment: getLhdnEnv() });
    const status = await lhdn.getInvoiceStatus(invoice.einvoice.uuid);
    res.json({ success: true, data: { invoiceId: id, uuid: invoice.einvoice.uuid, status: status.status, submissionDateTime: status.submissionDateTime, issueDateTime: status.issueDateTime } });
  } catch (err) {
    console.error('E-Invoice status error:', err);
    res.status(500).json({ success: false, message: 'Failed to get E-Invoice status' });
  }
});

export default router;
