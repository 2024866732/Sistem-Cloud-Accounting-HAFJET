// Loyverse Sync Logger
// Logs sync history, errors, and status for audit and troubleshooting

import fs from 'fs';
import path from 'path';

const LOG_PATH = path.join(__dirname, 'loyverse-sync.log');

export function logSyncEvent(event: string) {
  const entry = `[${new Date().toISOString()}] ${event}\n`;
  fs.appendFileSync(LOG_PATH, entry);
}

export function getSyncLog(): string[] {
  if (!fs.existsSync(LOG_PATH)) return [];
  return fs.readFileSync(LOG_PATH, 'utf-8').split('\n').filter(Boolean);
}
