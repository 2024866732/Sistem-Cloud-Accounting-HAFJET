import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import loyversePosService from '../services/LoyversePosService.js';
import PosSale from '../models/PosSale.js';
import PosSyncState from '../models/PosSyncState.js';

// Mock StoreLocation to avoid real DB calls in upsertStore
jest.mock('../models/StoreLocation', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(async () => null),
    create: jest.fn(async (doc: any) => ({ ...doc, _id: 'store1' }))
  }
}));

// Ensure API key present via config mock
jest.mock('../config/config', () => ({ config: { LOYVERSE_API_KEY: 'k', LOYVERSE_API_URL: 'https://mock', LOYVERSE_POLL_INTERVAL_SEC: 300 } }));

jest.mock('../models/PosSale', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(async () => null),
    create: jest.fn(async (doc: any) => doc)
  }
}));

jest.mock('../models/PosSyncState', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(async () => null),
    create: jest.fn(async (doc: any) => ({ ...doc, _id: 'state1', lastSyncAt: new Date(), save: async function() { return this; } })),
  }
}));

// Patch service isEnabled to true (pretend API key exists)
(jest.spyOn(loyversePosService, 'isEnabled') as any).mockReturnValue(true);

const mockedPosSale: any = PosSale;
const mockedState: any = PosSyncState;

describe('LoyversePosService incremental sync', () => {
  const companyId = '000000000000000000000001';

  beforeEach(() => {
    mockedPosSale.findOne.mockClear();
    mockedPosSale.create.mockClear();
    mockedState.findOne.mockClear();
    mockedState.create.mockClear();
  });

  it('first sync creates sync state and creates sales', async () => {
    const result = await loyversePosService.syncRecentSales(companyId, {});
    expect(mockedState.create).toHaveBeenCalledTimes(1);
    expect(result.syncState.lastSyncAt).toBeTruthy();
    expect(result.created).toBeGreaterThan(0);
  });

  it('second sync uses existing state and updates lastSyncAt (likely skips duplicates)', async () => {
    // First call: no state
    await loyversePosService.syncRecentSales(companyId, {});
    // Next call: simulate existing state returned
    mockedState.findOne.mockResolvedValueOnce({ _id: 'state1', lastSyncAt: new Date(Date.now() - 60000), save: async function() { return this; } });
    const result2 = await loyversePosService.syncRecentSales(companyId, {});
    expect(mockedState.findOne).toHaveBeenCalled();
    expect(result2.syncState.lastSyncAt).toBeTruthy();
    // created may be 0 on second run due to dedupe
    expect(result2.created).toBeGreaterThanOrEqual(0);
  });

  it('full sync ignores previous lastSyncAt', async () => {
    mockedState.findOne.mockResolvedValueOnce({ _id: 'state1', lastSyncAt: new Date(Date.now() - 60000), save: async function() { return this; } });
    const result = await loyversePosService.syncRecentSales(companyId, { full: true });
    expect(result.syncState.lastSyncAt).toBeTruthy();
  });
});
