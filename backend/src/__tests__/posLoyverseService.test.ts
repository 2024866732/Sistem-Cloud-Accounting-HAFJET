import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock models
const sales: any[] = [];
const stores: any[] = [];

jest.mock('../models/PosSale', () => ({
  __esModule: true,
  default: {
    findOne: async (q: any) => sales.find(s => s.companyId === q.companyId && s.externalId === q.externalId) || null,
    create: async (doc: any) => { sales.push(doc); return doc; }
  }
}));

jest.mock('../models/StoreLocation', () => ({
  __esModule: true,
  default: {
    findOne: async (q: any) => stores.find(s => s.companyId === q.companyId && s.externalId === q.externalId) || null,
    create: async (doc: any) => { const r = { ...doc, _id: 'store1' }; stores.push(r); return r; }
  }
}));

// Mock PosSyncState to prevent real mongoose ObjectId casting
jest.mock('../models/PosSyncState', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(async () => null),
    create: jest.fn(async (doc: any) => ({ ...doc, _id: 'state1', lastSyncAt: new Date(), save: async () => {} }))
  }
}));

// Mock config to ensure API key present
jest.mock('../config/config', () => ({ config: { LOYVERSE_API_KEY: 'key', LOYVERSE_API_URL: 'https://mock', LOYVERSE_POLL_INTERVAL_SEC: 300 } }));

// Mock axios (not currently used for mock fetch but placeholder for future)
jest.mock('axios', () => ({ __esModule: true, default: { get: jest.fn(async () => ({ data: {} })) } }));

import { loyversePosService } from '../services/LoyversePosService';

describe('LoyversePosService', () => {
  beforeEach(() => { sales.length = 0; stores.length = 0; });

  it('normalizes and stores sale + refund', async () => {
    const res = await loyversePosService.syncRecentSales('company1');
    expect(res.created).toBe(2); // sale + refund sample
    expect(res.syncState).toBeDefined();
    const sale = sales.find(s => s.externalId === 'SAMPLE_SALE_1');
    const refund = sales.find(s => s.externalId === 'REFUND_1');
    expect(sale).toBeDefined();
    expect(refund).toBeDefined();
    expect(refund.type).toBe('refund');
    expect(refund.totalGross).toBeLessThan(0);
  });

  it('dedupes existing sale and refund by externalId', async () => {
    await loyversePosService.syncRecentSales('company1');
    const again = await loyversePosService.syncRecentSales('company1');
    expect(again.skipped).toBe(2); // both sale + refund skipped
    expect(again.syncState).toBeDefined();
  });
});
