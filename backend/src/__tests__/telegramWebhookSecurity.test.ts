import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

process.env.TELEGRAM_BOT_TOKEN = 'TEST_TOKEN';
process.env.TELEGRAM_WEBHOOK_SECRET = 'S3CRET';
process.env.TELEGRAM_WEBHOOK_RATE_LIMIT = '3';
process.env.TELEGRAM_WEBHOOK_RATE_WINDOW_SEC = '60';

// Mock NotificationService
jest.mock('../services/NotificationService', () => ({
  __esModule: true,
  default: { sendCompanyNotification: jest.fn(async () => {}) }
}));

// Mock axios for file metadata + download
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(async (url: string) => {
      if (url.includes('getFile')) {
        return { data: { ok: true, result: { file_id: 'x', file_unique_id: 'u', file_path: 'photos/a.jpg' } } };
      }
      if (url.includes('/file/')) return { data: Buffer.from('JPEGDATA') };
      throw new Error('Unexpected axios url');
    })
  }
}));

// Mock TelegramChatLink so chat is recognized
jest.mock('../models/TelegramChatLink', () => ({
  __esModule: true,
  default: {
    findOne: async (q: any) => (q.chatId === '999' ? { _id: 'lk', chatId: '999', companyId: '000000000000000000000001', active: true } : null)
  }
}));

// Mock Receipt
jest.mock('../models/Receipt', () => ({ __esModule: true, default: { create: async (d: any) => ({ ...d, _id: 'r1' }) } }));

import telegramRoute from '../routes/telegram.js';
import { __resetTelegramRateLimiter } from '../middleware/rateLimit.js';

const app = express();
app.use(bodyParser.json());
app.use('/api/telegram', telegramRoute);

const baseUpdate = { message: { chat: { id: 999 }, photo: [{ file_id: 'x' }] } };

describe('Telegram webhook security', () => {
  beforeEach(() => {
    __resetTelegramRateLimiter();
  });

  it('rejects when secret missing', async () => {
    const res = await request(app).post('/api/telegram/webhook').send(baseUpdate);
    expect(res.status).toBe(401);
  });

  it('accepts when secret provided', async () => {
    const res = await request(app).post('/api/telegram/webhook').set('X-Telegram-Secret', 'S3CRET').send(baseUpdate);
    expect(res.status).toBe(200);
  });

  it('enforces rate limit after threshold', async () => {
    // 1st
    await request(app).post('/api/telegram/webhook').set('X-Telegram-Secret', 'S3CRET').send(baseUpdate);
    // 2nd
    await request(app).post('/api/telegram/webhook').set('X-Telegram-Secret', 'S3CRET').send(baseUpdate);
    // 3rd (still allowed)
    const third = await request(app).post('/api/telegram/webhook').set('X-Telegram-Secret', 'S3CRET').send(baseUpdate);
    expect(third.status).toBe(200);
    // 4th should be blocked
    const fourth = await request(app).post('/api/telegram/webhook').set('X-Telegram-Secret', 'S3CRET').send(baseUpdate);
    expect(fourth.status).toBe(429);
  });
});
