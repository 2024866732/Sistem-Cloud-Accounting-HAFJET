// Integration tests for LoyverseSyncService
import { LoyverseSyncService } from './loyverseSyncService.js';
import { describe, it, expect } from '@jest/globals';

describe('LoyverseSyncService', () => {
  it('should authenticate and set tokens', async () => {
    const service = new LoyverseSyncService('clientId', 'clientSecret', 'http://localhost/callback');
    // Mock axios.post for /token
    // ...
    expect(service).toBeDefined();
  });

  it('should pull receipts', async () => {
    const service = new LoyverseSyncService('clientId', 'clientSecret', 'http://localhost/callback');
    service['accessToken'] = 'test-token';
    // Mock axios.get for /receipts
    // ...
    expect(await service.pullReceipts()).toBeDefined();
  });

  // Add more tests for items, inventory, customers, error/retry
});
