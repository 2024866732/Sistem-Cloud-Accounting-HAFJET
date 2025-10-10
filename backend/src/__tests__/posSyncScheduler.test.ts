import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PosSyncScheduler from '../services/PosSyncScheduler.js';
import loyversePosService from '../services/LoyversePosService.js';
import MetricsService from '../services/MetricsService.js';

jest.mock('../services/LoyversePosService', () => ({
  __esModule: true,
  default: {
    isEnabled: jest.fn(() => true),
    syncRecentSales: jest.fn(async () => ({ created: 1, skipped: 0, errors: 0, syncState: { lastSyncAt: new Date() } }))
  }
}));

describe('PosSyncScheduler', () => {
  const companyId = '000000000000000000000001';

  beforeEach(() => {
    MetricsService.reset();
  });

  it('runOnce executes sync and increments metrics', async () => {
    const res = await PosSyncScheduler.runOnce(companyId);
    expect(res.skipped).toBe(false);
    expect(MetricsService.get('pos.sync.scheduled_runs')).toBe(1);
  });

  it('prevents overlapping runs', async () => {
    let resolveFn: any;
    (loyversePosService.syncRecentSales as any).mockImplementationOnce(() => new Promise(r => { resolveFn = r; }));
    const first = PosSyncScheduler.runOnce(companyId);
    const second = await PosSyncScheduler.runOnce(companyId);
    expect(second.skipped).toBe(true);
    resolveFn({ created: 0, skipped: 0, errors: 0, syncState: { lastSyncAt: new Date() } });
    await first;
  });
});
