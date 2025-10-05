#!/usr/bin/env node
/**
 * Test script for validating backup and restore functionality
 * Usage: node backend/scripts/test-backup-restore.js
 * 
 * This script:
 * 1. Seeds test data to MongoDB
 * 2. Creates a backup using db-backup.js
 * 3. Drops the database
 * 4. Restores from backup using db-restore.js
 * 5. Validates that data was restored correctly
 */

const mongoose = require('mongoose');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
let MongoMemoryServer;

// Test configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hafjet-bukku-test';
const TEST_COLLECTION = 'backuptests';
const TEST_DATA = [
  { _id: 'test1', name: 'Test Document 1', value: 100, timestamp: new Date() },
  { _id: 'test2', name: 'Test Document 2', value: 200, timestamp: new Date() },
  { _id: 'test3', name: 'Test Document 3', value: 300, timestamp: new Date() }
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[STEP ${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function connectDB() {
  try {
    // Determine whether to use in-memory MongoDB
    const useInMemoryEnv = (process.env.USE_INMEMORY || '').toString().toLowerCase();
    const useInMemory = ['1', 'true', 'yes'].includes(useInMemoryEnv);

    let dockerAvailable = false;
    try {
      const r = spawnSync('docker', ['--version']);
      dockerAvailable = r && r.status === 0;
    } catch (e) {
      dockerAvailable = false;
    }

    log(`USE_INMEMORY env: "${process.env.USE_INMEMORY}", dockerAvailable: ${dockerAvailable}`);

    // If USE_INMEMORY is explicitly requested, or docker is not available, use in-memory mongo
    if (useInMemory || !dockerAvailable) {
      try {
        MongoMemoryServer = MongoMemoryServer || require('mongodb-memory-server').MongoMemoryServer;
      } catch (e) {
        console.error('mongodb-memory-server not installed. Install dev dependency or run with Docker available.');
        throw e;
      }

  // mongodb-memory-server v7+ exposes a create() helper which starts the server
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  // store mongod instance for cleanup
  process._hf_mongod = mongod;
  // ensure other child processes (db-backup.js) see the in-memory URI
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri);
    } else {
      await mongoose.connect(MONGO_URI);
    }
    logSuccess(`Connected to MongoDB: ${MONGO_URI}`);
  } catch (error) {
    logError(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
}

async function seedTestData() {
  logStep(1, 'Seeding test data...');
  
  const db = mongoose.connection.db;
  const collection = db.collection(TEST_COLLECTION);
  
  // Clear existing test data
  await collection.deleteMany({});
  
  // Insert test documents
  await collection.insertMany(TEST_DATA);
  
  const count = await collection.countDocuments();
  logSuccess(`Seeded ${count} test documents to ${TEST_COLLECTION} collection`);
  
  return count;
}

async function runBackup() {
  logStep(2, 'Running backup script...');
  
  try {
    const output = execSync('node backend/scripts/db-backup.js', {
      cwd: path.resolve(__dirname, '../..'),
      encoding: 'utf8',
      env: { ...process.env }
    });
    
    log(output);
    
    // Find the backup directory from output
    const match = output.match(/Backup completed: (.+)/);
    if (!match) {
      throw new Error('Could not find backup directory in output');
    }
    
    const backupDir = match[1];
    logSuccess(`Backup created: ${backupDir}`);
    
    // Verify backup files exist
    if (!fs.existsSync(backupDir)) {
      throw new Error(`Backup directory not found: ${backupDir}`);
    }
    
    const files = fs.readdirSync(backupDir);
    logSuccess(`Backup contains ${files.length} files`);
    
    return backupDir;
  } catch (error) {
    logError(`Backup failed: ${error.message}`);
    throw error;
  }
}

async function dropDatabase() {
  logStep(3, 'Dropping database to simulate data loss...');
  
  const db = mongoose.connection.db;
  await db.dropDatabase();
  
  logSuccess('Database dropped');
}

async function runRestore(backupDir) {
  logStep(4, 'Running restore script...');
  
  try {
    const output = execSync(`node backend/scripts/db-restore.js "${backupDir}"`, {
      cwd: path.resolve(__dirname, '../..'),
      encoding: 'utf8',
      env: { ...process.env }
    });
    
    log(output);
    logSuccess('Restore completed');
  } catch (error) {
    logError(`Restore failed: ${error.message}`);
    throw error;
  }
}

async function validateRestore(originalCount) {
  logStep(5, 'Validating restored data...');
  
  const db = mongoose.connection.db;
  const collection = db.collection(TEST_COLLECTION);
  
  // Check document count
  const count = await collection.countDocuments();
  if (count !== originalCount) {
    throw new Error(`Document count mismatch: expected ${originalCount}, got ${count}`);
  }
  logSuccess(`Document count matches: ${count}`);
  
  // Validate each test document
  for (const testDoc of TEST_DATA) {
    const doc = await collection.findOne({ _id: testDoc._id });
    
    if (!doc) {
      throw new Error(`Document ${testDoc._id} not found after restore`);
    }
    
    if (doc.name !== testDoc.name || doc.value !== testDoc.value) {
      throw new Error(`Document ${testDoc._id} data mismatch`);
    }
  }
  
  logSuccess(`All ${TEST_DATA.length} test documents validated successfully`);
}

async function cleanup(backupDir) {
  logStep(6, 'Cleaning up...');
  
  // Remove test data
  const db = mongoose.connection.db;
  const collection = db.collection(TEST_COLLECTION);
  await collection.deleteMany({});
  logSuccess('Test data cleaned up');
  
  // Remove backup directory
  if (backupDir && fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
    logSuccess(`Backup directory removed: ${backupDir}`);
  }
  
  await mongoose.disconnect();
  // Stop in-memory mongod if started
  if (process._hf_mongod && typeof process._hf_mongod.stop === 'function') {
    try {
      await process._hf_mongod.stop();
      logSuccess('Stopped in-memory mongod');
    } catch (e) {
      logWarning(`Failed to stop in-memory mongod: ${e.message}`);
    }
  }
  logSuccess('Disconnected from MongoDB');
}

async function main() {
  log('\n🧪 Backup/Restore Functionality Test\n', 'blue');
  log('='.repeat(50), 'blue');
  
  let backupDir = null;
  let originalCount = 0;
  
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Seed test data
    originalCount = await seedTestData();
    
    // Create backup
    backupDir = await runBackup();
    
    // Drop database
    await dropDatabase();
    
    // Restore from backup
    await runRestore(backupDir);
    
    // Validate restored data
    await validateRestore(originalCount);
    
    // Success
    log('\n' + '='.repeat(50), 'green');
    log('✅ BACKUP/RESTORE TEST PASSED', 'green');
    log('='.repeat(50) + '\n', 'green');
    
    process.exit(0);
  } catch (error) {
    log('\n' + '='.repeat(50), 'red');
    logError(`BACKUP/RESTORE TEST FAILED: ${error.message}`);
    log('='.repeat(50) + '\n', 'red');
    
    if (error.stack) {
      console.error(error.stack);
    }
    
    process.exit(1);
  } finally {
    // Cleanup
    try {
      await cleanup(backupDir);
    } catch (cleanupError) {
      logWarning(`Cleanup failed: ${cleanupError.message}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
