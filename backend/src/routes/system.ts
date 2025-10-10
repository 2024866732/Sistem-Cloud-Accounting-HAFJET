import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import MetricsService from '../services/MetricsService.js';
import { config } from '../config/config.js';

const router = Router();

router.get('/metrics', authenticateToken, authorize('system.metrics'), audit({ action: 'system.metrics.view', entityType: 'Metric', captureBody: false }), (req, res) => {
  const snapshot = MetricsService.snapshot();
  res.json({ success: true, data: snapshot });
});

// Prometheus exposition format (basic #: no HELP/TYPE lines for brevity)
router.get('/metrics/prom', (req, res) => {
  if (!config.METRICS_PROM_ENABLED) {
    return res.status(404).send('');
  }
  const snap = MetricsService.snapshot();
  const lines: string[] = [];
  for (const [k, v] of Object.entries(snap.counters)) {
    const metricName = k.replace(/[^a-zA-Z0-9_]/g, '_');
    lines.push(`${metricName} ${v}`);
  }
  res.type('text/plain').send(lines.join('\n') + '\n');
});

export default router;
