import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { audit } from '../middleware/audit';
import Receipt from '../models/Receipt';
import { ocrService } from '../services/OcrService';
import { receiptClassificationService } from '../services/ReceiptClassificationService';
import { receiptPostingService } from '../services/ReceiptPostingService';
import NotificationService from '../services/NotificationService';

// Ensure uploads directory exists (local demo). In production swap to S3 or similar.
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e6);
    cb(null, unique + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_'));
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['image/png','image/jpeg','application/pdf'];
  if (!allowed.includes(file.mimetype)) return cb(new Error('Unsupported file type'));
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post('/upload', authenticateToken, authorize('invoice.create'), upload.single('file'), audit({ action: 'receipt.upload', entityType: 'Receipt', captureBody: false }), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { originalname, mimetype, size, filename } = req.file;
    // Compute file hash (sha256) for dedupe
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Simple currency & metadata from body (optional client hints)
    const { currency, documentDate } = req.body;

    const receipt = await Receipt.create({
      companyId: req.user.companyId,
      userId: req.user.id,
      originalFilename: originalname,
      storagePath: path.relative(process.cwd(), req.file.path),
      mimeType: mimetype,
      size,
      hash,
      currency: currency || 'MYR',
      documentDate: documentDate ? new Date(documentDate) : undefined,
      status: 'uploaded'
    });
    // Fire notification (company scope + direct user for quick feedback)
    try {
      await NotificationService.sendCompanyNotification(req.user.companyId, {
        type: 'receipt_uploaded',
        title: 'Receipt Uploaded',
        message: `${receipt.originalFilename} dimuat naik untuk pemprosesan`,
        priority: 'low',
        companyId: req.user.companyId,
        data: { receiptId: String(receipt._id), action: 'uploaded' }
      });
      await NotificationService.sendNotification(req.user.id, {
        type: 'receipt_uploaded',
        title: 'Muat Naik Berjaya',
        message: 'Resit berjaya dimuat naik dan sedia untuk OCR',
        priority: 'medium',
        companyId: req.user.companyId,
        data: { receiptId: String(receipt._id) }
      });
    } catch (notifyErr) {
      console.warn('Failed to send receipt upload notification:', notifyErr);
    }

    res.status(201).json({ success: true, data: receipt });
  } catch (err: any) {
    console.error('Receipt upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

// Basic list endpoint for recently uploaded receipts
router.get('/', authenticateToken, authorize('invoice.view'), async (req: any, res) => {
  try {
    const receipts = await Receipt.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: receipts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list receipts' });
  }
});

// Trigger OCR processing for a specific receipt
router.post('/:id/ocr', authenticateToken, authorize('receipt.ocr'), audit({ action: 'receipt.ocr', entityType: 'Receipt', entityIdParam: 'id' }), async (req: any, res) => {
  try {
    const { id } = req.params;
    const receipt = await Receipt.findOne({ _id: id, companyId: req.user.companyId });
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (receipt.status !== 'uploaded') return res.status(400).json({ success: false, message: 'Receipt not in uploaded state' });

    const processed = await ocrService.processReceipt(id);
    // Notify when OCR processed
    try {
      await NotificationService.sendCompanyNotification(req.user.companyId, {
        type: 'receipt_ocr_processed',
        title: 'OCR Selesai',
        message: `Teks diekstrak untuk ${receipt.originalFilename}`,
        priority: 'low',
        companyId: req.user.companyId,
        data: { receiptId: String(processed._id), status: processed.status }
      });
    } catch (notifyErr) {
      console.warn('Failed to send OCR processed notification:', notifyErr);
    }
    res.json({ success: true, data: processed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'OCR failed' });
  }
});

// Trigger AI classification after OCR
router.post('/:id/classify', authenticateToken, authorize('receipt.classify'), audit({ action: 'receipt.classify', entityType: 'Receipt', entityIdParam: 'id' }), async (req: any, res) => {
  try {
    const { id } = req.params;
    const receipt = await Receipt.findOne({ _id: id, companyId: req.user.companyId });
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (receipt.status !== 'ocr_processed') return res.status(400).json({ success: false, message: 'Receipt not OCR processed yet' });
    const classified = await receiptClassificationService.classify(id);
    // Notify classification result & ready for review
    try {
      await NotificationService.sendCompanyNotification(req.user.companyId, {
        type: 'receipt_ready_review',
        title: 'Resit Sedia Untuk Semakan',
        message: `${classified.vendorName || 'Resit'} perlu semakan sebelum posting`,
        priority: 'medium',
        companyId: req.user.companyId,
        data: { receiptId: String(classified._id), status: classified.status, category: classified.category }
      });
    } catch (notifyErr) {
      console.warn('Failed to send receipt ready review notification:', notifyErr);
    }
    res.json({ success: true, data: classified });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Classification failed' });
  }
});

// Approve and create ledger draft from receipt
router.post('/:id/approve', authenticateToken, authorize('receipt.review'), audit({ action: 'receipt.approve', entityType: 'Receipt', entityIdParam: 'id' }), async (req: any, res) => {
  try {
    const { id } = req.params;
    // Allow overrides from request body (manual corrections before posting)
    const { vendorName, grossAmount, taxAmount, netAmount, category } = req.body || {};
    const receipt = await Receipt.findOne({ _id: id, companyId: req.user.companyId });
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (!['review_pending','approved'].includes(receipt.status)) return res.status(400).json({ success: false, message: 'Receipt not in review_pending state' });

    if (vendorName) receipt.vendorName = vendorName;
    if (grossAmount !== undefined) receipt.grossAmount = Number(grossAmount);
    if (taxAmount !== undefined) receipt.taxAmount = Number(taxAmount);
    if (netAmount !== undefined) receipt.netAmount = Number(netAmount);
    if (category) receipt.category = category;
    await receipt.save();

    const { ledger } = await receiptPostingService.postFromReceipt(id, req.user.id);
    // Notify approval & draft ledger creation
    try {
      await NotificationService.sendCompanyNotification(req.user.companyId, {
        type: 'receipt_approved',
        title: 'Resit Diluluskan',
        message: `${receipt.vendorName || 'Resit'} diluluskan & jurnal draf dibuat`,
        priority: 'medium',
        companyId: req.user.companyId,
        data: { receiptId: String(receipt._id), ledgerId: ledger?._id ? String(ledger._id) : undefined }
      });
    } catch (notifyErr) {
      console.warn('Failed to send receipt approved notification:', notifyErr);
    }
    res.json({ success: true, data: { receipt, ledger } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Approval failed' });
  }
});

export default router;