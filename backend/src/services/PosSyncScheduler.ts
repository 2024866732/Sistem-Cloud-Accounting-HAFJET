import loyversePosService from './LoyversePosService';
import MetricsService from './MetricsService';
import { config } from '../config/config';

class PosSyncSchedulerClass {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  async runOnce(companyId: string, opts: { full?: boolean } = {}) {
    if (!loyversePosService.isEnabled()) return { skipped: true, reason: 'integration_disabled' };
    if (this.running) return { skipped: true, reason: 'already_running' };
    this.running = true;
    try {
      MetricsService.inc('pos.sync.scheduled_runs');
      const result = await loyversePosService.syncRecentSales(companyId, { full: opts.full });
      return { skipped: false, result };
    } catch (err) {
      MetricsService.inc('pos.sync.scheduled_errors');
      return { skipped: false, error: (err as Error).message };
    } finally {
      this.running = false;
    }
  }

  start(companyId: string) {
    if (!config.LOYVERSE_SYNC_SCHEDULER_ENABLED) return;
    if (this.timer) return;
    const intervalMs = (config.LOYVERSE_POLL_INTERVAL_SEC || 300) * 1000;
    this.timer = setInterval(() => {
      this.runOnce(companyId).catch(() => {});
    }, intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

export const PosSyncScheduler = new PosSyncSchedulerClass();
export default PosSyncScheduler;
