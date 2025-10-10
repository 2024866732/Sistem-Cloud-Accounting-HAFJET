## [2.3.6](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.3.5...v2.3.6) (2025-10-10)


### Bug Fixes

* **ci:** remove --project flag from railway commands, CLI uses env var or linked project ([a886611](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/a886611d2db13ae7bd5605b50921d675537e2c90))

## [2.3.5](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.3.4...v2.3.5) (2025-10-10)


### Bug Fixes

* **ci:** upgrade Node.js from 18 to 20 for Vite 7.x compatibility ([55e91df](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/55e91dfe851a69c2380273256311f6f861f5528c))

## [2.3.4](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.3.3...v2.3.4) (2025-10-10)


### Bug Fixes

* **ci:** add issues:write permission to monitor workflow to prevent 403 errors ([f7f5671](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/f7f56719d2fe1b79033511a1d94cc3b01ce03118))
* **ci:** remove explicit railway login, use RAILWAY_TOKEN env var instead ([639ff58](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/639ff586f2b32489bf06604e8ab0cb8911b4e471))

## [2.3.3](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.3.2...v2.3.3) (2025-10-10)


### Bug Fixes

* **ci:** use railway login --browserless for CI environment ([23d01ae](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/23d01ae7cfb88a5c002bd2fef569b33d44b5e8b8))

## [2.3.2](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.3.1...v2.3.2) (2025-10-10)


### Bug Fixes

* **backend:** add .js extensions to all relative imports for Node16 ESM ([34adc38](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/34adc38f00b84e4f1aa16b00e29624c2d050d72e))

## [2.3.1](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.3.0...v2.3.1) (2025-10-10)


### Bug Fixes

* **frontend:** add Layout component with default export ([490c159](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/490c15960dec3fc985c9643e78e99127b53d25a3))

# [2.3.0](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.14...v2.3.0) (2025-10-10)


### Features

* **ci:** complete Railway CI/CD deployment setup ([1321ae6](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/1321ae644a3ac1adc5f892e68451e506f599152d))

## [2.2.14](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.13...v2.2.14) (2025-10-10)


### Bug Fixes

* **login:** remove stray shell command and log errors; improve CI workflow and docs ([6add1d4](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/6add1d4c78c2972354734ae149eafe55f95ce3bf))

## [2.2.13](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.12...v2.2.13) (2025-10-08)


### Bug Fixes

* **build:** avoid EBUSY by using temporary npm cache; pin NIXPACKS_NODE_VERSION to 20.19.0 ([e1f776e](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/e1f776ed68c7810ead810103d1a499772a680e1e))

## [2.2.12](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.11...v2.2.12) (2025-10-08)


### Bug Fixes

* **build:** clean npm caches before installs to avoid EBUSY; ensure frontend install+build atomic ([ce89f10](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/ce89f1011a623d767a751745d85623cf3c9ec221))

## [2.2.11](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.10...v2.2.11) (2025-10-08)


### Bug Fixes

* **build:** run frontend npm ci+build atomically to ensure local vite binary ([8bc6428](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/8bc642895c299c90127bf52e9bdcee30327df04e))

## [2.2.10](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.9...v2.2.10) (2025-10-08)


### Bug Fixes

* **build:** install root deps with --include=dev and use npx vite ([ac13dfa](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/ac13dfae3c836087521e4e1e1e52183a08ba5fda))

## [2.2.9](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.8...v2.2.9) (2025-10-08)


### Bug Fixes

* **build:** move Vite to dependencies, pin Node 20, fix build path ([18eef12](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/18eef12ce862c13247151c757f1127a115e48250))

## [2.2.8](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.7...v2.2.8) (2025-10-08)


### Bug Fixes

* **build:** use hoisted vite binary for monorepo frontend build ([a5aa9f1](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/a5aa9f18a3294dc721bb52f89bc7152e20b68fa7))

## [2.2.7](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.6...v2.2.7) (2025-10-08)


### Bug Fixes

* **nixpacks:** include dev dependencies for frontend build ([3e811ca](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/3e811cac3d7c39667752d7af871744f8b445e3eb))

## [2.2.6](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.5...v2.2.6) (2025-10-07)


### Bug Fixes

* **nixpacks:** use nodejs (default stable) instead of versioned package ([1397dc0](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/1397dc0ce89d9db8b5b4ce537d723f79f9b9ad72))

## [2.2.5](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.4...v2.2.5) (2025-10-07)


### Bug Fixes

* **nixpacks:** use nodejs_22 (valid nixpkgs package name) ([b42a934](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/b42a93468c19fe62ee008aed5f14e1587464f9b0))

## [2.2.4](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.3...v2.2.4) (2025-10-07)


### Bug Fixes

* **deploy:** remove buildCommand override to use nixpacks.toml build phases ([ed103f9](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/ed103f9005c8f8f0f421d9d521fa0ffee77d8911))

## [2.2.3](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.2...v2.2.3) (2025-10-07)


### Bug Fixes

* **deploy:** add healthcheck configuration to railway.json ([af981bc](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/af981bcd34ffa5cc40b8ddab3166dfd60dc8f1fc))

## [2.2.2](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.1...v2.2.2) (2025-10-07)


### Bug Fixes

* **ci:** use valid nixpkgs Node package name (nodejs-22_x instead of nodejs_22_12) ([9c2fb3b](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/9c2fb3be05d8056617cff374ddd26c66f81e4fd7))

## [2.2.1](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.2.0...v2.2.1) (2025-10-07)


### Bug Fixes

* **ci:** restore valid railway build config (NIXPACKS) with frontend+backend build steps ([02cd2b1](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/02cd2b1d507b440f32f443819e6f7c7b49fe89db))

# [2.2.0](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/compare/v2.1.1...v2.2.0) (2025-10-07)


### Features

* **web:** explicit root handler + SPA fallback to avoid redirect loop when frontend missing ([3952523](https://github.com/2024866732/Sistem-Cloud-Accounting-HAFJET/commit/3952523f2506ea64cbb17470c64f1062c5995a21))

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


### Published images
- Backend: sha256:86573c070a72b8e9d8fcac0893d694fd8cb4b6f7ba2bcf1f951328829121b480
- Frontend: sha256:2aead10f560e3ec24c2bb7750c894be45ae812de474ac1e8ee4f3f39ae4241a6


### Published images
- Backend: sha256:1726646177bfa6a8a072fcc137237b85f4ba494018c7accb4b0c650669daf324
- Frontend: sha256:73c1f5878dc413214ff7a00afe80fef0be19d82ff22d74010bc182ff992aa2a0


### Published images
- Backend: sha256:90234315a7dc1394ef8d9ba04318f698615f0e5d9ea7bd893680e28a8d125c86
- Frontend: sha256:13ad3b942ddce17fb4f417e0fa3bd3e5058d68b8bc73715a959220712cfa728b


### Published images
- Backend: sha256:a94c3d82819be4883804a9018bd1201ceaed85dcdb4d60cc7c7161ddbd7137c2
- Frontend: sha256:e9668fd8d84e9a3893fafc529d2d040308f2ea92dcf4cf19fb9f9284793dc6cc


### Published images
- Backend: sha256:35e9dc9523f755db9ffd163e2bd2368af2936d0d3c3e39a12a6a62438c6acbce
- Frontend: sha256:7c1d37f19f2dcecba084840dbea8eafaa20e3309788bdce5329ed0cb8de3f336


### Published images
- Backend: sha256:36a43fc99cd0b97e18c9debb15d5f39eb1d8d965ff43784fee8c23d19c724e35
- Frontend: sha256:70a42464bdba3f8a3f6a2c901499879c02ba593e89d663ed613e241c615ef1f3


### Published images
- Backend: sha256:fa80211cd57fbdacacdd24d2f048864a580520c82588009e805c91a51818fadc
- Frontend: sha256:fe5a4f16d0833fdd436e6626542afb2f27bb7deadeef3c064adfaa8336264e2e


### Published images
- Backend: sha256:2f52d6842e7961b5e597b934a458b771f6f569d8aff43fbc129003d953cc2879
- Frontend: sha256:4b0d183196b5d4610255d4ad7200db41a6a998d078e816865504cf845b344c6c


### Published images
- Backend: sha256:88e0108eecc4f2aba4193175a11e1c4aebef69647a0641e073a4ea59d9432392
- Frontend: sha256:436dc218b9a568ad13497bbcb1b2492daddf69e0995dfec6f42eb05b7ece4665


### Published images
- Backend: sha256:db40d66c7394a7dc76db3aa6fe065afd37a06983284020f22dafd2236c71e9e6
- Frontend: sha256:864c485469866daec8d76bdf1ebbae9a93c74cc7135808b24ccc978d64f3eea9


### Published images
- Backend: sha256:16e422e6d95b732847ff6dfd28caac848c3d8f1782a143a60c9254d3da4711ee
- Frontend: sha256:fcfa1f6ac0292a1e53346f4593dcefd209fa56be1f0e4768b52c1ad142b79c03


### Published images
- Backend: sha256:9a091f8f283147e412724a6eadaa8a9461a69220e44e9cb0f82bf3df1f1f02cd
- Frontend: sha256:f0458cd8f9d8869d40ef9593975b77ba5b223a0a8739758f57fbe665d12e0b0a


### Published images
- Backend: sha256:dc0b014cd5a9122c247d34955750f44a727a72ecd2f04d63e5b0cad939be7051
- Frontend: sha256:ddbf19c195c7fcfe6dd7ebb600f4d7e2324d20368326e659f30189e29645caac


### Published images
- Backend: sha256:856e8c2227124754a7fcbcc26e84588618d099c3b70f07c4d593f2ce3b33b4ca
- Frontend: sha256:4a12143f851d6f2e49f47ead3dfcf4f15ef238b9be9f5af3853971da624cb6d0


### Published images
- Backend: sha256:0fcb87726992e0349002f91a6bb50033e28dabffac2040018eb01d270159aaa9
- Frontend: sha256:4c5d83f9aef8912a5cef7d7904e8c8f7c4f72b26dec6fb1598b369113adfe1cf


### Published images
- Backend: sha256:0fcb87726992e0349002f91a6bb50033e28dabffac2040018eb01d270159aaa9
- Frontend: sha256:4c5d83f9aef8912a5cef7d7904e8c8f7c4f72b26dec6fb1598b369113adfe1cf


### Published images
- Backend: sha256:0fcb87726992e0349002f91a6bb50033e28dabffac2040018eb01d270159aaa9
- Frontend: sha256:4c5d83f9aef8912a5cef7d7904e8c8f7c4f72b26dec6fb1598b369113adfe1cf


### Published images
- Backend: sha256:0fcb87726992e0349002f91a6bb50033e28dabffac2040018eb01d270159aaa9
- Frontend: sha256:4c5d83f9aef8912a5cef7d7904e8c8f7c4f72b26dec6fb1598b369113adfe1cf


### Published images
- Backend: sha256:0b2f80ef5e753503c216e8eda1f17dcb3859df727848f958b39431f4c584f1fd
- Frontend: sha256:f037e3c2980717796d01b20e69da802dcc4b6171d049e2ac566b87aa91b4bb33


### Published images
- Backend: sha256:2cd91cf57bac6bc2e81120337e96dc530535d9c5c732d8e699ce54c7d39da87b
- Frontend: sha256:f386e425496434c3d2bd93e6a4ac861470c2133c3a3a6bd538b0a27cfc68713f


### Published images
- Backend: sha256:b5a7b194cc24d176842e1e0a810c2ab0639da89be94e94d702718f510389267c
- Frontend: sha256:e627944d2827663aef2987a6f66d1fe5335db75b379a50a1f0a96db31a508e5f


### Published images
- Backend: sha256:71e9188e759a022e2f526943929a7e6ba444e96d3571a8aa6eb0c79f8e8cabcc
- Frontend: sha256:7bc5e6d9f9e088159510574eeda30fbae742e9d9fabe0f7264a8b75a054b5573
