import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/*
 * Central configuration schema with validation & defaults.
 * Future additions (queue, ML, integrations) defined here to avoid scattered process.env access.
 */
const ConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().url().or(z.string().regex(/^mongodb/)).default('mongodb://localhost:27017/hafjet-bukku'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET too short').default('change-me-in-production-please'),
  JWT_EXPIRE: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),

  // LHDN E-Invoice
  LHDN_API_URL: z.string().url().default('https://api.myinvois.hasil.gov.my'),
  LHDN_API_KEY: z.string().optional(),
  LHDN_CLIENT_ID: z.string().optional(),
  LHDN_CLIENT_SECRET: z.string().optional(),

  // Exchange
  EXCHANGE_RATE_API_URL: z.string().url().default('https://api.exchangerate-api.com/v4/latest'),
  EXCHANGE_RATE_API_KEY: z.string().optional(),

  // File / uploads
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(10 * 1024 * 1024), // 10MB
  UPLOAD_PATH: z.string().default('./uploads'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().int().positive().max(15).default(12),

  // Pagination
  DEFAULT_PAGE_SIZE: z.coerce.number().int().positive().max(500).default(20),
  MAX_PAGE_SIZE: z.coerce.number().int().positive().max(1000).default(100),

  // Tax (constants; still included for central reference)
  SST_RATE: z.coerce.number().default(0.06),
  GST_RATE: z.coerce.number().default(0.06),

  NODE_ENV: z.enum(['development','test','production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // --- New planned variables (stubs) ---
  OCR_PROVIDER: z.string().default('mock'),
  AI_MODEL: z.string().default('rules_v1'),
  QUEUE_DRIVER: z.enum(['memory','redis']).default('memory'),
  REDIS_URL: z.string().url().default('http://localhost:6379').or(z.string().startsWith('redis://').default('redis://localhost:6379')),
  AUTO_APPROVE_MAX_AMOUNT: z.coerce.number().positive().default(200),
  ENABLE_RECEIPT_NOTIFICATIONS: z.coerce.boolean().default(true),

  // Telegram / POS (future integration placeholders)
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ALLOWED_CHAT_IDS: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  TELEGRAM_WEBHOOK_RATE_LIMIT: z.coerce.number().int().positive().default(60), // max requests per window
  TELEGRAM_WEBHOOK_RATE_WINDOW_SEC: z.coerce.number().int().positive().default(60),
  TELEGRAM_AUTO_OCR: z.coerce.boolean().default(false),
  TELEGRAM_AUTO_CLASSIFY: z.coerce.boolean().default(false),
  LOYVERSE_API_KEY: z.string().optional(),
  LOYVERSE_API_URL: z.string().url().default('https://api.loyverse.com'),
  LOYVERSE_POLL_INTERVAL_SEC: z.coerce.number().int().positive().default(300),
  LOYVERSE_SYNC_SCHEDULER_ENABLED: z.coerce.boolean().default(true)
  ,METRICS_PROM_ENABLED: z.coerce.boolean().default(false)
  ,POS_SYNC_ERROR_ALERT_THRESHOLD: z.coerce.number().int().nonnegative().default(5)
});

type AppConfig = z.infer<typeof ConfigSchema>;

function loadConfig(): AppConfig {
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Configuration validation failed:');
    for (const issue of parsed.error.issues) {
      console.error(` - ${issue.path.join('.')}: ${issue.message}`);
    }
    // During test runs we prefer sensible defaults to hard-failing so test suites can run in CI
    if (process.env.NODE_ENV === 'test') {
      console.warn('Running in test mode: falling back to config defaults.');
      const defaults = ConfigSchema.parse({});
      // Merge a small set of test-specific overrides from process.env so tests can
      // control webhook secrets and rate limits without failing full schema validation
      const merged: AppConfig = {
        ...defaults,
        TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET ?? defaults.TELEGRAM_WEBHOOK_SECRET,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? defaults.TELEGRAM_BOT_TOKEN,
        TELEGRAM_WEBHOOK_RATE_LIMIT: process.env.TELEGRAM_WEBHOOK_RATE_LIMIT ? Number(process.env.TELEGRAM_WEBHOOK_RATE_LIMIT) : defaults.TELEGRAM_WEBHOOK_RATE_LIMIT,
        TELEGRAM_WEBHOOK_RATE_WINDOW_SEC: process.env.TELEGRAM_WEBHOOK_RATE_WINDOW_SEC ? Number(process.env.TELEGRAM_WEBHOOK_RATE_WINDOW_SEC) : defaults.TELEGRAM_WEBHOOK_RATE_WINDOW_SEC
      } as AppConfig;
      // Preserve boolean flags for OCR/classification during tests
      (merged as any).TELEGRAM_AUTO_OCR = process.env.TELEGRAM_AUTO_OCR ? process.env.TELEGRAM_AUTO_OCR === 'true' : defaults.TELEGRAM_AUTO_OCR;
      (merged as any).TELEGRAM_AUTO_CLASSIFY = process.env.TELEGRAM_AUTO_CLASSIFY ? process.env.TELEGRAM_AUTO_CLASSIFY === 'true' : defaults.TELEGRAM_AUTO_CLASSIFY;
      return merged;
    }
    throw new Error('Invalid configuration');
  }
  return parsed.data;
}

export const config = loadConfig();
export type { AppConfig };