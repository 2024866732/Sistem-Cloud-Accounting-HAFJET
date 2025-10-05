# Changelog

## [Unreleased]

### Fixed
- **Socket.IO Connection**: Fixed "xhr poll error" by prioritizing WebSocket transport over polling and enabling credentials support
  - Updated client to prefer `['websocket', 'polling']` transport order instead of `['polling', 'websocket']`
  - Added `withCredentials: true` to match server CORS configuration
  - Enhanced connect_error logging to surface detailed error messages, stack traces, and transport information for easier debugging
  - Improved fallback logic to automatically retry with polling transport when WebSocket fails
  - Files changed: `frontend/src/hooks/useNotifications.tsx`

- **Backend Development Environment**: Fixed MongoDB connection errors in local development
  - Updated `.env` to use `localhost` instead of Docker hostname `mongo` for `MONGO_URI`
  - Changed `FRONTEND_URL` from port 5175 to 5173 to match Vite default
  - Added `SKIP_DB=true` flag to allow server startup without MongoDB connection (useful for smoke tests and development)
  - Added `SKIP_SOCKET_AUTH=true` flag to bypass JWT authentication during local development when DB is unavailable
  - Backend now gracefully handles SKIP_DB mode with enhanced logging
  - Files changed: `backend/.env`, `backend/src/index.ts` (auth bypass already existed)

### Added
- **Development Tools**: Created automated Socket.IO connection diagnostic tool
  - HTML-based test page with real-time connection monitoring
  - Visual status indicators for connection state (connected/disconnected/connecting)
  - Live connection logs with color-coded messages (info/success/error/warning)
  - Display of Socket ID, transport type, and connection metadata
  - Interactive controls: reconnect, send test notification, disconnect, clear logs
  - Transport upgrade detection and logging
  - File: `tools/test-socket-connection.html`

- **CI/CD**: Automated backup/restore validation in CI pipeline
  - Added comprehensive backup/restore test script: `backend/scripts/test-backup-restore.js`
  - Script seeds test data, creates backup, drops database, restores, and validates data integrity
  - New CI job `test-backup-restore` runs after `setup-and-check` with dedicated MongoDB service
  - NPM script `test:backup-restore` added to `backend/package.json`
  - Test artifacts uploaded on failure for debugging
  - Ensures backup/restore functionality is always validated before deployment
  - Files: `.github/workflows/ci.yml`, `backend/scripts/test-backup-restore.js`, `backend/package.json`

### Documentation
- Added operational documentation for database backups and restore procedures
  - Backup script with mongodump fallback to JSON export: `backend/scripts/db-backup.js`
  - Restore script with mongorestore fallback to JSON import: `backend/scripts/db-restore.js`
  - Documentation: `backend/README-backup.md`
  
- Added database migration scaffolding
  - migrate-mongo configuration: `backend/migrate-mongo-config.js`
  - Sample migration template: `backend/migrations/0001-sample-noop.js`
  - Documentation: `backend/README-migrations.md`
  - Package scripts: `db:backup`, `db:restore`, `migrate:create`, `migrate:up`, `migrate:down`

- **Secrets Management Best Practices**: Added comprehensive secrets management documentation
  - Complete secrets inventory with rotation schedules
  - GitHub Secrets configuration guide
  - Secret rotation procedures (JWT, MongoDB, API keys, etc.)
  - Environment-specific secrets configuration
  - Emergency compromise response procedures
  - Secret generation commands for strong cryptographic keys
  - Compliance alignment (ISO 27001, PDPA, SOC 2)
  - Updated backend/.env.example with security notices
  - Added reference in DEPLOYMENT_GUIDE.md
  - File: `docs/SECRETS_MANAGEMENT.md`

# [1.1.0](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v1.0.0...v1.1.0) (2025-10-04)


### Bug Fixes

* pin changelog v6, bump semantic-release plugins and sync lockfile ([42ccee4](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/42ccee45fc252c05c702043d9c6371837401490b))
* pin semantic-release plugin versions to published majors and sync lockfile ([1d8cb48](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/1d8cb484542e0e5292bc8299db0ac9f4abb1e979))


### Features

* **release:** package and attach frontend/backend artifacts to draft release if present ([815738f](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/815738feb015834845b4ce50dc5bdb8061e10dc1))
