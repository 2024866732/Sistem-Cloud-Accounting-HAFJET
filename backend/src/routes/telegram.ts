import { Router } from 'express';
import { telegramIngestionService } from '../services/TelegramIngestionService';
import NotificationService from '../services/NotificationService';
import TelegramChatLink from '../models/TelegramChatLink';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { audit } from '../middleware/audit';
import { telegramRateLimit } from '../middleware/rateLimit';
import { config } from '../config/config';
import { ocrService } from '../services/OcrService';
import { receiptClassificationService } from '../services/ReceiptClassificationService';

// NOTE: This webhook is unauthenticated except for optional chat allowlist.
// Recommend reverse proxy IP filtering + secret token query param in production.
const router = Router();

router.post('/webhook', telegramRateLimit(), async (req: any, res) => {
  try {
    // Optional shared secret validation
    if (config.TELEGRAM_WEBHOOK_SECRET) {
      const provided = req.headers['x-telegram-secret'] || req.query.secret;
      if (provided !== config.TELEGRAM_WEBHOOK_SECRET) {
        return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
      }
    }
    if (!telegramIngestionService.isEnabled()) {
      return res.status(503).json({ success: false, message: 'Telegram integration disabled' });
    }
    const update = req.body;
    const message = update.message || update.edited_message;
    if (!message) return res.json({ success: true });
    const chatId = String(message.chat?.id || '');
    if (!telegramIngestionService.isChatAllowed(chatId)) {
      return res.status(403).json({ success: false, message: 'Chat not allowlisted (env filter)' });
    }
    // Enforce chat mapping existence
    const link = await TelegramChatLink.findOne({ chatId, active: true });
    if (!link) {
      return res.status(403).json({ success: false, message: 'Chat not linked. Admin must create link before ingestion.' });
    }
    const defaultCompany = link.companyId;
    let uploaded = null;
    try {
      const companyIdStr = String(defaultCompany);
      if (message.photo) {
        uploaded = await telegramIngestionService.ingestPhotoMessage(message, companyIdStr, undefined);
      } else if (message.document) {
        uploaded = await telegramIngestionService.ingestDocumentMessage(message, companyIdStr, undefined);
      }
    } catch (ingestErr: any) {
      await NotificationService.sendCompanyNotification(String(defaultCompany), {
        type: 'system_alert',
        title: 'Telegram Dokumen Gagal',
        message: ingestErr.message || 'Ralat memproses dokumen',
        priority: 'medium',
        companyId: String(defaultCompany),
        data: { chatId, error: ingestErr.message }
      });
      return res.status(400).json({ success: false, message: ingestErr.message });
    }
    if (!uploaded) {
      await NotificationService.sendCompanyNotification(String(defaultCompany), {
        type: 'system_alert',
        title: 'Telegram Update',
        message: 'Mesej tanpa lampiran diskip',
        priority: 'low',
        companyId: String(defaultCompany),
        data: { kind: 'unsupported', chatId }
      });
    }
    // Auto pipeline (best-effort) if enabled
    if (uploaded && config.TELEGRAM_AUTO_OCR) {
      try {
        const processed = await ocrService.processReceipt(String(uploaded._id));
        await NotificationService.sendCompanyNotification(String(defaultCompany), {
          type: 'receipt_ocr_processed',
          title: 'OCR (Telegram)',
          message: 'Resit auto OCR selesai',
          priority: 'low',
          companyId: String(defaultCompany),
          data: { receiptId: String(processed._id) }
        });
        if (config.TELEGRAM_AUTO_CLASSIFY) {
          const classified = await receiptClassificationService.classify(String(uploaded._id));
            await NotificationService.sendCompanyNotification(String(defaultCompany), {
              type: 'receipt_ready_review',
              title: 'Resit Sedia (Auto)',
              message: 'Resit siap untuk semakan',
              priority: 'medium',
              companyId: String(defaultCompany),
              data: { receiptId: String(classified._id), status: classified.status }
            });
        }
      } catch (autoErr: any) {
        await NotificationService.sendCompanyNotification(String(defaultCompany), {
          type: 'system_alert',
          title: 'Auto Proses Gagal',
          message: autoErr.message || 'Ralat auto OCR/classify',
          priority: 'medium',
          companyId: String(defaultCompany),
          data: { receiptId: String(uploaded._id), error: autoErr.message }
        });
      }
    }
    res.json({ success: true, data: uploaded ? { receiptId: uploaded._id } : null });
  } catch (err: any) {
    console.error('Telegram webhook error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Webhook error' });
  }
});

// --- Administrative Chat Link Management ---
// List links for current company
router.get('/links', authenticateToken, authorize('admin.manage_users'), async (req: any, res) => {
  try {
    const links = await TelegramChatLink.find({ companyId: req.user.companyId }).lean();
    res.json({ success: true, data: links });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to list links' });
  }
});

// Create link
router.post('/links', authenticateToken, authorize('admin.manage_users'), audit({ action: 'telegram.link.create', entityType: 'TelegramChatLink', captureBody: true }), async (req: any, res) => {
  try {
    const { chatId, defaultUserId, meta } = req.body || {};
    if (!chatId) return res.status(400).json({ success: false, message: 'chatId required' });
    const existing = await TelegramChatLink.findOne({ chatId, companyId: req.user.companyId });
    if (existing) return res.status(409).json({ success: false, message: 'Link already exists' });
    const link = await TelegramChatLink.create({ chatId: String(chatId), companyId: req.user.companyId, defaultUserId, meta });
    res.status(201).json({ success: true, data: link });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create link' });
  }
});

// Delete link
router.delete('/links/:id', authenticateToken, authorize('admin.manage_users'), audit({ action: 'telegram.link.delete', entityType: 'TelegramChatLink', entityIdParam: 'id' }), async (req: any, res) => {
  try {
    const { id } = req.params;
    const link = await TelegramChatLink.findOneAndDelete({ _id: id, companyId: req.user.companyId });
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    res.json({ success: true, data: { id } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete link' });
  }
});

export default router;