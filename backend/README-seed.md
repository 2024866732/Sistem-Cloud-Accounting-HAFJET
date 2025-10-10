# Seeding the database (UAT) with Docker

This project includes a small automated flow to seed UAT data using Docker Compose. It will:

- Start a temporary MongoDB container (`mongo:6.0`) on port `27018` to avoid clashing with local Mongo instances.
- Start a Node runner container that installs backend dependencies, builds the TypeScript backend, and runs the compiled seed script (`dist/utils/seed.js`).

How to run (Windows PowerShell):

```powershell
cd <repo-root>
docker compose -f docker-compose.seed.yml up --build --abort-on-container-exit --exit-code-from backend-seed-runner
```

Or use the included convenience helper (PowerShell):

```powershell
.\scripts\seed-with-docker.ps1
```

Notes:
- The seed script will try to connect to the DB and upsert users. If it cannot reach MongoDB it will fallback to writing JSON files under `backend/seeds/`.
- The seeded Mongo DB will persist to a named Docker volume `mongo_seed_data`. If you want ephemeral data, remove that volume after the run.
- If you want the container to bind to the host port 27017, update `docker-compose.seed.yml` accordingly.
