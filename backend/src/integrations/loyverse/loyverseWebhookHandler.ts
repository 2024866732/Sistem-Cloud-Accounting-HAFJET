// Loyverse Webhook Handler
// Receives real-time events from Loyverse POS and triggers sync

import express from 'express';
import { runLoyverseSyncJob } from './loyverseSyncJob.js';
import { LoyverseSyncService } from './loyverseSyncService.js';

const router = express.Router();

router.post('/loyverse/webhook', async (req, res) => {
  // Validate webhook signature if required
  // Extract event type and payload
  const event = req.body;
  // TODO: Add event type filtering and mapping

  // Trigger sync job for affected data
  const service = new LoyverseSyncService(process.env.LOYVERSE_CLIENT_ID!, process.env.LOYVERSE_CLIENT_SECRET!, process.env.LOYVERSE_REDIRECT_URI!);
  await runLoyverseSyncJob(service);

  res.status(200).json({ success: true });
});

export default router;
