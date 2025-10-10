import { describe, it, expect, beforeEach } from '@jest/globals';
import MetricsService from '../services/MetricsService.js';

describe('MetricsService', () => {
  beforeEach(() => {
    MetricsService.reset();
  });

  it('increments and snapshots counters', () => {
    MetricsService.inc('pos.sync.created');
    MetricsService.inc('pos.sync.created', 2);
    MetricsService.inc('pos.post.success');
    const snap = MetricsService.snapshot();
    expect(snap.counters['pos.sync.created']).toBe(3);
    expect(snap.counters['pos.post.success']).toBe(1);
  });

  it('resets specific counter', () => {
    MetricsService.inc('a', 5);
    MetricsService.reset('a');
    const snap = MetricsService.snapshot();
    expect(snap.counters['a']).toBeUndefined();
  });
});
