# 🏆 HAFJET Cloud Accounting System - Malaysian Cloud Accounting Solution 🇲🇾

A **world-class cloud accounting system** for Malaysian businesses, inspired by Bukku.my with enhanced features and modern architecture. Built to exceed international standards while maintaining full Malaysian compliance.

## 🚀 Features

### ✅ **E-Invoice Ready & LHDN Compliant**
- 🔐 LHDN MyInvois integration
- 📄 XML invoice generation (UBL 2.1 standard)
- 🌐 Peppol network connectivity
- ✅ Real-time submission status tracking
- 🔄 Automated e-invoice workflow

### 💰 **Malaysian Tax Compliance**
- 🏛️ **SST (Sales & Service Tax)** - 6% automated calculation
- 📊 **GST (Historical)** - 6% for legacy data support
- 🎯 Tax exemption category management
- 📋 Comprehensive tax reporting
- 🧾 Tax number validation (Malaysian format)

### 🧾 **Professional Invoicing**
- 📧 Email & WhatsApp invoice delivery
- 💳 Integrated payment processing
- 🎨 Customizable invoice templates
- 📱 Mobile-responsive design
- 🔄 Automated payment reminders

### 📊 **Advanced Reporting (50+ Reports)**
- 📈 Profit & Loss Statement
- ⚖️ Balance Sheet
- 💸 Cash Flow Statement
- 📋 Trial Balance
- 👥 Aged Receivables/Payables
- 📊 Real-time financial dashboards

### 🏪 **Inventory Management**
- 📦 Real-time stock tracking
- 💲 Perpetual inventory costing
- 📏 Multiple units of measure (UOM)
- 🔔 Low stock alerts
- 📊 Stock valuation reports

### 🌐 **Multi-Language Support**
- 🇬🇧 English
- 🇲🇾 Bahasa Malaysia
- 🇨🇳 Chinese (Simplified)

## 🛠️ Technology Stack

### Frontend
- ⚛️ **React 18** with TypeScript
- ⚡ **Vite** for fast development
- 🎨 **Tailwind CSS** + **Shadcn/ui** components
- 📊 **Chart.js** for data visualization
- 🔄 **Zustand** for state management
- 📱 **React Router** for navigation

### Backend
- 🟢 **Node.js** with **Express**
- 📘 **TypeScript** for type safety
- 🍃 **MongoDB** with **Mongoose ODM**
- 🔐 **JWT** authentication
- 🛡️ **Helmet** for security
- 📧 **Nodemailer** for email services

### Development Tools
- 🔧 **ESLint** + **Prettier** for code formatting
- 🐛 **VS Code** debugging configuration
- 📋 **Pre-configured tasks** for development workflow
- 🧪 **Testing** setup ready

## 🏗️ Project Structure

```
📁 HAFJET Bukku/
├── 📁 frontend/                 # React TypeScript frontend
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/          # Page components
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 services/       # API services
│   │   ├── 📁 types/          # TypeScript definitions
│   │   ├── 📁 utils/          # Utility functions
│   │   └── 📁 stores/         # State management
│   └── 📄 package.json
├── 📁 backend/                 # Node.js Express backend
│   ├── 📁 src/
│   │   ├── 📁 controllers/    # Route controllers
│   │   ├── 📁 models/         # MongoDB models
│   │   ├── 📁 routes/         # API routes
│   │   ├── 📁 middleware/     # Express middleware
│   │   ├── 📁 services/       # Business logic services
│   │   │   ├── 📄 MalaysianTaxService.ts
│   │   │   └── 📄 EInvoiceService.ts
│   │   └── 📁 utils/          # Backend utilities
│   └── 📄 package.json
├── 📁 shared/                  # Shared TypeScript types
├── 📁 docs/                   # Documentation
├── 📁 .github/               # GitHub configuration
└── 📄 README.md              # This file
```

## 🚦 Quick Start

### Prerequisites
- 🟢 **Node.js** 18+ 
- 🍃 **MongoDB** (local or cloud)
- 💻 **VS Code** (recommended)

### 1️⃣ Clone & Setup
```bash
git clone <your-repo-url>
cd "Sistem Kewangan HAFJET Bukku"
```

### 2️⃣ Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install individually
cd frontend && npm install
cd ../backend && npm install
```

### 3️⃣ Environment Configuration
Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
# Database
MONGO_URI=mongodb://localhost:27017/hafjet-bukku

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# LHDN E-Invoice API
LHDN_API_URL=https://api.myinvois.hasil.gov.my
LHDN_API_KEY=your-lhdn-api-key
LHDN_CLIENT_ID=your-client-id
LHDN_CLIENT_SECRET=your-client-secret

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key

# Environment
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# --- Digital Shoebox / OCR & AI ---
OCR_PROVIDER=mock                 # mock | tesseract | external
AI_MODEL=rules_v1                 # rules_v1 | model_v2 (future)
ENABLE_RECEIPT_NOTIFICATIONS=true # toggle receipt lifecycle notifications
AUTO_APPROVE_MAX_AMOUNT=200       # threshold (MYR) for future auto-approval logic

# --- Queue / Async Processing (future) ---
QUEUE_DRIVER=memory               # memory | redis
REDIS_URL=redis://localhost:6379  # used if QUEUE_DRIVER=redis

# --- Integrations (optional) ---
TELEGRAM_BOT_TOKEN=               # for Telegram ingestion (optional)
TELEGRAM_ALLOWED_CHAT_IDS=        # comma-separated chat IDs allowed
LOYVERSE_API_KEY=                 # POS integration key (future)
LOYVERSE_API_URL=https://api.loyverse.com
LOYVERSE_POLL_INTERVAL_SEC=300    # future polling interval seconds
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=HAFJET Cloud Accounting System
VITE_APP_VERSION=1.0.0
```

### 4️⃣ Start Development Servers

#### Option A: VS Code Tasks (Recommended)
1. Open VS Code
2. `Ctrl+Shift+P` → "Tasks: Run Task"
3. Select "Start All Development Servers"

#### Option B: Manual Start
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - MongoDB (if local)
mongod
```

### 5️⃣ Access the Application
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3000
- 🩺 **Health Check**: http://localhost:3000/api/health
 - 🔔 **Notifications Test**: POST http://localhost:3000/api/test-notification

### 🔍 Digital Shoebox (Receipt Pipeline)
Current MVP (synchronous) flow:
1. Upload receipt (status `uploaded`)
2. Trigger OCR (status `ocr_processed`)
3. Trigger classification (status `review_pending`)
4. Approve → draft ledger posting (status `approved`)

Real-time notification events (if ENABLE_RECEIPT_NOTIFICATIONS=true):
`receipt_uploaded`, `receipt_ocr_processed`, `receipt_ready_review`, `receipt_approved`.

Planned v2: asynchronous queue (BullMQ/Redis) + auto-approval rules.

## 🎯 Available Scripts

### Root Directory
```bash
npm run install:all      # Install all dependencies
npm run build:all        # Build both frontend and backend
npm run start:dev        # Start all development servers
```

### Frontend
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Backend
```bash
npm run dev             # Start development server with hot reload
npm run build           # Compile TypeScript
npm run start           # Start production server
npm run lint            # Run ESLint
```

## 🔐 Malaysian Compliance Features

### E-Invoice Integration
```typescript
// Submit invoice to LHDN
const result = await EInvoiceService.submitToLHDN(xmlData);
if (result.success) {
  console.log('E-Invoice submitted:', result.uuid);
}
```

### Tax Calculations
```typescript
// Calculate SST for Malaysia
const taxCalc = MalaysianTaxService.calculateSST([
  { amount: 100, taxable: true },
  { amount: 50, taxable: false }
]);
console.log(`Total: ${taxCalc.total}, Tax: ${taxCalc.taxAmount}`);
```

## 📊 Core Business Modules

### 1. **Dashboard**
- 📈 Financial overview & KPIs
- 📊 Interactive charts
- 🔔 Business alerts & notifications
- 📱 Mobile-responsive design

### 2. **Invoicing**
- 🧾 Professional invoice creation
- 📧 Multi-channel delivery (Email/WhatsApp)
- 💳 Payment tracking
- 🔄 Recurring invoices
- 📄 E-Invoice LHDN submission

### 3. **Transactions**
- 💰 Income/Expense recording
- 🏦 Bank account management
- 🔄 Automated reconciliation
- 📁 Document attachments
- 🎯 Category management

### 4. **Contacts**
- 👥 Customer/Supplier management
- 📇 Contact information & history
- 💳 Credit limits & payment terms
- 📊 Aging reports

### 5. **Reports**
- 📈 50+ financial reports
- 📊 Real-time data visualization
- 📄 PDF export capabilities
- 📧 Scheduled report delivery
- 🎯 Custom date ranges

### 6. **Settings**
- 🏢 Company profile management
- 🎨 Invoice customization
- 👥 User management & permissions
- 🔧 System configuration

## 🛡️ Security Features

- 🔐 **JWT Authentication** with secure tokens
- 🛡️ **Helmet.js** security headers
- ✅ **Input validation** with Zod schemas
- 🔒 **Password hashing** with bcrypt
- 🌐 **CORS** configuration
- 📝 **Audit logging** for compliance
 - ✅ **Config validation** (Zod) – startup will fail fast on invalid env values

### Configuration Validation
All environment variables are validated via a central Zod schema (`backend/src/config/config.ts`). This prevents running with weak or malformed config (e.g. short JWT secret). Extend by modifying the schema rather than sprinkling new `process.env` reads.

### Feature Flags / Environment Switches
| Variable | Purpose | Default |
|----------|---------|---------|
| OCR_PROVIDER | OCR engine selector | mock |
| AI_MODEL | Classification model tag | rules_v1 |
| ENABLE_RECEIPT_NOTIFICATIONS | Toggle receipt lifecycle notifications | true |
| QUEUE_DRIVER | Async driver (future) | memory |
| REDIS_URL | Redis connection when QUEUE_DRIVER=redis | redis://localhost:6379 |
| AUTO_APPROVE_MAX_AMOUNT | Auto-approve ceiling (future) | 200 |
| TELEGRAM_BOT_TOKEN | Telegram ingestion bot token | (empty) |
| TELEGRAM_ALLOWED_CHAT_IDS | Whitelist chat IDs | (empty) |
| TELEGRAM_WEBHOOK_SECRET | Shared secret for /api/telegram/webhook | (empty) |
| TELEGRAM_WEBHOOK_RATE_LIMIT | Requests allowed per window (default 60) | 60 |
| TELEGRAM_WEBHOOK_RATE_WINDOW_SEC | Rate limit window seconds | 60 |
| TELEGRAM_AUTO_OCR | Auto run OCR after Telegram ingestion | false |
| TELEGRAM_AUTO_CLASSIFY | Auto classify after OCR (Telegram) | false |
| LOYVERSE_API_KEY | POS integration API key | (empty) |
| METRICS_PROM_ENABLED | Enable Prometheus text metrics endpoint | false |
| POS_SYNC_ERROR_ALERT_THRESHOLD | Error spike alert threshold per sync run | 5 |

### 🔗 Telegram Chat Linking & Ingestion

To securely ingest receipts (photos or PDFs) from Telegram groups, chats must be explicitly linked to a company. This prevents accidental or malicious uploads from unknown chats.

Workflow:
1. Obtain your group chat ID (add the bot and use a debug command or a temporary logging step).
2. As an admin (role with `admin.manage_users`), create a link:
  - `POST /api/telegram/links` with JSON `{ "chatId": "<chatId>", "defaultUserId": "<optional uploader user id>" }`
3. The webhook `/api/telegram/webhook` will now accept photo/document messages from that chat and create `Receipt` records.
4. Unlinked chats ⇒ 403 with message `Chat not linked`.

Endpoints:
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/telegram/links` | List chat links for your company |
| POST | `/api/telegram/links` | Create a new chat link |
| DELETE | `/api/telegram/links/:id` | Remove a chat link |

Security Layers:
| Layer | Description |
|-------|-------------|
| Allowed Chat Env Filter | Optional coarse allowlist via `TELEGRAM_ALLOWED_CHAT_IDS` (early rejection) |
| Chat Link Model | Fine-grained mapping stored in DB (`TelegramChatLink`) |
| Role Guard | Only admins can manage links (`admin.manage_users`) |
| Webhook Secret | If `TELEGRAM_WEBHOOK_SECRET` set, requests must send `X-Telegram-Secret` header or `?secret=` query |
| Rate Limiting | In-memory limiter (per chat/IP) controlled by `TELEGRAM_WEBHOOK_RATE_LIMIT` & window vars |
| Future | Add secret token & rate limiting to webhook |

Auto Processing (Future Flags):
| Flag | Planned Purpose |
|------|-----------------|
| TELEGRAM_AUTO_OCR | Automatically run OCR after ingestion |
| TELEGRAM_AUTO_CLASSIFY | Automatically classify after OCR |

When both are enabled the Telegram webhook will return quickly after fully processing the receipt up to `review_pending` (best-effort; failures produce `system_alert` notification).

## 🏪 POS (Loyverse) Integration (MVP)
Current status: foundational models + manual sync endpoint + refund normalization.

Endpoint:
POST `/api/pos/loyverse/sync` (permission: `pos.sync`) – pulls recent sales & refunds (mock data now) and stores in `PosSale` with related `StoreLocation` upserts.
POST `/api/pos/loyverse/post` (permission: `ledger.post`) – aggregates a day's normalized sales/refunds into a `pos_daily` ledger entry.
`full` sync override: append `?full=true` or body `{ "full": true }` to ignore incremental cursor.

### POS Metrics (MVP)
Endpoint: `GET /api/system/metrics` (permission: `system.metrics`)
Key Counters:
- pos.sync.created / skipped / errors
- pos.sync.full_runs / incremental_runs
- pos.post.success / negative_day
Use for observability & future dashboarding.

Prometheus text exposition (set `METRICS_PROM_ENABLED=true`):
`GET /api/system/metrics/prom` returns plain text counters for scraping.
Error spike notification (threshold `POS_SYNC_ERROR_ALERT_THRESHOLD`) emits `system_alert` when a single run's error delta >= threshold.

### POS Sync Scheduler (MVP)
Env:
- LOYVERSE_SYNC_SCHEDULER_ENABLED=true (default)
- LOYVERSE_POLL_INTERVAL_SEC=300
- DEFAULT_COMPANY_ID=<companyId> (required for auto start)
Starts automatic periodic sync if integration API key present.

Data Models:
- `StoreLocation`: externalId, name, currency, active
- `PosSale`: externalId, type (`sale`|`refund`), originalSaleExternalId?, businessDate, saleDateTime, totals, items[], status (`normalized`), hash
- `PosSale.items[]`: lineNumber, description, quantity (negative for refunds), amounts (gross/discount/tax/net – negative for refunds)

Refund Handling:
- Refunds are separate `PosSale` documents with inverted sign for quantities and monetary fields.
- Optional `originalSaleExternalId` preserved for future linkage to the original sale record.
- Enables straightforward net daily aggregation (sales + refunds) without extra arithmetic.

Env Variables:
| Variable | Purpose | Default |
|----------|---------|---------|
| LOYVERSE_API_KEY | API key for Loyverse (future real calls) | (empty) |
| LOYVERSE_API_URL | Base API endpoint | https://api.loyverse.com |
| LOYVERSE_POLL_INTERVAL_SEC | Future polling interval | 300 |

Roadmap:
1. Void handling & partial line refunds.
2. Automated scheduled posting + multi-store batch.
3. Incremental sync using last-success cursor.
4. Webhook listener (if available) to reduce polling.
5. Metrics & dashboards (sales by store, category, tax class).

Refer to `docs/POS_LOYVERSE_INTEGRATION.md` for architecture & future plan.

Receipt Meta:
- `meta.source = 'telegram'`
- `meta.chatId` records origin
- `meta.telegramDocument = true` for document (PDF/image) ingestion

Failure Notifications:
- Invalid/unsupported doc types generate a `system_alert` notification for visibility.

### 🔒 Webhook Hardening Recommendations
1. Set `TELEGRAM_WEBHOOK_SECRET` and configure the bot webhook URL with `?secret=<value>` or send header `X-Telegram-Secret`.
2. Restrict IP at reverse proxy (Cloudflare / Nginx allowlist) if possible.
3. Monitor `system_alert` notifications for ingestion errors.
4. For production scale, move rate limiter to Redis (planned: replace in-memory with token bucket backed by Redis). 



## 🌍 Deployment Options

### Production Build
```bash
# Build everything
npm run build:all

# Frontend build output: frontend/dist/
# Backend build output: backend/dist/
```

### Docker / Container Deployment

You can run the full stack (backend API, frontend SPA, MongoDB, Redis) using the provided multi-stage Dockerfiles and `docker-compose.yml`.

#### 1. Build & Start (Development / Evaluation)
```powershell
docker compose build
docker compose up -d
```

Services started:
| Service | Port | Purpose |
|---------|------|---------|
| frontend | 8080 | React app served by Nginx |
| backend  | 3000 | Express API (health: /api/health) |
| mongo    | 27017| MongoDB database |
| redis    | 6379 | Redis (future queues, rate limiting) |

Access:
* App UI: http://localhost:8080
* API Base: http://localhost:3000/api
* Health Check: http://localhost:3000/api/health
* Metrics (JSON): http://localhost:3000/api/system/metrics (needs auth / permission)
* Metrics (Prometheus): http://localhost:3000/api/system/metrics/prom (set `METRICS_PROM_ENABLED=true` in backend env)

#### 2. Environment Variables
The compose file sets minimal defaults. For production create a `.env` (or use secrets manager) and override sensitive values:
```env
JWT_SECRET=change_me_in_prod
MONGO_URI=mongodb://mongo:27017/hafjet-bukku
REDIS_URL=redis://redis:6379
FRONTEND_URL=http://localhost:8080
METRICS_PROM_ENABLED=true
POS_SYNC_ERROR_ALERT_THRESHOLD=5
LOYVERSE_SYNC_SCHEDULER_ENABLED=false
```
To inject: add an `env_file: ./.env` section under the `backend:` service or pass `--env-file` to `docker compose`.

#### 3. Rebuild After Code Changes
```powershell
docker compose build backend
docker compose up -d backend
```
Frontend:
```powershell
docker compose build frontend
docker compose up -d frontend
```

#### 4. Logs & Troubleshooting
```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose ps
```
Healthcheck failures will automatically restart unhealthy containers (policy: `unless-stopped`). Ensure Mongo & Redis show as `healthy` before backend fully serves requests.

#### 5. Clean Up
```powershell
docker compose down
docker compose down -v   # also remove Mongo/Redis volumes
```

#### 6. Production Hardening Suggestions
| Area | Recommendation |
|------|----------------|
| Secrets | Use Docker/Swarm/Cloud secrets or env vault (never commit) |
| TLS | Terminate via reverse proxy (Traefik / Nginx / Cloud LB) on 443 |
| Backups | Automate daily Mongo dumps + off-site storage |
| Images | Pin base image digests; enable vulnerability scanning |
| Logging | Ship structured logs to ELK / Loki; add JSON logger format |
| Rate Limiting | Move in-memory rate limits to Redis token buckets |
| Queue | Introduce BullMQ for OCR + e-invoice async tasks (Redis already provisioned) |
| Scaling | Run multiple backend replicas behind a load balancer |
| Metrics | Scrape Prometheus endpoint; add Grafana dashboards |

#### 7. Multi-Stage Image Notes
Backend image excludes dev dependencies (npm prune) and runs as non-root `app` user. Frontend served via Nginx with security headers (see `frontend/nginx.conf`). Adjust CSP if you introduce external CDNs or analytics.

#### 8. One-Line Startup (Fresh Clone)
```powershell
git clone <repo>
cd "Sistem Kewangan HAFJET Bukku"
docker compose up -d --build
```

After first run, create an admin user via the registration endpoint or seed script (future). Ensure you replace `JWT_SECRET` before exposing publicly.

> Coming Next: CI pipeline to build & publish versioned images + optional Helm chart for Kubernetes deployment.


### Cloud Deployment
- ☁️ **Vercel** for frontend
- 🚀 **Railway/Heroku** for backend
- 🍃 **MongoDB Atlas** for database

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Awards & Recognition

Built by world-class developers with expertise in:
- 🏆 Malaysian business compliance
- 🎯 Modern web development
- 🔐 Enterprise security standards
- 📊 Financial software architecture

## 📞 Support

- 📧 **Email**: support@hafjet-bukku.com
- 📱 **WhatsApp**: +60 12-345-6789
- 💬 **Discord**: [Join our community](https://discord.gg/hafjet-bukku)
- 📖 **Documentation**: [Full docs](https://docs.hafjet-bukku.com)

---

**🇲🇾 Proudly Made in Malaysia for Malaysian Businesses**

*Empowering SMEs with world-class accounting technology that understands local business needs.*

# HAFJET Bukku (local Docker Compose)

This repository contains the HAFJET Bukku cloud accounting stack (frontend, backend, mongo, redis) and a local Docker Compose configuration for development and local validation.

Quick smoke test

- The backend exposes a readiness endpoint at `/api/ready` which returns HTTP 200 only when the service has established a MongoDB connection.
- The backend Docker HEALTHCHECK calls `/api/ready` so the container reports healthy only after DB connectivity.

To run the smoke test locally (PowerShell):

```powershell
# from repository root
scripts\smoke-test.ps1
```