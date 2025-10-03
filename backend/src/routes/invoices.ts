import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validate, createInvoiceSchema, updateInvoiceSchema } from '../middleware/validate';
import { audit } from '../middleware/audit';
import { authorize } from '../middleware/rbac';
import LedgerPostingService from '../services/LedgerPostingService';
import LHDNEInvoiceService, { EInvoiceDoc } from '../services/EInvoiceService';

const router = Router();

// Sample Malaysian invoice data
const sampleInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV202410001',
    customerName: 'ABC Sdn Bhd',
    customerEmail: 'abc@company.com',
    issueDate: '2024-10-01',
    dueDate: '2024-10-31',
    status: 'sent',
    currency: 'MYR',
    items: [
      {
        description: 'Web Development Services',
        quantity: 1,
        unitPrice: 5000.00,
        amount: 5000.00,
        taxRate: 0.06,
        taxAmount: 300.00,
        taxType: 'SST'
      }
    ],
    subtotal: 5000.00,
    taxAmount: 300.00,
    total: 5300.00,
    malaysianTax: {
      taxType: 'SST',
      taxRate: 0.06,
      taxableAmount: 5000.00,
      taxAmount: 300.00,
      exemptAmount: 0.00,
      sstNumber: 'SST-12345678'
    },
    einvoice: {
      status: 'pending',
      submissionDate: null,
      uuid: null
    }
  },
  {
    id: '2',
    invoiceNumber: 'INV202410002',
    customerName: 'XYZ Trading Sdn Bhd',
    customerEmail: 'xyz@trading.com',
    issueDate: '2024-10-02',
    dueDate: '2024-11-01',
    status: 'paid',
    currency: 'MYR',
    items: [
      {
        description: 'Consulting Services',
        quantity: 20,
        unitPrice: 150.00,
        amount: 3000.00,
        taxRate: 0.06,
        taxAmount: 180.00,
        taxType: 'SST'
      }
    ],
    subtotal: 3000.00,
    taxAmount: 180.00,
    total: 3180.00,
    malaysianTax: {
      taxType: 'SST',
      taxRate: 0.06,
      taxableAmount: 3000.00,
      taxAmount: 180.00,
      exemptAmount: 0.00,
      sstNumber: 'SST-12345678'
    },
    einvoice: {
      status: 'approved',
      submissionDate: '2024-10-02T10:30:00Z',
      uuid: 'ABC123-DEF456-GHI789'
    }
  }
];

// Get all invoices
router.get('/', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: sampleInvoices,
      pagination: {
        total: sampleInvoices.length,
        page: 1,
        limit: 10,
        pages: 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
});

// Get invoice by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const invoice = sampleInvoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
});

// Create new invoice
router.post('/', authenticateToken, validate({ body: createInvoiceSchema }), audit({ action: 'invoice.create', entityType: 'Invoice', captureBody: true }), async (req, res) => {
  try {
    const baseNumber = `INV${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const sequence = String(sampleInvoices.length + 1).padStart(3, '0');
    const invoiceNumber = `${baseNumber}${sequence}`;

    // Basic subtotal + tax calculation (temporary)
    const items = req.body.items.map((it: any) => ({
      ...it,
      amount: it.quantity * it.unitPrice,
      taxAmount: it.taxRate ? (it.quantity * it.unitPrice * it.taxRate) : 0
    }));
    const subtotal = items.reduce((s: number, i: any) => s + i.amount, 0);
    const taxAmount = items.reduce((s: number, i: any) => s + (i.taxAmount || 0), 0);
    const total = subtotal + taxAmount;

  const newInvoice: any = {
      id: String(sampleInvoices.length + 1),
      invoiceNumber,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: req.body.dueDate || new Date().toISOString().split('T')[0],
      status: 'draft',
      currency: req.body.currency || 'MYR',
      items,
      subtotal,
      taxAmount,
      total,
      malaysianTax: taxAmount > 0 ? {
        taxType: 'SST',
        taxRate: (taxAmount / subtotal),
        taxableAmount: subtotal,
        taxAmount,
        exemptAmount: 0,
        sstNumber: 'SST-PLACEHOLDER'
      } : {
        taxType: 'NONE',
        taxRate: 0,
        taxableAmount: subtotal,
        taxAmount: 0,
        exemptAmount: 0,
        sstNumber: ''
      },
      einvoice: {
        status: 'pending',
        submissionDate: null,
        uuid: null
      }
    };

    sampleInvoices.push(newInvoice);

    // Create draft ledger entry (placeholder company & user)
    try {
      const companyId = (req as any).user?.companyId || new Date().getFullYear().toString().repeat(2).slice(0,24); // placeholder fallback
      const userId = (req as any).user?.id || '000000000000000000000000';
      await LedgerPostingService.postInvoice({
        companyId,
        userId,
        invoice: {
          _id: newInvoice.id,
          invoiceNumber: newInvoice.invoiceNumber,
          customerName: newInvoice.customerName,
            subtotal: newInvoice.subtotal,
            taxAmount: newInvoice.taxAmount,
            total: newInvoice.total,
            currency: newInvoice.currency,
            date: newInvoice.issueDate
        },
        status: 'draft'
      });
    } catch (ledgerErr) {
      console.warn('Ledger draft entry failed (non-blocking):', ledgerErr);
    }

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
});

// Update invoice
router.put('/:id', authenticateToken, validate({ body: updateInvoiceSchema }), (req, res) => {
  try {
    const { id } = req.params;
    const invoiceIndex = sampleInvoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    sampleInvoices[invoiceIndex] = {
      ...sampleInvoices[invoiceIndex],
      ...req.body
    };

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: sampleInvoices[invoiceIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice'
    });
  }
});

// Submit to LHDN E-Invoice
router.post('/:id/submit-einvoice', authenticateToken, authorize('invoice.submit_einvoice'), audit({ action: 'invoice.submit_einvoice', entityType: 'Invoice', entityIdParam: 'id' }), async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceIndex = sampleInvoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = sampleInvoices[invoiceIndex];
    
    // Initialize LHDN E-Invoice Service
    const lhdnService = new LHDNEInvoiceService({
      environment: 'sandbox'
    });

    // Convert invoice to LHDN format
    const einvoiceDoc: EInvoiceDoc = {
      id: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      issueTime: '12:00:00', // Default time
      invoiceType: '01', // Standard invoice
      invoiceNumber: invoice.invoiceNumber,
      currencyCode: invoice.currency === 'MYR' ? 'MYR' : 'USD',
      
      supplier: {
        tin: '200501234567',
        idType: 'BRN',
        idValue: '200501234567',
        registrationName: 'HAFJET Sdn Bhd',
        businessRegistrationNumber: '200501234567',
        email: 'invoices@hafjet.com',
        msicCode: '62011',
        businessActivityDescription: 'Software Development',
        address: {
          addressLine1: 'Level 12, Tower A',
          addressLine2: 'Menara UOA Bangsar',
          city: 'Kuala Lumpur',
          postcode: '59200',
          state: 'Kuala Lumpur',
          country: 'Malaysia'
        },
        contact: '+60312345678'
      },
      
      buyer: {
        idType: 'BRN',
        idValue: '200501234568',
        registrationName: invoice.customerName,
        email: 'customer@example.com',
        address: {
          addressLine1: 'Customer Address Line 1',
          city: 'Kuala Lumpur',
          postcode: '50000',
          state: 'Kuala Lumpur',
          country: 'Malaysia'
        }
      },
      
      invoiceLineItems: [{
        classification: 'C',
        productName: 'Professional Services',
        quantity: 1,
        unitPrice: invoice.total - invoice.taxAmount,
        measurement: 'C62',
        subtotal: invoice.total - invoice.taxAmount,
        totalExcludingTax: invoice.total - invoice.taxAmount,
        taxType: 'SST',
        taxRate: 6,
        taxAmount: invoice.taxAmount,
        totalIncludingTax: invoice.total
      }],
      
      taxSummary: [{
        taxType: 'SST',
        taxableAmount: invoice.total - invoice.taxAmount,
        taxRate: 6,
        taxAmount: invoice.taxAmount
      }],
      
      totalExcludingTax: invoice.total - invoice.taxAmount,
      totalIncludingTax: invoice.total,
      totalTaxAmount: invoice.taxAmount,
      totalPayableAmount: invoice.total
    };

    // Validate invoice first
    const validation = await lhdnService.validateInvoice(einvoiceDoc);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invoice validation failed',
        errors: validation.errors
      });
    }

    // Submit to LHDN
    const result = await lhdnService.submitEInvoice(einvoiceDoc);

    // Update invoice with E-Invoice details + map status
    const mappedStatus = result.status === 'Valid' ? 'approved' : result.status.toLowerCase();
    sampleInvoices[invoiceIndex].einvoice = {
      status: mappedStatus,
      submissionDate: result.submissionDateTime,
      uuid: result.uuid
    };

    // If approved/valid, create/upgrade ledger entry to posted (simplified)
    if (mappedStatus === 'approved') {
      try {
        const inv = sampleInvoices[invoiceIndex];
        const companyId = (req as any).user?.companyId || '000000000000000000000000';
        const userId = (req as any).user?.id || '000000000000000000000000';
        await LedgerPostingService.postInvoice({
          companyId,
          userId,
          invoice: {
            _id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            subtotal: inv.subtotal,
            taxAmount: inv.taxAmount,
            total: inv.total,
            currency: inv.currency,
            date: inv.issueDate
          },
          status: 'posted'
        });
      } catch (postErr) {
        console.warn('Ledger posting (approved invoice) failed:', postErr);
      }
    }

    res.json({
      success: true,
      message: 'Invoice submitted to LHDN successfully',
      data: {
        uuid: result.uuid,
        status: mappedStatus,
        submissionDateTime: result.submissionDateTime,
        originalStatus: result.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit invoice to LHDN'
    });
  }
});

// Get LHDN E-Invoice status
router.get('/:id/einvoice-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = sampleInvoices.find(inv => inv.id === id);
    
    if (!invoice || !invoice.einvoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice or E-Invoice record not found'
      });
    }

    // If UUID exists, get status from LHDN
    if (invoice.einvoice.uuid) {
      const lhdnService = new LHDNEInvoiceService({ environment: 'sandbox' });
      const status = await lhdnService.getInvoiceStatus(invoice.einvoice.uuid);
      
      res.json({
        success: true,
        data: {
          invoiceId: id,
          uuid: invoice.einvoice.uuid,
          status: status.status,
          submissionDateTime: status.submissionDateTime,
          issueDateTime: status.issueDateTime
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          invoiceId: id,
          status: 'not_submitted',
          message: 'Invoice has not been submitted to LHDN'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get E-Invoice status'
    });
  }
});

// Create sample LHDN E-Invoice
router.post('/lhdn/sample-invoice', authenticateToken, async (req, res) => {
  try {
    const lhdnService = new LHDNEInvoiceService({ environment: 'sandbox' });
    const sampleInvoice = lhdnService.createSampleInvoice();
    
    res.json({
      success: true,
      message: 'Sample LHDN E-Invoice created',
      data: sampleInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create sample invoice'
    });
  }
});

// Get LHDN service info
router.get('/lhdn/service-info', authenticateToken, async (req, res) => {
  try {
    const lhdnService = new LHDNEInvoiceService({ environment: 'sandbox' });
    const serviceInfo = lhdnService.getServiceInfo();
    
    res.json({
      success: true,
      data: serviceInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get LHDN service info'
    });
  }
});

// Validate invoice for LHDN compliance
router.post('/:id/validate-einvoice', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = sampleInvoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const lhdnService = new LHDNEInvoiceService({ environment: 'sandbox' });
    
    // Convert invoice to LHDN format
    const einvoiceDoc: EInvoiceDoc = {
      id: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      issueTime: '12:00:00',
      invoiceType: '01',
      invoiceNumber: invoice.invoiceNumber,
      currencyCode: invoice.currency === 'MYR' ? 'MYR' : 'USD',
      
      supplier: {
        tin: '200501234567',
        idType: 'BRN',
        idValue: '200501234567',
        registrationName: 'HAFJET Sdn Bhd',
        businessRegistrationNumber: '200501234567',
        email: 'invoices@hafjet.com',
        msicCode: '62011',
        businessActivityDescription: 'Software Development',
        address: {
          addressLine1: 'Level 12, Tower A',
          addressLine2: 'Menara UOA Bangsar',
          city: 'Kuala Lumpur',
          postcode: '59200',
          state: 'Kuala Lumpur',
          country: 'Malaysia'
        },
        contact: '+60312345678'
      },
      
      buyer: {
        idType: 'BRN',
        idValue: '200501234568',
        registrationName: invoice.customerName,
        email: 'customer@example.com',
        address: {
          addressLine1: 'Customer Address Line 1',
          city: 'Kuala Lumpur',
          postcode: '50000',
          state: 'Kuala Lumpur',
          country: 'Malaysia'
        }
      },
      
      invoiceLineItems: [{
        classification: 'C',
        productName: 'Professional Services',
        quantity: 1,
        unitPrice: invoice.total - invoice.taxAmount,
        measurement: 'C62',
        subtotal: invoice.total - invoice.taxAmount,
        totalExcludingTax: invoice.total - invoice.taxAmount,
        taxType: 'SST',
        taxRate: 6,
        taxAmount: invoice.taxAmount,
        totalIncludingTax: invoice.total
      }],
      
      taxSummary: [{
        taxType: 'SST',
        taxableAmount: invoice.total - invoice.taxAmount,
        taxRate: 6,
        taxAmount: invoice.taxAmount
      }],
      
      totalExcludingTax: invoice.total - invoice.taxAmount,
      totalIncludingTax: invoice.total,
      totalTaxAmount: invoice.taxAmount,
      totalPayableAmount: invoice.total
    };

    const validation = await lhdnService.validateInvoice(einvoiceDoc);
    
    res.json({
      success: true,
      data: {
        invoiceId: id,
        valid: validation.valid,
        errors: validation.errors,
        message: validation.valid ? 'Invoice is LHDN compliant' : 'Invoice validation failed'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate invoice'
    });
  }
});

export default router;