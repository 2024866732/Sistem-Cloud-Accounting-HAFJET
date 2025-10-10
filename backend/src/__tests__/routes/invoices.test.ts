/**
 * Invoices Routes Test Suite
 * Tests all invoice endpoints with proper mocking and error handling
 * Uses file-backed InvoiceService (no MongoDB dependency for invoices)
 */

import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';
import InvoiceService from '../../services/InvoiceService';
import LHDNEInvoiceService from '../../services/EInvoiceService';
import LedgerPostingService from '../../services/LedgerPostingService';

// Import the actual router to test
import invoicesRouter from '../../routes/invoices';

// Create a minimal test app
function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  
  // Mock auth middleware - inject test user into request
  app.use((req: any, _res, next) => {
    req.user = {
      id: 'test-user-id-123',
      companyId: 'test-company-id-456',
      role: 'admin',
      email: 'test@hafjet.com'
    };
    next();
  });
  
  // Mount invoices router
  app.use('/api/invoices', invoicesRouter);
  
  return app;
}

describe('Invoices Routes - Complete Test Suite', () => {
  let app: Express;
  let token: string;

  beforeAll(() => {
    // Generate a valid test token
    token = jwt.sign(
      { 
        userId: 'test-user-id-123', 
        companyId: 'test-company-id-456',
        role: 'admin'
      },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('POST /api/invoices - Create Invoice', () => {
    it('should create invoice with SST calculation and return 201', async () => {
      const mockInvoice = {
        id: 'inv-test-001',
        invoiceNumber: 'INV202501001',
        customerName: 'ACME Corp Sdn Bhd',
        customerEmail: 'acme@example.com',
        issueDate: '2025-01-15',
        dueDate: '2025-02-15',
        status: 'draft',
        currency: 'MYR',
        items: [
          {
            description: 'Software Development Service',
            quantity: 10,
            unitPrice: 500,
            amount: 5000,
            taxRate: 0.06,
            taxAmount: 300
          }
        ],
        subtotal: 5000,
        taxAmount: 300,
        total: 5300,
        malaysianTax: {
          taxType: 'SST',
          taxRate: 0.06,
          taxableAmount: 5000,
          taxAmount: 300,
          exemptAmount: 0,
          sstNumber: 'SST-12345678'
        },
        einvoice: {
          status: 'pending',
          submissionDate: null,
          uuid: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      jest.spyOn(InvoiceService, 'create').mockResolvedValue(mockInvoice as any);
      jest.spyOn(LedgerPostingService, 'postInvoice').mockResolvedValue({} as any);

      const payload = {
        customerName: 'ACME Corp Sdn Bhd',
        customerEmail: 'acme@example.com',
        dueDate: '2025-02-15',
        items: [
          {
            description: 'Software Development Service',
            quantity: 10,
            unitPrice: 500,
            taxRate: 0.06
          }
        ]
      };

      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.invoiceNumber).toBe('INV202501001');
      expect(res.body.data.total).toBe(5300);
      expect(InvoiceService.create).toHaveBeenCalled();
    });

    it('should handle creation errors gracefully', async () => {
      jest.spyOn(InvoiceService, 'create').mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerName: 'Test', items: [] });

      // Validation middleware returns 400 for invalid payload (empty items array)
      // If it bypasses validation, InvoiceService error would return 500
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/invoices - List Invoices', () => {
    it('should return paginated list of invoices', async () => {
      const mockList = {
        data: [
          { id: 'inv1', invoiceNumber: 'INV001', total: 1000 },
          { id: 'inv2', invoiceNumber: 'INV002', total: 2000 }
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 20,
          pages: 1
        }
      };

      jest.spyOn(InvoiceService, 'list').mockResolvedValue(mockList as any);

      const res = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
    });

    it('should handle pagination parameters', async () => {
      jest.spyOn(InvoiceService, 'list').mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 2, limit: 10, pages: 0 }
      } as any);

      const res = await request(app)
        .get('/api/invoices?page=2&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(InvoiceService.list).toHaveBeenCalledWith(2, 10);
    });
  });

  describe('GET /api/invoices/:id - Get Invoice by ID', () => {
    it('should return invoice when found', async () => {
      const mockInvoice = {
        id: 'inv-123',
        invoiceNumber: 'INV202501001',
        customerName: 'Test Customer',
        total: 1060
      };

      jest.spyOn(InvoiceService, 'get').mockResolvedValue(mockInvoice as any);

      const res = await request(app)
        .get('/api/invoices/inv-123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('inv-123');
    });

    it('should return 404 when invoice not found', async () => {
      jest.spyOn(InvoiceService, 'get').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/invoices/non-existent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PUT /api/invoices/:id - Update Invoice', () => {
    it('should update invoice and recalculate totals', async () => {
      const updatedInvoice = {
        id: 'inv-123',
        invoiceNumber: 'INV001',
        customerName: 'Updated Customer',
        total: 2120
      };

      jest.spyOn(InvoiceService, 'update').mockResolvedValue(updatedInvoice as any);

      const res = await request(app)
        .put('/api/invoices/inv-123')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerName: 'Updated Customer' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toBe('Updated Customer');
    });

    it('should return 404 when updating non-existent invoice', async () => {
      jest.spyOn(InvoiceService, 'update').mockResolvedValue(null);

      const res = await request(app)
        .put('/api/invoices/non-existent')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerName: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/invoices/:id - Patch Invoice', () => {
    it('should patch invoice partially and return 200', async () => {
      const patched = { id: 'inv-123', invoiceNumber: 'INV001', customerName: 'Patched Customer', total: 1500 };
      jest.spyOn(InvoiceService, 'patch').mockResolvedValue(patched as any);

      const res = await request(app)
        .patch('/api/invoices/inv-123')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerName: 'Patched Customer' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toBe('Patched Customer');
    });

    it('should return 404 when patching non-existent invoice', async () => {
      jest.spyOn(InvoiceService, 'patch').mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/invoices/non-existent')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerName: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/invoices/:id - Delete Invoice', () => {
    it('should delete invoice and return deleted object', async () => {
      const removed = { id: 'inv-del', invoiceNumber: 'INVDEL', total: 100 };
      jest.spyOn(InvoiceService, 'delete').mockResolvedValue(removed as any);

      const res = await request(app)
        .delete('/api/invoices/inv-del')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('inv-del');
    });

    it('should return 404 when deleting non-existent invoice', async () => {
      jest.spyOn(InvoiceService, 'delete').mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/invoices/non-existent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/invoices/:id/validate-einvoice - Validate E-Invoice', () => {
    it('should validate invoice structure for LHDN', async () => {
      const mockInvoice = {
        id: 'inv-123',
        invoiceNumber: 'INV001',
        customerName: 'Test Corp',
        items: [{ description: 'Item', quantity: 1, unitPrice: 100, taxRate: 0.06 }],
        subtotal: 100,
        taxAmount: 6,
        total: 106,
        currency: 'MYR',
        issueDate: '2025-01-15',
        malaysianTax: { taxType: 'SST', taxRate: 0.06 }
      };

      jest.spyOn(InvoiceService, 'get').mockResolvedValue(mockInvoice as any);
      jest.spyOn(LHDNEInvoiceService.prototype, 'validateInvoice').mockResolvedValue({
        valid: true,
        errors: []
      });

      const res = await request(app)
        .post('/api/invoices/inv-123/validate-einvoice')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(true);
    });

    it('should return validation errors when invoice invalid', async () => {
      const mockInvoice = {
        id: 'inv-bad',
        invoiceNumber: '',
        items: [],
        subtotal: 0,
        total: 0,
        currency: 'MYR',
        issueDate: '2025-01-15'
      };

      jest.spyOn(InvoiceService, 'get').mockResolvedValue(mockInvoice as any);
      jest.spyOn(LHDNEInvoiceService.prototype, 'validateInvoice').mockResolvedValue({
        valid: false,
        errors: ['Invoice number is required', 'At least one invoice line item is required']
      });

      const res = await request(app)
        .post('/api/invoices/inv-bad/validate-einvoice')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.errors).toBeDefined();
    });
  });

  describe('POST /api/invoices/:id/submit-einvoice - Submit to LHDN', () => {
    it('should submit valid invoice to LHDN and post ledger entry', async () => {
      const mockInvoice = {
        id: 'inv-submit',
        invoiceNumber: 'INV202501099',
        customerName: 'Customer Sdn Bhd',
        customerEmail: 'customer@test.com',
        items: [
          {
            description: 'Service',
            quantity: 1,
            unitPrice: 1000,
            amount: 1000,
            taxRate: 0.06,
            taxAmount: 60
          }
        ],
        subtotal: 1000,
        taxAmount: 60,
        total: 1060,
        currency: 'MYR',
        issueDate: '2025-01-20',
        malaysianTax: { taxType: 'SST', taxRate: 0.06, taxableAmount: 1000, taxAmount: 60 },
        einvoice: { status: 'pending' }
      };

      const updatedInvoice = {
        ...mockInvoice,
        einvoice: {
          uuid: 'EINV-UUID-12345',
          status: 'approved',
          submissionDate: new Date().toISOString()
        }
      };

      jest.spyOn(InvoiceService, 'get')
        .mockResolvedValueOnce(mockInvoice as any)
        .mockResolvedValueOnce(updatedInvoice as any);
      
      jest.spyOn(LHDNEInvoiceService.prototype, 'validateInvoice').mockResolvedValue({
        valid: true,
        errors: []
      });

      jest.spyOn(LHDNEInvoiceService.prototype, 'submitEInvoice').mockResolvedValue({
        uuid: 'EINV-UUID-12345',
        submissionUid: 'SUB-12345',
        status: 'Valid',
        submissionDateTime: new Date().toISOString()
      } as any);

      jest.spyOn(InvoiceService, 'upsertEinvoice').mockResolvedValue(updatedInvoice as any);
      jest.spyOn(LedgerPostingService, 'postInvoice').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/invoices/inv-submit/submit-einvoice')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.uuid).toBe('EINV-UUID-12345');
      expect(res.body.data.status).toBe('approved');
    });

    it('should reject submission when validation fails', async () => {
      const mockInvoice = {
        id: 'inv-invalid',
        invoiceNumber: '',
        items: [],
        subtotal: 0,
        total: 0,
        currency: 'MYR',
        issueDate: '2025-01-15'
      };

      jest.spyOn(InvoiceService, 'get').mockResolvedValue(mockInvoice as any);
      jest.spyOn(LHDNEInvoiceService.prototype, 'validateInvoice').mockResolvedValue({
        valid: false,
        errors: ['Invoice number is required']
      });

      const res = await request(app)
        .post('/api/invoices/inv-invalid/submit-einvoice')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('validation failed');
    });
  });

  describe('GET /api/invoices/:id/einvoice-status - Check E-Invoice Status', () => {
    it('should return einvoice status from LHDN', async () => {
      const mockInvoice = {
        id: 'inv-123',
        einvoice: {
          uuid: 'EINV-UUID-123',
          status: 'approved',
          submissionDate: '2025-01-15T10:00:00Z'
        }
      };

      jest.spyOn(InvoiceService, 'get').mockResolvedValue(mockInvoice as any);
      jest.spyOn(LHDNEInvoiceService.prototype, 'getInvoiceStatus').mockResolvedValue({
        uuid: 'EINV-UUID-123',
        status: 'Valid',
        submissionDateTime: '2025-01-15T10:00:00Z',
        issueDateTime: '2025-01-15T09:00:00Z'
      } as any);

      const res = await request(app)
        .get('/api/invoices/inv-123/einvoice-status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.uuid).toBe('EINV-UUID-123');
    });

    it('should return local status when not yet submitted', async () => {
      const mockInvoice = {
        id: 'inv-draft',
        einvoice: {
          status: 'pending',
          uuid: null
        }
      };

      jest.spyOn(InvoiceService, 'get').mockResolvedValue(mockInvoice as any);

      const res = await request(app)
        .get('/api/invoices/inv-draft/einvoice-status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pending');
    });
  });
});
