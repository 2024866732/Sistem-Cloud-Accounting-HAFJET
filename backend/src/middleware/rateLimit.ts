import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

interface Bucket {
  count: number;
  reset: number; // epoch ms
}

const buckets: Map<string, Bucket> = new Map();

export function telegramRateLimit() {
  const max = config.TELEGRAM_WEBHOOK_RATE_LIMIT || 60;
  const windowSec = config.TELEGRAM_WEBHOOK_RATE_WINDOW_SEC || 60;
  return (req: Request & { rateLimitKey?: string }, res: Response, next: NextFunction) => {
    const chatId = req.body?.message?.chat?.id || req.body?.edited_message?.chat?.id;
    const key = `tg:${chatId || req.ip}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.reset < now) {
      bucket = { count: 0, reset: now + windowSec * 1000 };
      buckets.set(key, bucket);
    }
    bucket.count++;
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(bucket.reset/1000)));
    if (bucket.count > max) {
      return res.status(429).json({ success: false, message: 'Rate limit exceeded', retryAfterSec: Math.ceil((bucket.reset - now)/1000) });
    }
    return next();
  };
}

export default telegramRateLimit;

// Test helper to clear buckets between tests
export function __resetTelegramRateLimiter() {
  buckets.clear();
}
