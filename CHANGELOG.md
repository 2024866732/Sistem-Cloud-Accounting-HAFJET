## [2.1.1](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.1.0...v2.1.1) (2025-10-07)


### Bug Fixes

* **build:** use absolute paths in nixpacks.toml and railway.json ([a800fe5](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/a800fe51baca188efdfc805ea6eb7e8c72ef166d))

# [2.1.0](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.0.1...v2.1.0) (2025-10-07)


### Features

* serve frontend static files from backend ([694ae2d](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/694ae2d042369ed5dec7c8ecef31905663ed2e74))

## [2.0.1](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.0.0...v2.0.1) (2025-10-07)


### Bug Fixes

* **api:** add root '/' handler - redirect to FRONTEND_URL or show minimal landing page (prevents 404 on main app) ([070641e](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/070641ee9f14c1385e73700697b72c2683be8f60))

# [2.0.0](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v1.1.0...v2.0.0) (2025-10-07)


### Bug Fixes

* **backend:** add type assertion for Mongoose 8 FlattenMaps compatibility ([0175a6b](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/0175a6b8648ef382daec3c4b93f22966d6f2ac23))
* **backend:** use double type assertion for Mongoose 8 lean() return type ([15557f2](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/15557f230bb2a51f37e64d869bf200d1fba3d657))
* **ci:** add GHCR write permissions to workflow ([f2e93cd](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/f2e93cd0d9c59a9d8eff217885bd1b1086cd3a6d))
* **ci:** correct MongoDB health check options format ([399e9be](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/399e9be2d2dca69ba915e8b4f8e1898708d89b10))
* **ci:** filter JSON error messages from GHCR API responses ([b233908](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/b233908c1adbc03f6465712a10d6b785a98d9900))
* **ci:** filter JSON errors in Semantic Release GHCR digest fetch ([1a04af6](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/1a04af6554d5005839c81ee92121e2fc9ce10a7b))
* **ci:** improve deploy-railway workflow error handling ([b3fa2d8](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/b3fa2d8de1bfd4c6a1691a052d477d123a2e9d42))
* **ci:** remediate failing CI runs - lockfile sync, workflow syntax, deploy guards ([14342cd](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/14342cdf15f40c3172d89f26cb83936822c520dd))
* **ci:** remove invalid bash commands from YAML workflow ([9d812ba](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/9d812baa39851f34f60e99c49ad7e74406c8c4d4))
* **ci:** repair all failing GitHub Actions workflows ([3e72306](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/3e7230608dfbb7f7f0f634d08eb439c2adf924bb))
* **ci:** skip husky install in CI environment ([4cfbbf7](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/4cfbbf7d800be8e7c4db4fca6875c5ba8d04c494))
* **ci:** use GITHUB_TOKEN for GHCR authentication ([174557c](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/174557c5fa0c1912689c5ea78580e98ec691d450))
* configure Railway to build and deploy backend folder ([1b95e56](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/1b95e56c453e466414e2c93302a3057262551a0d))
* **docker:** add legacy-peer-deps flag to frontend Dockerfile ([4d4d6d8](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/4d4d6d84a1849a379c12780f6e0e78a120dfa2c8))
* **docker:** upgrade to Node 20 and add legacy-peer-deps flag for npm ci ([fb0cc91](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/fb0cc91e02d20deba9707f9eb371c44139b30530))
* **frontend:** add notification disable check for CI/test environments ([7d919d1](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/7d919d13d0a8a44570dff5eb563e86643cd881b2))
* MongoDB empty userinfo error - set proper connection string ([5b1c010](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/5b1c0102f640bc2797181cd9c8fe8c87a10db140))
* restore ci.yml with proper YAML syntax and notification env vars ([fa94663](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/fa94663f9535b5c1693267ab19785340e6a86fc2))


### Features

* add production deployment automation scripts and secure templates ([f4ff023](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/f4ff02368e1f9d66b9ff8bfaf38f048aea2e709c))
* **auto-complete:** 90% system completion with zero errors ([158b9e1](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/158b9e1ed73e7c4d7eae6489f7da44631eddc391))
* Complete all 20 pre-deployment automation tasks (100%) ([38ebada](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/38ebada4ccac988bf66b8a87720a0e0b169d96a1))
* **deploy:** add automated Railway deployment scripts with Malaysian compliance ([0b021af](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/0b021af17f20c67b28d1648e91d8b3017afa72f3))
* **deploy:** complete automated Railway configuration ([3d50466](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/3d50466f92d14a06081c37d19b4473c13f18f387))


### BREAKING CHANGES

* None - All new automation scripts added

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


### Published images
- Backend: sha256:c842b461b2f42d333d4ac42eb42afa890a92fee1974e08882a0c9b259d5ce2b5
- Frontend: sha256:1e3f5d43eed1ae4af1954659ff10c3732124a68af6b297fb9ca82651c4492898


### Published images
- Backend: sha256:5dbf29f4f78aefb615e37cdd24083435f9bb6a3e099518474ca7cc15409ba00a
- Frontend: sha256:cfebacca39d10ad5fa5677f20c082d256e8c8993cf70c463d0c5fdb709bc1aaa


### Published images
- Backend: sha256:c17cad7143c73fe0151ea2b1418fb95c20f8a44680ff9937e7da7ab64e0d7d2d
- Frontend: sha256:5d513406470c853f0ce882df2e5b72e0fc216b5261645f8586d62519209f6dcc


### Published images
- Backend: sha256:641189baffa8bd620e3e807b7a4d03e9206eb924156340ea451b03ea3b18d82e
- Frontend: sha256:e32304d9182c181d8e4bf0dfa3b2f1ebd0321a9405ba828aefae8d2762e636c9
