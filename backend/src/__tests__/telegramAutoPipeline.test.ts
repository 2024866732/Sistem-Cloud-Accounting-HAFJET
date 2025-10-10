import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

process.env.TELEGRAM_BOT_TOKEN = 'TEST_TOKEN';
process.env.TELEGRAM_AUTO_OCR = 'true';
process.env.TELEGRAM_AUTO_CLASSIFY = 'true';

// Mock NotificationService
jest.mock('../services/NotificationService', () => ({
  __esModule: true,
  default: { sendCompanyNotification: jest.fn(async () => {}) }
}));

// Mock TelegramChatLink
jest.mock('../models/TelegramChatLink', () => ({
  __esModule: true,
  default: {
    findOne: async (q: any) => (q.chatId === '222' ? { _id: 'lk', chatId: '222', companyId: '000000000000000000000001', active: true } : null)
  }
}));

// In-memory receipt store for state transitions
const receipts: any[] = [];

jest.mock('../models/Receipt', () => ({
  __esModule: true,
  default: {
    create: async (doc: any) => { const r = { ...doc, _id: 'r_auto', extractionFields: [], save: async function() { return this; } }; receipts.push(r); return r; },
    findById: async (id: string) => receipts.find(r => r._id === id) || null
  },
  Receipt: {
    findById: async (id: string) => receipts.find(r => r._id === id) || null
  }
}));

// Mock axios for Telegram file fetch
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(async (url: string) => {
      if (url.includes('getFile')) return { data: { ok: true, result: { file_id: 'f', file_unique_id: 'u', file_path: 'photos/a.jpg' } } };
      if (url.includes('/file/')) return { data: Buffer.from('JPEGDATA') };
      throw new Error('Unexpected url');
    })
  }
}));

// Make OCR and classification deterministic for the test
jest.mock('../services/OcrService', () => ({
  __esModule: true,
  ocrService: {
    processReceipt: jest.fn(async (id: string) => {
      const r = receipts.find(x => x._id === id);
      if (r) { r.status = 'ocr_processed'; return r; }
      return null;
    })
  }
}));
jest.mock('../services/ReceiptClassificationService', () => ({
  __esModule: true,
  receiptClassificationService: {
    classify: jest.fn(async (id: string) => {
      const r = receipts.find(x => x._id === id);
      if (r) { r.status = 'review_pending'; return r; }
      return null;
    })
  }
}));

import telegramRoute from '../routes/telegram.js';
import { ocrService } from '../services/OcrService.js';
import { receiptClassificationService } from '../services/ReceiptClassificationService.js';

const app = express();
app.use(bodyParser.json());
app.use('/api/telegram', telegramRoute);

const baseUpdate = { message: { chat: { id: 222 }, photo: [{ file_id: 'f' }] } };

describe('Telegram auto pipeline', () => {
  beforeAll(() => {
    receipts.length = 0;
  });

  it('runs OCR and classification automatically producing review_pending status', async () => {
    const res = await request(app).post('/api/telegram/webhook').send(baseUpdate);
    expect(res.status).toBe(200);
    const r = receipts[0];
    expect(r).toBeDefined();
    // Ensure OCR and classification services were invoked for the uploaded receipt
    expect(ocrService.processReceipt).toHaveBeenCalledWith(r._id);
    expect(receiptClassificationService.classify).toHaveBeenCalledWith(r._id);
  });
});
