#!/usr/bin/env node
/*
 Minimal MongoDB restore script.
 Usage:
  node scripts/db-restore.js <backupDir>

 Behavior:
 - If `mongorestore` is available on PATH, uses it to restore from binary dump.
 - Otherwise expects JSON files per collection and inserts them into the target DB.
 Note: Use a test DB for restores to avoid overwriting production data.
*/

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const backupDir = process.argv[2];
if (!backupDir) {
  console.error('Usage: node scripts/db-restore.js <backupDir>');
  process.exit(2);
}

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hafjet-bukku';

function hasMongorestore() {
  try {
    const r = spawnSync('mongorestore', ['--version'], { encoding: 'utf8' });
    return r.status === 0;
  } catch (e) {
    return false;
  }
}

async function restoreByDriver() {
  console.log('Restoring JSON files via MongoDB driver');
  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
  await client.connect();
  const dbName = client.db().databaseName || 'hafjet-bukku';
  const db = client.db(dbName);
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const colName = path.basename(f, '.json');
    const full = path.join(backupDir, f);
    const content = JSON.parse(fs.readFileSync(full, 'utf8'));
    if (!Array.isArray(content)) {
      console.warn('Skipping non-array JSON file', f);
      continue;
    }
    if (content.length === 0) {
      console.log('Skipping empty collection', colName);
      continue;
    }
    // Optional: drop collection first (commented out to be safe)
    // await db.collection(colName).drop().catch(()=>{});
    // Insert documents - remove _id to avoid collision
    const toInsert = content.map(d => { const copy = {...d}; delete copy._id; return copy; });
    const res = await db.collection(colName).insertMany(toInsert);
    console.log('Inserted', res.insertedCount, 'into', colName);
  }
  await client.close();
}

(async function main() {
  if (hasMongorestore()) {
    console.log('Using mongorestore to restore database...');
    const args = ['--uri', mongoUri, backupDir];
    const res = spawnSync('mongorestore', args, { stdio: 'inherit' });
    if (res.status === 0) console.log('mongorestore completed');
    else console.error('mongorestore failed with status', res.status);
  } else {
    await restoreByDriver();
  }
})();
