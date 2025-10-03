import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get dashboard data with Malaysian KPIs
router.get('/stats', authenticateToken, (req, res) => {
  try {
    // Calculate Malaysian business metrics
    const dashboardData = {
      // Main KPIs
      revenue: {
        total: 127500.00,
        currency: 'MYR',
        growth: 12.5,
        thisMonth: 28400.00,
        lastMonth: 25200.00
      },
      expenses: {
        total: 45600.00,
        currency: 'MYR',
        growth: -8.2,
        thisMonth: 8900.00,
        lastMonth: 9700.00
      },
      profit: {
        total: 81900.00,
        currency: 'MYR',
        margin: 64.2,
        growth: 22.1
      },
      
      // Malaysian Tax Information
      tax: {
        sstCollected: 7650.00,
        sstPayable: 2736.00,
        taxRate: 6.0,
        nextPaymentDue: '2024-11-15',
        compliance: 'Current'
      },

      // E-Invoice Status
      einvoice: {
        submitted: 24,
        approved: 22,
        pending: 2,
        rejected: 0,
        complianceRate: 91.7
      },

      // Customer Metrics
      customers: {
        total: 48,
        active: 35,
        newThisMonth: 5,
        topCustomer: 'ABC Sdn Bhd'
      },

      // Invoice Status
      invoices: {
        total: 28,
        paid: 22,
        pending: 4,
        overdue: 2,
        draft: 0
      },

      // Recent Activity
      recentActivity: [
        {
          id: '1',
          type: 'payment_received',
          description: 'Payment received from ABC Sdn Bhd',
          amount: 5300.00,
          currency: 'MYR',
          date: '2024-10-15T14:30:00Z',
          status: 'completed'
        },
        {
          id: '2',
          type: 'einvoice_approved',
          description: 'E-Invoice INV202410002 approved by LHDN',
          invoiceNumber: 'INV202410002',
          date: '2024-10-12T09:15:00Z',
          status: 'approved'
        },
        {
          id: '3',
          type: 'invoice_created',
          description: 'New invoice created for XYZ Trading',
          invoiceNumber: 'INV202410003',
          amount: 2400.00,
          currency: 'MYR',
          date: '2024-10-10T16:45:00Z',
          status: 'draft'
        },
        {
          id: '4',
          type: 'expense_recorded',
          description: 'Office supplies purchase recorded',
          amount: 850.00,
          currency: 'MYR',
          date: '2024-10-08T11:20:00Z',
          status: 'completed'
        }
      ],

      // Monthly Chart Data
      monthlyData: [
        { month: 'May', revenue: 18500, expenses: 6200, profit: 12300 },
        { month: 'Jun', revenue: 22400, expenses: 7800, profit: 14600 },
        { month: 'Jul', revenue: 19800, expenses: 6900, profit: 12900 },
        { month: 'Aug', revenue: 25200, expenses: 9700, profit: 15500 },
        { month: 'Sep', revenue: 28400, expenses: 8900, profit: 19500 },
        { month: 'Oct', revenue: 31200, expenses: 9200, profit: 22000 }
      ],

      // Malaysian Compliance Status
      compliance: {
        sst: {
          status: 'compliant',
          lastFiling: '2024-09-15',
          nextDue: '2024-12-15'
        },
        einvoice: {
          status: 'active',
          totalSubmitted: 156,
          approvalRate: 98.7
        },
        companiesAct: {
          status: 'compliant',
          lastAnnualReturn: '2024-03-15',
          nextDue: '2025-03-15'
        }
      },

      // Quick Actions Data
      quickActions: {
        invoicesPendingApproval: 2,
        overduePayments: 3,
        sstFilingDue: false,
        einvoiceErrors: 0
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get cash flow data
router.get('/cashflow', authenticateToken, (req, res) => {
  try {
    const cashFlowData = {
      currentBalance: 245600.00,
      currency: 'MYR',
      projectedBalance: 278900.00,
      cashInflow: {
        thisMonth: 35400.00,
        nextMonth: 42800.00,
        breakdown: [
          { source: 'Customer Payments', amount: 28900.00 },
          { source: 'Investment Returns', amount: 3200.00 },
          { source: 'Other Income', amount: 3300.00 }
        ]
      },
      cashOutflow: {
        thisMonth: 18600.00,
        nextMonth: 21400.00,
        breakdown: [
          { category: 'Operating Expenses', amount: 12400.00 },
          { category: 'Tax Payments', amount: 3800.00 },
          { category: 'Loan Payments', amount: 2400.00 }
        ]
      },
      weeklyData: [
        { week: 'Week 1', inflow: 8500, outflow: 3200 },
        { week: 'Week 2', inflow: 12400, outflow: 4800 },
        { week: 'Week 3', inflow: 9800, outflow: 5200 },
        { week: 'Week 4', inflow: 15200, outflow: 6400 }
      ]
    };

    res.json({
      success: true,
      data: cashFlowData
    });
  } catch (error) {
    console.error('Cash flow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cash flow data'
    });
  }
});

export default router;