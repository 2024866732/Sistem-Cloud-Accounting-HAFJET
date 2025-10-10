import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

// Import models (use relative imports assuming standard model files exist)
import User from '../models/User.js'
import { Company } from '../models/Company.js'
// Invoice type file in this project is a types-only declaration. We'll write sample
// invoice JSON to backend/seeds/ for manual import instead of importing a model.

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hafjet-bukku'

async function connect() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to', MONGO_URI)
    return true
  } catch (err) {
    console.warn('Could not connect to MongoDB at', MONGO_URI)
    return false
  }
}

function now() { return new Date() }

async function seedUsers() {
  // Ensure there is a company to attach users to
  let company: any = await Company.findOne({ registrationNumber: 'UAT-001' }).exec()
  if (!company) {
    company = await Company.create({
      name: 'UAT Company',
      registrationNumber: 'UAT-001',
      taxNumber: 'TAX-UAT-001',
      address: {
        street: '1 UAT Street',
        city: 'Kuala Lumpur',
        state: 'KL',
        postalCode: '50000',
        country: 'Malaysia'
      },
      contact: { phone: '+60 12-3456789', email: 'uat@company.test' }
    })
    console.log('Created company for UAT:', String(company._id))
  } else {
    console.log('Using existing company for UAT:', String(company._id))
  }

  // Map roles from legacy seed to valid enum values
  const users = [
    { email: 'admin@hafjet.test', name: 'UAT Admin', role: 'admin', password: 'Password123!', twoFactorEnabled: false },
    { email: 'finance@hafjet.test', name: 'UAT Finance', role: 'staff', password: 'Password123!', twoFactorEnabled: false },
    { email: 'manager@hafjet.test', name: 'UAT Manager', role: 'manager', password: 'Password123!', twoFactorEnabled: false }
  ]

  for (const u of users) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: u.email, companyId: company._id }).exec()
      if (existing) {
        console.log(`User exists: ${u.email}`)
        continue
      }
      const created = await User.create({
        email: u.email,
        name: u.name,
        role: u.role,
        password: u.password,
        twoFactorEnabled: u.twoFactorEnabled,
        companyId: company._id,
        createdAt: now()
      })
      console.log('Created user:', created.email)
    }
  }
}

async function seedInvoices() {
  const seedsDir = path.resolve(__dirname, '../../seeds')
  if (!fs.existsSync(seedsDir)) fs.mkdirSync(seedsDir, { recursive: true })

  const invoices = [
    {
      reference: 'UAT-INV-001',
      customerName: 'Acme Sdn Bhd',
      items: [{ description: 'Consulting', quantity: 1, unitPrice: 1000 }],
      total: 1000,
      status: 'draft',
      createdAt: now()
    },
    {
      reference: 'UAT-INV-002',
      customerName: 'Borneo Trading',
      items: [{ description: 'Subscription', quantity: 12, unitPrice: 50 }],
      total: 600,
      status: 'issued',
      createdAt: now()
    }
  ]

  const outPath = path.join(seedsDir, 'uat-invoices.json')
  fs.writeFileSync(outPath, JSON.stringify(invoices, null, 2), 'utf8')
  console.log('Wrote sample invoices to', outPath)
}

function writeSeedFiles() {
  const seedsDir = path.resolve(__dirname, '../../seeds')
  if (!fs.existsSync(seedsDir)) fs.mkdirSync(seedsDir, { recursive: true })

  // Create a company stub and reference its _id in users so manual imports have a company
  const company = {
    _id: '000000000000000000000001',
    name: 'UAT Company',
    registrationNumber: 'UAT-001',
    taxNumber: 'TAX-UAT-001',
    address: {
      street: '1 UAT Street',
      city: 'Kuala Lumpur',
      state: 'KL',
      postalCode: '50000',
      country: 'Malaysia'
    },
    contact: { phone: '+60 12-3456789', email: 'uat@company.test' }
  }

  const users = [
    { email: 'admin@hafjet.test', name: 'UAT Admin', role: 'admin', companyId: company._id },
    { email: 'finance@hafjet.test', name: 'UAT Finance', role: 'staff', companyId: company._id },
    { email: 'manager@hafjet.test', name: 'UAT Manager', role: 'manager', companyId: company._id }
  ]

  const invoices = [
    {
      reference: 'UAT-INV-001',
      customerName: 'Acme Sdn Bhd',
      items: [{ description: 'Consulting', quantity: 1, unitPrice: 1000 }],
      total: 1000,
      status: 'draft',
      createdAt: now()
    },
    {
      reference: 'UAT-INV-002',
      customerName: 'Borneo Trading',
      items: [{ description: 'Subscription', quantity: 12, unitPrice: 50 }],
      total: 600,
      status: 'issued',
      createdAt: now()
    }
  ]

  fs.writeFileSync(path.join(seedsDir, 'uat-users.json'), JSON.stringify(users, null, 2), 'utf8')
  fs.writeFileSync(path.join(seedsDir, 'uat-companies.json'), JSON.stringify([company], null, 2), 'utf8')
  fs.writeFileSync(path.join(seedsDir, 'uat-invoices.json'), JSON.stringify(invoices, null, 2), 'utf8')
  console.log('Wrote seed JSON files to', seedsDir)
  console.log('To import to MongoDB, run:')
  console.log('  mongoimport --uri "<MONGO_URI>" --collection users --file backend/seeds/uat-users.json --jsonArray')
  console.log('  mongoimport --uri "<MONGO_URI>" --collection invoices --file backend/seeds/uat-invoices.json --jsonArray')
}

async function main() {
  try {
    const connected = await connect()
    if (connected) {
      await seedUsers()
      await seedInvoices()
    } else {
      // fallback: write seed JSON files for manual import
      writeSeedFiles()
    }
    console.log('Seeding completed')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed', err)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export default main
