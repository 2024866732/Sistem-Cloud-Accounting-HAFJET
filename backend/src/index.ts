import express from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import fs from 'fs';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { config } from './config/config.js';
import generatedIndex from './generatedIndex.js';

// Extend Socket type for authentication
interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
}

import authRoutes from './routes/auth.js';
import userRoutes from './routes/usersDB.js'; // UPDATED: Full user management
import companyRoutes from './routes/companiesDB.js'; // UPDATED: Full company management
import invoiceRoutes from './routes/invoices.js';
import transactionRoutes from './routes/transactionsDB.js'; // UPDATED: MongoDB persistent transactions
import reportRoutes from './routes/reports.js';
import taxRoutes from './routes/tax.js';
import inventoryRoutes from './routes/inventoryDB.js'; // UPDATED: Full inventory tracking
import dashboardRoutes from './routes/dashboardDB.js'; // UPDATED: Real-time database queries
import settingsRoutes from './routes/settings.js';
import bankingRoutes from './routes/banking.js';
import einvoiceRoutes from './routes/einvoice.js';
import notificationRoutes from './routes/notifications.js';
import reconciliationRoutes from './routes/reconciliation.js';
import auditRoutes from './routes/audit.js';
import receiptRoutes from './routes/receipts.js';
import telegramRoutes from './routes/telegram.js';
import posRoutes from './routes/pos.js';
import systemRoutes from './routes/system.js';
// NEW ROUTES: Full modules
import purchaseRoutes from './routes/purchasesDB.js'; // NEW: Bills/Purchases module
import productRoutes from './routes/productsDB.js'; // NEW: Product catalog
import contactRoutes from './routes/contactsDB.js'; // NEW: CRM (customers/suppliers)
import salesRoutes from './routes/sales.js'; // Existing sales module
import PosSyncScheduler from './services/PosSyncScheduler.js';
import loyversePosService from './services/LoyversePosService.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authorize } from './middleware/rbac.js';
import { logger } from './utils/logger.js';
import NotificationService from './services/NotificationService.js';
import { metricsHandler, notificationDeliveryCounter } from './middleware/metrics.js';

const app = express();

// Initialize Sentry if DSN provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.0'),
    release: process.env.GITHUB_SHA || undefined
  });
  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span is attached to the right request.
  // Use any-cast to avoid TS type mismatches between @sentry/node and @sentry/tracing types
  const SentryAny = Sentry as any;
  app.use(SentryAny.Handlers.requestHandler());
  app.use(SentryAny.Handlers.tracingHandler());
}
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://hafjet-cloud-accounting-system-production.up.railway.app',
      'https://sistema-kewangan-hafjet-bukku-production.up.railway.app',
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Socket.IO authentication middleware
io.use((socket: AuthenticatedSocket, next) => {
  // Allow bypassing socket auth in local/dev for faster debugging
  if (process.env.SKIP_SOCKET_AUTH === 'true') {
    logger.warn('SKIP_SOCKET_AUTH=true - skipping socket authentication (dev only)');
    return next();
  }

  const token = (socket.handshake && (socket.handshake.auth as any) && (socket.handshake.auth.token)) || null;

  if (!token) {
    logger.warn('Socket authentication failed: no token provided', {
      handshake: {
        headers: socket.handshake.headers,
        address: socket.conn.remoteAddress,
        xForwardedFor: socket.handshake.headers['x-forwarded-for'] || null,
        origin: socket.handshake.headers.origin || socket.handshake.address
      }
    });
    return next(new Error('Authentication error: missing token'));
  }

  try {
    const decoded = jwt.verify(token as string, config.JWT_SECRET) as any;
    socket.userId = decoded.userId;
    socket.companyId = decoded.companyId;
    next();
  } catch (err) {
    logger.warn('Socket authentication failed: token verification error', { error: (err as Error).message });
    return next(new Error('Authentication error: invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket: AuthenticatedSocket) => {
  console.log(`🔌 User ${socket.userId} connected to notifications`);
  
  // Join user to their own room for targeted notifications
  socket.join(`user_${socket.userId}`);
  if (socket.companyId) {
    socket.join(`company_${socket.companyId}`);
  }

  socket.on('disconnect', () => {
    console.log(`🔌 User ${socket.userId} disconnected from notifications`);
  });

  // Test notification endpoint
  socket.on('test_notification', () => {
    socket.emit('notification', {
      id: `test_${Date.now()}`,
      type: 'system_alert',
      title: 'Test Notification',
      message: 'This is a test notification from HAFJET system',
      timestamp: new Date(),
      priority: 'medium',
      companyId: socket.companyId,
      userId: socket.userId,
      read: false
    });
  });
});

// Middleware
// Configure helmet with relaxed CSP for API and frontend communication
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://hafjet-cloud-accounting-system-production.up.railway.app",
        "https://sistema-kewangan-hafjet-bukku-production.up.railway.app",
        "https://*.railway.app",
        "ws://localhost:3001",
        "wss://hafjet-cloud-accounting-system-production.up.railway.app"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3001', 
    'https://hafjet-cloud-accounting-system-production.up.railway.app',
    'https://sistema-kewangan-hafjet-bukku-production.up.railway.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (if built frontend exists in public folder)
import path from 'path';
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath, { 
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Serve root explicitly: prefer actual index.html if present, otherwise provide a small
// fallback HTML page so the public domain doesn't return a 302/Route not found.
// Serve index.html at root for both GET and HEAD requests to avoid redirects.
// This ensures the root domain returns HTML (200) when frontend is present.
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    // Log for debugging when running in production to help trace responses
    if (process.env.NODE_ENV === 'production') {
      logger.info('Serving static index.html at root');
    }
    return res.status(200).sendFile(indexPath);
  }
  // Serve the embedded index as a fallback so HTML is returned at root
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(generatedIndex);
});

// Also respond to HEAD / so load balancers and health checks receive 200
app.head('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.status(200).end();
  }
  return res.status(200).end();
});

// Routes (UPDATED: Now 100% database-driven!)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes); // Real-time KPIs from database
app.use('/api/users', userRoutes); // Full user management
app.use('/api/companies', companyRoutes); // Full company management
app.use('/api/invoices', invoiceRoutes); // MongoDB invoices
app.use('/api/transactions', transactionRoutes); // Persistent transactions
app.use('/api/purchases', purchaseRoutes); // NEW: Bills/AP module
app.use('/api/products', productRoutes); // NEW: Product catalog
app.use('/api/contacts', contactRoutes); // NEW: CRM module
app.use('/api/sales', salesRoutes); // Existing sales orders
app.use('/api/reports', reportRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/inventory', inventoryRoutes); // Full inventory tracking
app.use('/api/settings', settingsRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/einvoice', einvoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/system', systemRoutes);

// Health endpoint (general status) and readiness endpoint.
app.get('/api/health', (_req, res) => {
  const started = (server as any)._startedAt || Date.now();
  (server as any)._startedAt = started;
  let dbStatus: 'connected' | 'disconnected' | 'connecting' | 'error' = 'disconnected';
  try {
    const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    dbStatus = state === 1 ? 'connected' : state === 2 ? 'connecting' : 'disconnected';
  } catch (e) {
    logger.warn('Health check failed to read mongoose state', e);
    dbStatus = 'error';
  }
  res.json({
    status: 'OK',
    message: 'HAFJET Bukku API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.1-model-fixes-deployed',
    buildDate: '2025-10-20T03:12:00Z',
    uptimeSeconds: Math.round((Date.now() - started) / 1000),
    db: dbStatus
  });
});

// Readiness endpoint: return 200 only when DB connection is established.
app.get('/api/ready', (_req, res) => {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    return res.json({ ready: true, db: 'connected' });
  }
  return res.status(503).json({ ready: false, db: state === 2 ? 'connecting' : 'disconnected' });
});
// Prometheus metrics endpoint (protected by METRICS_BASIC_AUTH if set)
// If you want RBAC protection instead, remove the basic auth env var and use authorize('system.metrics')
app.get('/api/metrics', metricsHandler);

// Test notification endpoint
app.post('/api/test-notification', (req, res) => {
  const { userId, companyId } = req.body;
  
  if (!userId || !companyId) {
    return res.status(400).json({ 
      success: false, 
      message: 'userId and companyId are required' 
    });
  }

  try {
    NotificationService.sendTestNotification(userId, companyId);
    res.json({ 
      success: true, 
      message: 'Test notification sent successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test notification' 
    });
  }
});

// Error handling
app.use(errorHandler);

// For any route not matched by API or static files, serve index.html (SPA fallback)
// SPA fallback: for any non-API route, serve index.html if it exists so client-side
// routing works. Explicitly return 200 when serving index. If the file is missing,
// return 404 JSON to indicate API-only mode.
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.status(200).sendFile(indexPath);
  }
  // If index isn't present, this is likely an API-only deployment.
  res.status(404).json({ message: 'Route not found' });
});

// Initialize notification service
// Export io instance for use in other modules
export { io };

// Connect NotificationService with Socket.IO
NotificationService.setSocketIO(io);

let notificationService = NotificationService;

// Start server only once (prevent EADDRINUSE with multiple nodemon restarts overlapping)
const startServer = () => {
  if ((server as any)._started) return; // simple guard
  (server as any)._started = true;
  const PORT = config.PORT || 3001;
  const tryListen = (port: number, attempt = 0) => {
    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      console.log(`🚀 HAFJET Bukku API Server running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
      console.log(`🔐 Auth endpoints available at http://localhost:${port}/api/auth`);
      console.log(`🔔 Real-time notification service initialized`);
      // Start POS sync scheduler (simple single-company placeholder)
      try {
        if (config.LOYVERSE_SYNC_SCHEDULER_ENABLED && loyversePosService.isEnabled()) {
          // For now we need a company context; future: iterate active companies
          // Placeholder: environment variable or skip if not provided
          const defaultCompanyId = process.env.DEFAULT_COMPANY_ID;
          if (defaultCompanyId) {
            PosSyncScheduler.start(defaultCompanyId);
            console.log('⏱️  POS sync scheduler started');
          } else {
            console.log('⏱️  POS sync scheduler enabled but DEFAULT_COMPANY_ID not set; scheduler idle');
          }
        }
      } catch (e) {
        console.warn('Failed to start POS sync scheduler', (e as Error).message);
      }
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' && attempt < 5) {
        const next = port + 1;
        logger.warn(`Port ${port} in use, trying ${next}...`);
        tryListen(next, attempt + 1);
      } else {
        logger.error('Server failed to start:', err);
      }
    });
  };
  tryListen(Number(PORT));
};

// Start server after DB connection to ensure health/readiness is accurate
const init = async () => {
  try {
    // In test mode, avoid starting external connections or the HTTP server.
    // Tests import the app and expect a fast, deterministic environment.
    if (process.env.NODE_ENV === 'test') {
      logger.warn('NODE_ENV=test - skipping DB connection and server start in init()');
      return;
    }
    // Allow skipping DB connection for local smoke tests (set SKIP_DB=true)
    if (process.env.SKIP_DB === 'true') {
      logger.warn('SKIP_DB=true set - starting server without connecting to MongoDB (smoke-test mode)');
      // Start HTTP server even when DB is not available. Useful for local dev and CI smoke tests.
      startServer();
      return;
    }

    await mongoose.connect(config.MONGO_URI);
    logger.info('Connected to MongoDB');
    // Now start the HTTP server
    startServer();
  } catch (err) {
    logger.error('MongoDB connection error:', (err as Error).message || err);
    // During tests we should not abort the whole process because Jest runs workers
    // which will fail the suite if the process exits. Instead, log and return so
    // test runners can handle the error gracefully.
    if (process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test') {
      logger.warn('MongoDB connection failed in test mode — skipping process.exit to avoid aborting test runner');
      return;
    }
    // Exit so orchestration (docker) can restart the container if desired
    process.exit(1);
  }
};

init();

export { notificationService };

export default app;