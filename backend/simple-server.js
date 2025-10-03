const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit!');
  res.json({ 
    status: 'OK', 
    message: 'HAFJET Cloud Accounting System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    server: 'Simple Express Server'
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { email, password } = req.body;
  
  // Mock authentication - same as frontend expects
  if ((email === 'admin' && password === 'password123') || 
      (email === 'admin@hafjet.com' && password === 'admin123')) {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: email,
          name: 'Administrator',
          role: 'admin'
        },
        token: 'jwt-token-hafjet-bukku-2024'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Kredential tidak sah'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  console.log('Get current user endpoint hit!');
  res.json({
    success: true,
    data: {
      id: '1',
      email: 'admin@hafjetbukku.com.my',
      name: 'Administrator',
      role: 'admin'
    }
  });
});

// Dashboard data endpoint
app.get('/api/dashboard', (req, res) => {
  console.log('📊 Dashboard endpoint hit!');
  res.json({
    success: true,
    data: {
      revenue: 127500.00,
      expenses: 45820.30,
      profit: 81679.70,
      profitMargin: 64.1,
      invoices: {
        total: 156,
        pending: 23,
        overdue: 8,
        paid: 125
      },
      einvoiceCompliance: 91.7,
      sstCollected: 7650.00,
      recentTransactions: [
        {
          id: '1',
          description: 'Bayaran dari Syarikat ABC Sdn Bhd',
          amount: 5300.00,
          date: '2024-10-01',
          type: 'income',
          category: 'Sales'
        },
        {
          id: '2',
          description: 'Bil elektrik pejabat',
          amount: -450.75,
          date: '2024-09-30',
          type: 'expense',
          category: 'Utilities'
        },
        {
          id: '3',
          description: 'Bayaran SST kepada LHDN',
          amount: -850.00,
          date: '2024-09-29',
          type: 'expense',
          category: 'Tax'
        },
        {
          id: '4',
          description: 'Invoice #INV-2024-001 - Hardware Solutions',
          amount: 2100.00,
          date: '2024-09-28',
          type: 'income',
          category: 'Sales'
        },
        {
          id: '5',
          description: 'Sewa pejabat bulan Oktober',
          amount: -1200.00,
          date: '2024-09-27',
          type: 'expense',
          category: 'Rent'
        }
      ],
      monthlyRevenue: [
        { month: 'Jan', amount: 95000 },
        { month: 'Feb', amount: 87000 },
        { month: 'Mar', amount: 102000 },
        { month: 'Apr', amount: 118000 },
        { month: 'May', amount: 127500 }
      ],
      malaysianMetrics: {
        sstRate: 6,
        lhdnCompliance: 'Current',
        nextSstDue: '2024-11-15',
        companiesActCompliance: true,
        auditDue: '2025-03-31'
      },
      bankingInfo: {
        totalAccounts: 3,
        mainBank: 'CIMB Bank',
        totalBalance: 184532.79,
        pendingClearance: 2340.50
      }
    }
  });
});

// Invoice endpoints
app.get('/api/invoices', (req, res) => {
  console.log('📄 Get invoices endpoint hit!');
  res.json({
    success: true,
    data: [
      {
        id: 'INV-2024-001',
        invoiceNumber: 'INV-2024-001',
        customerName: 'ABC Technologies Sdn Bhd',
        customerEmail: 'accounts@abctech.com.my',
        issueDate: '2024-09-15',
        dueDate: '2024-10-15',
        status: 'paid',
        subtotal: 5000.00,
        sstAmount: 300.00,
        totalAmount: 5300.00,
        currency: 'MYR',
        einvoiceStatus: 'submitted',
        lhdnReference: 'LHDN-2024-001-ABC'
      },
      {
        id: 'INV-2024-002',
        invoiceNumber: 'INV-2024-002',
        customerName: 'DEF Manufacturing Sdn Bhd',
        customerEmail: 'finance@defmfg.com.my',
        issueDate: '2024-09-20',
        dueDate: '2024-10-20',
        status: 'pending',
        subtotal: 2800.00,
        sstAmount: 168.00,
        totalAmount: 2968.00,
        currency: 'MYR',
        einvoiceStatus: 'pending',
        lhdnReference: ''
      }
    ]
  });
});

app.post('/api/invoices', (req, res) => {
  console.log('📄 Create invoice endpoint hit!', req.body);
  const newInvoice = {
    id: `INV-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    ...req.body,
    status: 'draft',
    einvoiceStatus: 'not_submitted'
  };
  
  res.json({
    success: true,
    data: newInvoice,
    message: 'Invoice berjaya dicipta'
  });
});

// Transaction endpoints
app.get('/api/transactions', (req, res) => {
  console.log('💰 Get transactions endpoint hit!');
  res.json({
    success: true,
    data: [
      {
        id: 'TXN-001',
        date: '2024-10-01',
        description: 'Bayaran dari ABC Technologies',
        type: 'income',
        amount: 5300.00,
        category: 'Sales Revenue',
        account: 'CIMB Current Account',
        sstAmount: 300.00
      },
      {
        id: 'TXN-002',
        date: '2024-09-30',
        description: 'Bayar bil elektrik TNB',
        type: 'expense',
        amount: 450.75,
        category: 'Utilities',
        account: 'CIMB Current Account',
        sstAmount: 0.00
      }
    ]
  });
});

// Financial Reports endpoints
app.get('/api/reports/profit-loss', (req, res) => {
  console.log('📊 Profit & Loss report endpoint hit!');
  res.json({
    success: true,
    data: {
      reportType: 'profit-loss',
      period: 'Jan 2024 - Sep 2024',
      currency: 'MYR',
      revenue: {
        salesRevenue: 542750.00,
        serviceRevenue: 185420.00,
        otherIncome: 12850.00,
        total: 741020.00
      },
      expenses: {
        costOfGoodsSold: 198450.00,
        salariesAndWages: 156780.00,
        rentExpense: 48000.00,
        utilitiesExpense: 8940.00,
        officeExpense: 15620.00,
        marketingExpense: 22350.00,
        professionalFees: 8500.00,
        sstExpense: 44461.20,
        otherExpenses: 12340.00,
        total: 515441.20
      },
      grossProfit: 542570.00,
      netProfitBeforeTax: 225578.80,
      taxExpense: 54142.00,
      netProfitAfterTax: 171436.80,
      profitMargin: 23.14
    }
  });
});

app.get('/api/reports/balance-sheet', (req, res) => {
  console.log('🏦 Balance Sheet report endpoint hit!');
  res.json({
    success: true,
    data: {
      reportType: 'balance-sheet',
      asOfDate: '30 September 2024',
      currency: 'MYR',
      assets: {
        currentAssets: {
          cashAndBank: 184532.79,
          accountsReceivable: 89450.30,
          inventory: 76890.50,
          prepaidExpenses: 12400.00,
          total: 363273.59
        },
        nonCurrentAssets: {
          propertyPlantEquipment: 145000.00,
          furnitureAndFittings: 28500.00,
          intangibleAssets: 15000.00,
          total: 188500.00
        },
        totalAssets: 551773.59
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: 45620.30,
          sstPayable: 7650.00,
          incomeTaxPayable: 18500.00,
          accruedExpenses: 12890.00,
          total: 84660.30
        },
        nonCurrentLiabilities: {
          longTermLoan: 120000.00,
          total: 120000.00
        },
        totalLiabilities: 204660.30
      },
      equity: {
        shareCapital: 100000.00,
        retainedEarnings: 247113.29,
        totalEquity: 347113.29
      },
      totalLiabilitiesAndEquity: 551773.59
    }
  });
});

app.get('/api/reports/cash-flow', (req, res) => {
  console.log('💸 Cash Flow report endpoint hit!');
  res.json({
    success: true,
    data: {
      reportType: 'cash-flow',
      period: 'Jan 2024 - Sep 2024',
      currency: 'MYR',
      operatingActivities: {
        netIncome: 171436.80,
        adjustments: {
          depreciation: 12500.00,
          changesInReceivables: -15420.30,
          changesInInventory: -8950.50,
          changesInPayables: 8760.20
        },
        netCashFromOperations: 168326.20
      },
      investingActivities: {
        purchaseOfEquipment: -28500.00,
        netCashFromInvesting: -28500.00
      },
      financingActivities: {
        loanProceeds: 50000.00,
        loanRepayments: -25000.00,
        dividendsPaid: -30000.00,
        netCashFromFinancing: -5000.00
      },
      netCashFlow: 134826.20,
      beginningCash: 49706.59,
      endingCash: 184532.79
    }
  });
});

app.get('/api/reports/trial-balance', (req, res) => {
  console.log('⚖️ Trial Balance report endpoint hit!');
  res.json({
    success: true,
    data: {
      reportType: 'trial-balance',
      asOfDate: '30 September 2024',
      currency: 'MYR',
      accounts: [
        { accountCode: '1001', accountName: 'Cash at Bank - CIMB', debit: 154532.79, credit: 0 },
        { accountCode: '1002', accountName: 'Petty Cash', debit: 2000.00, credit: 0 },
        { accountCode: '1101', accountName: 'Accounts Receivable', debit: 89450.30, credit: 0 },
        { accountCode: '1201', accountName: 'Inventory - Raw Materials', debit: 45620.50, credit: 0 },
        { accountCode: '1202', accountName: 'Inventory - Finished Goods', debit: 31270.00, credit: 0 },
        { accountCode: '1301', accountName: 'Prepaid Insurance', debit: 8400.00, credit: 0 },
        { accountCode: '1302', accountName: 'Prepaid Rent', debit: 4000.00, credit: 0 },
        { accountCode: '1501', accountName: 'Office Equipment', debit: 45000.00, credit: 0 },
        { accountCode: '1502', accountName: 'Computer Equipment', debit: 85000.00, credit: 0 },
        { accountCode: '1503', accountName: 'Furniture & Fittings', debit: 28500.00, credit: 0 },
        { accountCode: '2001', accountName: 'Accounts Payable', debit: 0, credit: 45620.30 },
        { accountCode: '2101', accountName: 'SST Payable', debit: 0, credit: 7650.00 },
        { accountCode: '2102', accountName: 'Income Tax Payable', debit: 0, credit: 18500.00 },
        { accountCode: '2201', accountName: 'Accrued Salaries', debit: 0, credit: 8890.00 },
        { accountCode: '2202', accountName: 'Accrued Utilities', debit: 0, credit: 2450.00 },
        { accountCode: '2501', accountName: 'Long Term Loan - Bank Islam', debit: 0, credit: 120000.00 },
        { accountCode: '3001', accountName: 'Share Capital', debit: 0, credit: 100000.00 },
        { accountCode: '3101', accountName: 'Retained Earnings', debit: 0, credit: 247113.29 },
        { accountCode: '4001', accountName: 'Sales Revenue', debit: 0, credit: 542750.00 },
        { accountCode: '4002', accountName: 'Service Revenue', debit: 0, credit: 185420.00 },
        { accountCode: '5001', accountName: 'Cost of Goods Sold', debit: 198450.00, credit: 0 },
        { accountCode: '6001', accountName: 'Salaries & Wages', debit: 156780.00, credit: 0 },
        { accountCode: '6002', accountName: 'Rent Expense', debit: 48000.00, credit: 0 },
        { accountCode: '6003', accountName: 'Utilities Expense', debit: 8940.00, credit: 0 },
        { accountCode: '6004', accountName: 'Office Expense', debit: 15620.00, credit: 0 },
        { accountCode: '6005', accountName: 'Marketing Expense', debit: 22350.00, credit: 0 },
        { accountCode: '6006', accountName: 'SST Expense', debit: 44461.20, credit: 0 }
      ],
      totalDebits: 980214.79,
      totalCredits: 980214.79,
      balanced: true
    }
  });
});

// Malaysian Tax & Compliance Reports
app.get('/api/reports/sst-summary', (req, res) => {
  console.log('🏛️ SST Summary report endpoint hit!');
  res.json({
    success: true,
    data: {
      reportType: 'sst-summary',
      period: 'Q3 2024 (Jul-Sep)',
      currency: 'MYR',
      sstRate: 6,
      sstCollected: {
        taxableSupplies: 127500.00,
        sstAmount: 7650.00,
        details: [
          { month: 'July', taxableSupplies: 42500.00, sstAmount: 2550.00 },
          { month: 'August', taxableSupplies: 39800.00, sstAmount: 2388.00 },
          { month: 'September', taxableSupplies: 45200.00, sstAmount: 2712.00 }
        ]
      },
      sstPaid: {
        inputTax: 2736.00,
        details: [
          { description: 'Office supplies', amount: 850.00, sstAmount: 51.00 },
          { description: 'Equipment purchase', amount: 15000.00, sstAmount: 900.00 },
          { description: 'Professional services', amount: 8500.00, sstAmount: 510.00 },
          { description: 'Marketing expenses', amount: 20750.00, sstAmount: 1245.00 },
          { description: 'Other expenses', amount: 500.00, sstAmount: 30.00 }
        ]
      },
      netSstPayable: 4914.00,
      nextReturnDue: '2024-10-31',
      compliance: 'Current'
    }
  });
});

// Business Analytics endpoints
app.get('/api/analytics/monthly-trends', (req, res) => {
  console.log('📈 Monthly trends analytics endpoint hit!');
  res.json({
    success: true,
    data: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      revenue: [65000, 58000, 72000, 68000, 75000, 82000, 78000, 85000, 89000],
      expenses: [32000, 31000, 35000, 34000, 37000, 39000, 38000, 41000, 43000],
      profit: [33000, 27000, 37000, 34000, 38000, 43000, 40000, 44000, 46000],
      sstCollected: [3900, 3480, 4320, 4080, 4500, 4920, 4680, 5100, 5340],
      customerCount: [35, 38, 42, 45, 48, 52, 55, 58, 62],
      averageInvoiceValue: [1857, 1526, 1714, 1511, 1563, 1577, 1418, 1466, 1435]
    }
  });
});

app.get('/api/analytics/customer-aging', (req, res) => {
  console.log('👥 Customer aging analysis endpoint hit!');
  res.json({
    success: true,
    data: {
      reportType: 'customer-aging',
      asOfDate: '30 September 2024',
      currency: 'MYR',
      customers: [
        {
          customerName: 'ABC Technologies Sdn Bhd',
          current: 5300.00,
          days30: 0,
          days60: 0,
          days90: 0,
          total: 5300.00
        },
        {
          customerName: 'DEF Manufacturing Sdn Bhd',
          current: 2968.00,
          days30: 1500.00,
          days60: 0,
          days90: 0,
          total: 4468.00
        },
        {
          customerName: 'GHI Retail Sdn Bhd',
          current: 0,
          days30: 0,
          days60: 1908.00,
          days90: 0,
          total: 1908.00
        },
        {
          customerName: 'JKL Services Sdn Bhd',
          current: 3250.00,
          days30: 0,
          days60: 0,
          days90: 850.00,
          total: 4100.00
        }
      ],
      totals: {
        current: 11518.00,
        days30: 1500.00,
        days60: 1908.00,
        days90: 850.00,
        total: 15776.00
      }
    }
  });
});

// LHDN E-Invoice compliance endpoints
app.get('/api/einvoice/status', (req, res) => {
  console.log('📧 E-Invoice status endpoint hit!');
  res.json({
    success: true,
    data: {
      complianceRate: 91.7,
      totalInvoices: 156,
      submitted: 143,
      approved: 138,
      pending: 5,
      rejected: 8,
      notSubmitted: 13,
      monthlySubmissions: [
        { month: 'Jul', submitted: 48, approved: 46, rejected: 2 },
        { month: 'Aug', submitted: 52, approved: 50, rejected: 2 },
        { month: 'Sep', submitted: 43, approved: 42, rejected: 1 }
      ],
      nextSubmissionDue: '2024-10-05',
      lhdnSystemStatus: 'Online'
    }
  });
});

// ===============================
// SETTINGS & TAX CONFIGURATION APIs
// ===============================

// Company Settings
app.get('/api/settings/company', (req, res) => {
  console.log('🏢 Company settings endpoint hit!');
  res.json({
    success: true,
    data: {
      companyInfo: {
        name: 'HAFJET Technology Sdn Bhd',
        registrationNumber: '202301234567',
        ssmNumber: '201234567890',
        taxNumber: 'C12345678901',
        businessType: 'Information Technology',
        incorporationDate: '2023-01-15',
        paidUpCapital: 100000.00
      },
      address: {
        street: '123, Jalan Teknologi 5/9',
        city: 'Cyberjaya',
        state: 'Selangor',
        postcode: '63000',
        country: 'Malaysia'
      },
      contact: {
        phone: '+603-8312-5678',
        fax: '+603-8312-5679',
        email: 'admin@hafjet.com.my',
        website: 'https://hafjet.com.my'
      },
      banking: {
        bankName: 'Maybank Islamic Berhad',
        accountNumber: '5141-2345-6789',
        accountName: 'HAFJET Technology Sdn Bhd',
        swiftCode: 'MBBEMYKL'
      },
      fiscalYear: {
        startMonth: 1,
        startDay: 1,
        endMonth: 12,
        endDay: 31
      },
      currency: {
        base: 'MYR',
        symbol: 'RM',
        decimalPlaces: 2
      }
    }
  });
});

app.put('/api/settings/company', (req, res) => {
  console.log('🏢 Company settings update endpoint hit!');
  const updates = req.body;
  
  // In real implementation, validate and save to database
  res.json({
    success: true,
    message: 'Company settings updated successfully',
    data: updates
  });
});

// Tax Configuration
app.get('/api/settings/tax', (req, res) => {
  console.log('💰 Tax settings endpoint hit!');
  res.json({
    success: true,
    data: {
      sst: {
        enabled: true,
        registrationNumber: 'SST-12345678',
        rate: 6.0,
        roundingMethod: 'nearest_cent',
        inclusiveInPrice: false,
        returnPeriod: 'bi-monthly',
        nextReturnDue: '2024-11-30',
        lastReturnSubmitted: '2024-09-30'
      },
      einvoice: {
        enabled: true,
        environment: 'sandbox', // 'sandbox' or 'production'
        clientId: 'HAFJET_CLIENT_ID',
        taxpayerTin: '890123456789',
        idType: 'TIN',
        apiBaseUrl: 'https://preprod-api.myinvois.hasil.gov.my',
        submissionMethod: 'api',
        autoSubmit: true,
        validationEnabled: true
      },
      withholdingTax: {
        enabled: true,
        defaultRate: 10.0,
        categories: [
          { type: 'interest', rate: 15.0, threshold: 2500.00 },
          { type: 'dividend', rate: 0.0, threshold: 0 },
          { type: 'royalty', rate: 10.0, threshold: 100.00 },
          { type: 'rent', rate: 10.0, threshold: 2500.00 },
          { type: 'service_fees', rate: 10.0, threshold: 100.00 }
        ]
      },
      compliance: {
        monthlyTaxEstimate: true,
        quarterlyReporting: true,
        auditTrail: true,
        backupRetention: 7, // years
        documentRetention: 5 // years
      }
    }
  });
});

app.put('/api/settings/tax', (req, res) => {
  console.log('💰 Tax settings update endpoint hit!');
  const { taxType, settings } = req.body;
  
  // Validate tax settings
  if (taxType === 'sst' && settings.rate > 10) {
    return res.status(400).json({
      success: false,
      error: 'SST rate cannot exceed 10%'
    });
  }
  
  res.json({
    success: true,
    message: `${taxType.toUpperCase()} settings updated successfully`,
    data: { taxType, settings }
  });
});

// E-Invoice Configuration
app.get('/api/settings/einvoice', (req, res) => {
  console.log('📋 E-Invoice settings endpoint hit!');
  res.json({
    success: true,
    data: {
      connection: {
        status: 'connected',
        environment: 'sandbox',
        lastSync: '2024-10-02T14:30:00.000Z',
        apiVersion: 'v1.0'
      },
      configuration: {
        taxpayerTin: '890123456789',
        submissionMode: 'automatic',
        validationLevel: 'strict',
        notificationEmail: 'accounts@hafjet.com.my',
        retryAttempts: 3,
        timeoutSeconds: 30
      },
      templates: [
        {
          id: 'standard_invoice',
          name: 'Standard Invoice',
          type: 'invoice',
          isDefault: true,
          fields: ['buyer', 'seller', 'lineItems', 'taxSummary']
        },
        {
          id: 'credit_note',
          name: 'Credit Note',
          type: 'credit_note',
          isDefault: false,
          fields: ['buyer', 'seller', 'originalInvoice', 'lineItems']
        }
      ],
      statistics: {
        totalSubmitted: 156,
        approved: 149,
        rejected: 7,
        pending: 0,
        successRate: 95.51
      }
    }
  });
});

// User Management
app.get('/api/settings/users', (req, res) => {
  console.log('👥 User management endpoint hit!');
  res.json({
    success: true,
    data: {
      users: [
        {
          id: 'user_001',
          username: 'admin',
          email: 'admin@hafjet.com.my',
          fullName: 'System Administrator',
          role: 'administrator',
          permissions: ['all'],
          status: 'active',
          lastLogin: '2024-10-02T08:30:00.000Z',
          createdAt: '2024-01-15T00:00:00.000Z'
        },
        {
          id: 'user_002',
          username: 'accountant',
          email: 'accounts@hafjet.com.my',
          fullName: 'Senior Accountant',
          role: 'accountant',
          permissions: ['accounting', 'reports', 'invoices'],
          status: 'active',
          lastLogin: '2024-10-02T09:15:00.000Z',
          createdAt: '2024-02-01T00:00:00.000Z'
        },
        {
          id: 'user_003',
          username: 'clerk',
          email: 'clerk@hafjet.com.my',
          fullName: 'Accounts Clerk',
          role: 'clerk',
          permissions: ['invoices', 'transactions'],
          status: 'active',
          lastLogin: '2024-10-01T16:45:00.000Z',
          createdAt: '2024-03-15T00:00:00.000Z'
        }
      ],
      roles: [
        {
          name: 'administrator',
          displayName: 'Administrator',
          permissions: ['all'],
          description: 'Full system access'
        },
        {
          name: 'accountant',
          displayName: 'Accountant',
          permissions: ['accounting', 'reports', 'invoices', 'transactions', 'tax'],
          description: 'Full accounting access'
        },
        {
          name: 'clerk',
          displayName: 'Accounts Clerk',
          permissions: ['invoices', 'transactions'],
          description: 'Limited accounting access'
        },
        {
          name: 'viewer',
          displayName: 'Report Viewer',
          permissions: ['reports'],
          description: 'Read-only access to reports'
        }
      ]
    }
  });
});

// System Preferences
app.get('/api/settings/system', (req, res) => {
  console.log('⚙️ System settings endpoint hit!');
  res.json({
    success: true,
    data: {
      general: {
        companyName: 'HAFJET Technology Sdn Bhd',
        timezone: 'Asia/Kuala_Lumpur',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        language: 'en',
        currency: 'MYR'
      },
      invoice: {
        prefix: 'INV',
        startingNumber: 1001,
        currentNumber: 1156,
        autoGenerate: true,
        emailOnCreate: true,
        printLogo: true,
        showPaymentTerms: true,
        defaultPaymentTerms: 30
      },
      notifications: {
        emailNotifications: true,
        invoiceReminders: true,
        paymentNotifications: true,
        taxReminders: true,
        einvoiceAlerts: true,
        lowStockAlerts: false
      },
      backup: {
        autoBackup: true,
        frequency: 'daily',
        retentionDays: 30,
        includeAttachments: true,
        cloudStorage: 'enabled',
        lastBackup: '2024-10-02T02:00:00.000Z'
      },
      security: {
        sessionTimeout: 60, // minutes
        passwordPolicy: 'strong',
        twoFactorAuth: false,
        ipWhitelist: [],
        auditLog: true,
        encryptionEnabled: true
      }
    }
  });
});

app.put('/api/settings/system', (req, res) => {
  console.log('⚙️ System settings update endpoint hit!');
  const updates = req.body;
  
  res.json({
    success: true,
    message: 'System settings updated successfully',
    data: updates
  });
});

// SST Return Submission
app.post('/api/settings/tax/sst/submit-return', (req, res) => {
  console.log('📊 SST return submission endpoint hit!');
  const { period, data } = req.body;
  
  res.json({
    success: true,
    message: 'SST return submitted successfully',
    data: {
      submissionId: 'SST_' + Date.now(),
      period: period,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      acknowledgmentNumber: 'ACK' + Math.random().toString(36).substr(2, 9).toUpperCase()
    }
  });
});

// E-Invoice Test Connection
app.post('/api/settings/einvoice/test-connection', (req, res) => {
  console.log('🔌 E-Invoice connection test endpoint hit!');
  
  // Simulate connection test
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Connection test successful',
      data: {
        status: 'connected',
        environment: 'sandbox',
        responseTime: '245ms',
        apiVersion: 'v1.0',
        testedAt: new Date().toISOString()
      }
    });
  }, 1000);
});

// ==============================================
// DIGITAL SHOEBOX API ENDPOINTS
// ==============================================

// Digital Shoebox - Get Documents
app.get('/api/digital-shoebox/documents', (req, res) => {
  console.log('Fetching digital shoebox documents');
  
  const documents = [
    {
      id: '1',
      filename: 'receipt_kfc_20241002.jpg',
      fileType: 'receipt',
      uploadDate: '2024-10-02 14:30',
      status: 'ready',
      extractedData: {
        merchantName: 'KFC Malaysia',
        amount: 25.50,
        date: '2024-10-02',
        items: [
          { description: 'Zinger Burger Set', quantity: 1, price: 18.90 },
          { description: 'Hot & Crispy Chicken', quantity: 1, price: 6.60 }
        ],
        taxAmount: 1.44,
        taxRate: 6.0,
        category: 'Meals & Entertainment'
      },
      thumbnailUrl: '/api/thumbnails/receipt_kfc.jpg'
    },
    {
      id: '2',
      filename: 'invoice_streamyx_202410.pdf',
      fileType: 'bill',
      uploadDate: '2024-10-01 09:15',
      status: 'ready',
      extractedData: {
        merchantName: 'TM Streamyx',
        amount: 89.00,
        date: '2024-10-01',
        items: [
          { description: 'Streamyx 8Mbps Plan', quantity: 1, price: 89.00 }
        ],
        taxAmount: 5.34,
        taxRate: 6.0,
        category: 'Internet & Communications'
      },
      thumbnailUrl: '/api/thumbnails/streamyx_bill.jpg'
    },
    {
      id: '3',
      filename: 'petrol_receipt_shell.jpg',
      fileType: 'receipt',
      uploadDate: '2024-10-02 08:45',
      status: 'processing',
      thumbnailUrl: '/api/thumbnails/processing.jpg'
    }
  ];

  res.json({
    success: true,
    data: documents
  });
});

// Digital Shoebox - Upload Documents
app.post('/api/digital-shoebox/upload', (req, res) => {
  console.log('Uploading document to digital shoebox:', req.body);
  
  // Simulate file upload processing
  const { filename, fileType } = req.body;
  
  const newDocument = {
    id: Date.now().toString(),
    filename: filename || 'unknown_file.jpg',
    fileType: fileType || 'receipt',
    uploadDate: new Date().toLocaleString(),
    status: 'processing',
    thumbnailUrl: '/api/thumbnails/processing.jpg'
  };

  // Simulate OCR processing delay
  setTimeout(() => {
    newDocument.status = 'ready';
    newDocument.extractedData = {
      merchantName: 'Sample Merchant Sdn Bhd',
      amount: Math.floor(Math.random() * 100) + 10,
      date: new Date().toISOString().split('T')[0],
      items: [
        { description: 'Sample Item', quantity: 1, price: 45.60 }
      ],
      taxAmount: 2.73,
      taxRate: 6.0,
      category: 'Office Expenses'
    };
  }, 3000);

  res.json({
    success: true,
    data: newDocument,
    message: 'Document uploaded successfully and processing started'
  });
});

// Digital Shoebox - Approve Document (Convert to Transaction)
app.post('/api/digital-shoebox/approve/:documentId', (req, res) => {
  const { documentId } = req.params;
  const { extractedData } = req.body;
  
  console.log('Approving document:', documentId, extractedData);
  
  // Create transaction from extracted data
  const transaction = {
    id: 'TXN' + Date.now(),
    date: extractedData.date,
    description: `Purchase from ${extractedData.merchantName}`,
    amount: extractedData.amount,
    category: extractedData.category,
    type: 'expense',
    status: 'completed',
    tax: {
      rate: extractedData.taxRate,
      amount: extractedData.taxAmount
    },
    sourceDocument: documentId,
    createdAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: {
      transaction: transaction,
      message: 'Document approved and transaction created'
    }
  });
});

// Digital Shoebox - Get Settings (WhatsApp, Email)
app.get('/api/digital-shoebox/settings', (req, res) => {
  console.log('Fetching digital shoebox settings');
  
  const settings = {
    whatsapp: {
      enabled: true,
      number: '+60-16 699-9999',
      registeredUsers: ['hafiz@hafjet.com', 'admin@hafjet.com']
    },
    email: {
      enabled: true,
      address: 'hafizgadjet.43e9d8@bukku.xyz',
      allowedDomains: ['hafjet.com', 'bukku.xyz']
    },
    ocr: {
      language: 'en,ms',
      autoApprove: false,
      confidenceThreshold: 0.8
    },
    processing: {
      splitPdf: true,
      autoCategory: true,
      taxDetection: true
    }
  };

  res.json({
    success: true,
    data: settings
  });
});

// Catch all for debugging - MUST BE LAST
app.use('*', (req, res) => {
  console.log(`Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    path: req.originalUrl
  });
});

// Error handling middleware - MUST BE LAST
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Server error', 
    error: err.message 
  });
});

// Start server with better error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HAFJET Cloud Accounting System Simple API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

server.on('error', (err) => {
  console.error('❌ Server startup error:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Please stop other processes or use a different port.`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;