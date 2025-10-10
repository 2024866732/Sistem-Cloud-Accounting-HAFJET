#!/usr/bin/env node
const { MongoMemoryServer } = require('mongodb-memory-server')
const { spawn } = require('child_process')

async function main() {
  console.log('Starting in-memory MongoDB...')
  const mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  console.log('In-memory MongoDB URI:', uri)

  console.log('Running compiled seed script against in-memory MongoDB...')
  const env = Object.assign({}, process.env, { MONGO_URI: uri })

  const proc = spawn(process.execPath, ['dist/utils/seed.js'], { cwd: __dirname + '/..', env, stdio: 'inherit' })

  proc.on('close', async (code) => {
    console.log('Seed process exited with code', code)
    try {
      await mongod.stop()
      console.log('Stopped in-memory MongoDB')
    } catch (e) {
      console.error('Failed to stop in-memory mongod', e)
    }
    process.exit(code)
  })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
