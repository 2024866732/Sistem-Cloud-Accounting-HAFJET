import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import path from 'path';
import fs from 'fs';

process.env.TELEGRAM_BOT_TOKEN = 'TEST_TOKEN';
process.env.UPLOAD_PATH = path.join(process.cwd(), 'uploads');

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(async (url: string) => {
      if (url.includes('getFile')) {
        return { data: { ok: true, result: { file_id: 'file123', file_unique_id: 'uniq', file_path: 'docs/sample.pdf', file_size: 1000 } } };
      }
      if (url.includes('/file/')) {
        return { data: Buffer.from('%PDF-1.4 test pdf bytes') };
      }
      throw new Error('Unexpected axios.get url ' + url);
    })
  }
}));

jest.mock('../models/Receipt', () => {
  const receipts: any[] = [];
  return {
    __esModule: true,
    default: {
      create: async (doc: any) => {
        const r = { ...doc, _id: 'r1', save: async function() { return this; } };
        receipts.push(r);
        return r;
      }
    },
    Receipt: {
      create: async (doc: any) => {
        const r = { ...doc, _id: 'r1', save: async function() { return this; } };
        receipts.push(r);
        return r;
      }
    }
  };
});

jest.mock('../services/NotificationService', () => ({
  __esModule: true,
  default: { sendCompanyNotification: jest.fn(async () => {}) },
  NotificationService: { sendCompanyNotification: jest.fn(async () => {}) }
}));

import { telegramIngestionService } from '../services/TelegramIngestionService';

describe('TelegramIngestionService document ingestion', () => {
  beforeAll(() => {
    if (!fs.existsSync(process.env.UPLOAD_PATH!)) fs.mkdirSync(process.env.UPLOAD_PATH!, { recursive: true });
  });

  it('ingests a Telegram document (PDF) and creates a receipt', async () => {
    const message: any = {
      chat: { id: 12345 },
      document: { file_id: 'file123', mime_type: 'application/pdf', file_name: 'invoice.pdf' }
    };
    const receipt: any = await telegramIngestionService.ingestDocumentMessage(message, '000000000000000000000001');
    expect(receipt).toBeDefined();
    expect(receipt.mimeType).toBe('application/pdf');
    expect(receipt.meta?.source).toBe('telegram');
    expect(receipt.status).toBe('uploaded');
  });
});
