import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// In-memory sales & stores for mocking
const sales: any[] = [];
const stores: any[] = [];
let notificationCalls: any[] = [];

jest.mock('../models/PosSale', () => ({
  __esModule: true,
  default: {
    findOne: async (q: any) => sales.find(s => s.companyId === q.companyId && s.externalId === q.externalId) || null,
    create: async (doc: any) => {
      if (doc.externalId === 'ERROR_SIM' || doc.externalId === 'ERROR_SIM2') throw new Error('forced');
      sales.push(doc);
      return doc;
    }
  }
}));

jest.mock('../models/StoreLocation', () => ({
  __esModule: true,
  default: {
    findOne: async (q: any) => stores.find(s => s.companyId === q.companyId && s.externalId === q.externalId) || null,
    create: async (doc: any) => { const r = { ...doc, _id: 'store1' }; stores.push(r); return r; }
  }
}));

jest.mock('../models/PosSyncState', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(async () => null),
    create: jest.fn(async (doc: any) => ({ ...doc, _id: 'state1', lastSyncAt: new Date(), save: async () => {} }))
  }
}));

// Force config with API key and low alert threshold
jest.mock('../config/config', () => ({ config: { LOYVERSE_API_KEY: 'k', LOYVERSE_API_URL: 'https://mock', POS_SYNC_ERROR_ALERT_THRESHOLD: 2 } }));

// Mock MetricsService to accumulate counters
const counters: Record<string, number> = {};
jest.mock('../services/MetricsService', () => ({
  __esModule: true,
  default: {
    inc: (k: string, v = 1) => { counters[k] = (counters[k] || 0) + v; },
    snapshot: () => ({ counters: { ...counters } }),
    reset: () => { for (const k of Object.keys(counters)) delete counters[k]; }
  }
}));

jest.mock('../services/NotificationService', () => ({
  __esModule: true,
  default: {
    sendCompanyNotification: async (_companyId: string, payload: any) => { notificationCalls.push(payload); }
  }
}));

// Patch Loyverse service raw fetch to inject failing items
import { LoyversePosService } from '../services/LoyversePosService.js';

const svc = new LoyversePosService();

// Monkey patch private method via index access
(svc as any).fetchRecentRawSales = async () => [
  { id: 'OK1', store_id: 'S1', datetime: new Date().toISOString(), items: [{ line:1, name:'A', qty:1, price:10 }] },
  { id: 'ERROR_SIM', store_id: 'S1', datetime: new Date().toISOString(), items: [{ line:1, name:'B', qty:1, price:5 }] },
  { id: 'ERROR_SIM2', store_id: 'S1', datetime: new Date().toISOString(), items: [{ line:1, name:'C', qty:1, price:2 }] }
];

describe('POS Sync Error Spike Alert', () => {
  beforeEach(() => { sales.length = 0; stores.length = 0; notificationCalls = []; for (const k of Object.keys(counters)) delete counters[k]; });

  it('emits system alert when error delta >= threshold', async () => {
  const res = await svc.syncRecentSales('comp1');
  expect(res.errors).toBe(2); // two errors thrown
    expect(notificationCalls.length).toBe(1);
    const notif = notificationCalls[0];
    expect(notif.title).toMatch(/Error Spike/);
    expect(notif.data.delta).toBe(2);
    expect(notif.type).toBe('system_alert');
  });

  it('does not emit alert when errors below threshold', async () => {
    // Lower threshold not changed, so craft 1 error only
    (svc as any).fetchRecentRawSales = async () => [
      { id: 'ONLY_ONE_ERR', store_id: 'S1', datetime: new Date().toISOString(), items: [{ line:1, name:'B', qty:1, price:5 }] },
      { id: 'OK2', store_id: 'S1', datetime: new Date().toISOString(), items: [{ line:1, name:'A', qty:1, price:10 }] }
    ];
    // Adjust model mock to throw on ONLY_ONE_ERR
    const PosSaleMock = require('../models/PosSale').default;
    PosSaleMock.create = async (doc: any) => { sales.push(doc); if (doc.externalId === 'ONLY_ONE_ERR') throw new Error('forced'); return doc; };
    const res = await svc.syncRecentSales('comp1');
    expect(res.errors).toBe(1);
    expect(notificationCalls.length).toBe(0);
  });
});
