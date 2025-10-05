# Backup & Restore (Backend)

This document explains the minimal backup & restore utilities included in `backend/scripts`.

WARNING: Always test restores in a non-production environment first.

## Quick usage

Install dependencies and ensure `MONGO_URI` points to the DB you want to back up/restore.

Create a backup (timestamped directory):

```powershell
cd backend
# optional: set target Mongo URI if required
$env:MONGO_URI = 'mongodb://localhost:27017/hafjet-bukku'
npm run db:backup
```

Restore from a backup directory (use a test DB):

```powershell
cd backend
# ensure MONGO_URI points to a safe test DB
$env:MONGO_URI = 'mongodb://localhost:27017/hafjet-bukku-test'
# path is the backups/2025-... dir created by db-backup
node scripts/db-restore.js ./backups/2025-10-05T...-...-... 
```

## How it works
- If `mongodump`/`mongorestore` are installed on PATH they will be used for binary dumps/restores.
- Otherwise, the scripts will fallback to using the MongoDB driver to export/import JSON collection files.

## Notes
- The driver fallback removes `_id` values during restore to avoid insertion collisions; if you need exact binary restores, install `mongodump`/`mongorestore`.
- Backups are stored under `backend/backups/<timestamp>/` by default.
- Automate these scripts with cron/CI and ensure backups are stored off-host (S3/Blob) for production readiness.
