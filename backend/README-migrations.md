# Database Migrations (migrate-mongo)

This repository includes a simple migrate-mongo scaffold.

Quick start:

```powershell
cd backend
# create a migration (requires migrate-mongo installed locally or npx)
npx migrate-mongo create add-field-to-collection

# run migrations
npx migrate-mongo up

# revert last migration
npx migrate-mongo down
```

Notes:
- The config file is `backend/migrate-mongo-config.js` and migrations live in `backend/migrations`.
- Each migration exports `up(db, client)` and `down(db, client)` functions.
- Commit migration files to source control.
