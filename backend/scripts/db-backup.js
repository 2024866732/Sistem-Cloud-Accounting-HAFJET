#!/usr/bin/env node
/*
 Minimal MongoDB backup script.
 Usage:
  node scripts/db-backup.js [outputDir]

 Behavior:
 - If `mongodump` is available on PATH, uses it to create a binary dump in outputDir (timestamped).
 - Otherwise falls back to exporting all collections to JSON files using native driver.

 Note: set MONGO_URI env var or create a .env in backend directory.
*/

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const outBase = process.argv[2] || path.join(__dirname, '..', 'backups');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(outBase, ts);

if (!fs.existsSync(outBase)) fs.mkdirSync(outBase, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hafjet-bukku';

function hasMongodump() {
  try {
    const r = spawnSync('mongodump', ['--version'], { encoding: 'utf8' });
    return r.status === 0;
  } catch (e) {
    return false;
  }
}

async function dumpByDriver() {
  console.log('Falling back to JSON export via MongoDB driver');
  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
  await client.connect();
  const dbName = client.db().databaseName || 'hafjet-bukku';
  const db = client.db(dbName);
  const cols = await db.collections();
  for (const c of cols) {
    const docs = await c.find({}).toArray();
    const fname = path.join(outDir, `${c.collectionName}.json`);
    fs.writeFileSync(fname, JSON.stringify(docs, null, 2), 'utf8');
    console.log('Exported', c.collectionName, '->', fname);
  }
  await client.close();
}

(async function main() {
  console.log('Mongo URI:', mongoUri);
  if (hasMongodump()) {
    try {
      console.log('Using mongodump to create binary dump...');
      const args = ['--uri', mongoUri, '--out', outDir];
      const res = spawnSync('mongodump', args, { stdio: 'inherit' });
      if (res.status === 0) console.log('mongodump completed:', outDir);
      else console.error('mongodump failed with status', res.status);
    } catch (e) {
      console.error('mongodump failed, falling back:', e.message);
      await dumpByDriver();
    }
  } else {
    await dumpByDriver();
  }
  console.log('Backup completed:', outDir);
})();
