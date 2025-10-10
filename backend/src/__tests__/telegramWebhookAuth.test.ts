import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

// Env
process.env.TELEGRAM_BOT_TOKEN = 'TEST_TOKEN';

// Mock NotificationService to suppress side effects
jest.mock('../services/NotificationService', () => ({
  __esModule: true,
  default: { sendCompanyNotification: jest.fn(async () => {}) },
  NotificationService: { sendCompanyNotification: jest.fn(async () => {}) }
}));

// Mock TelegramIngestionService network calls
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(async (url: string, opts?: any) => {
      if (url.includes('getFile')) {
        return { data: { ok: true, result: { file_id: 'f', file_unique_id: 'fu', file_path: 'photos/a.jpg' } } };
      }
      if (url.includes('/file/')) {
        // Simulate binary download
        return { data: Buffer.from('JPEGDATA') };
      }
      throw new Error('Unexpected axios url');
    })
  }
}));

// Mock download inside service by overriding method after import

// Mock TelegramChatLink model
let links: any[] = [];
jest.mock('../models/TelegramChatLink', () => ({
  __esModule: true,
  default: {
    findOne: async (q: any) => links.find(l => l.chatId === q.chatId && l.active === q.active) || null,
    find: async (q: any) => links.filter(l => l.companyId === q.companyId),
    create: async (doc: any) => { const rec = { ...doc, _id: 'link1' }; links.push(rec); return rec; },
    findOneAndDelete: async (q: any) => { const idx = links.findIndex(l => l._id === q._id && l.companyId === q.companyId); if (idx>=0) { const [r] = links.splice(idx,1); return r; } return null; }
  }
}));

// Mock Receipt model for ingestion
jest.mock('../models/Receipt', () => ({
  __esModule: true,
  default: { create: async (doc: any) => ({ ...doc, _id: 'rphoto', extractionFields: [], save: async function() { return this; } }) },
  Receipt: { create: async (doc: any) => ({ ...doc, _id: 'rphoto', extractionFields: [], save: async function() { return this; } }) }
}));

import telegramRoute from '../routes/telegram.js';

const app = express();
app.use(bodyParser.json());
app.use('/api/telegram', telegramRoute);

describe('Telegram webhook chat link enforcement', () => {
  beforeAll(() => { links = []; });

  it('rejects unlinked chat', async () => {
    const update = { message: { chat: { id: 555 }, photo: [{ file_id: 'aaa' }] } };
    const res = await request(app).post('/api/telegram/webhook').send(update);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not linked/i);
  });

  it('allows linked chat', async () => {
    // Insert link
    links.push({ _id: 'link1', chatId: '777', companyId: '000000000000000000000001', active: true });
    const update = { message: { chat: { id: 777 }, photo: [{ file_id: 'bbb' }] } };
    const res = await request(app).post('/api/telegram/webhook').send(update);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
