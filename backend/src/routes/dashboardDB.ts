import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { LedgerEntry } from '../models/LedgerEntry.js';
import { InvoiceModel } from '../models/InvoiceModel.js';
import { SalesOrder } from '../models/SalesOrder.js';
import { Receipt } from '../models/Receipt.js';
import { PosSale } from '../models/PosSale.js';
import { Types } from 'mongoose';

const router = Router();

/**
 * Get dashboard statistics with REAL DATABASE data
 */
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid companyId required' 
      });
    }
    
    // Calculate current and last month periods
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    
    // ========================================
    // 1. REVENUE from Ledger (Account 4xxx = Revenue)
    // ========================================
    const revenueAgg = await LedgerEntry.aggregate([
      { 
        $match: { 
          companyId: new Types.ObjectId(companyId), 
          status: 'posted' 
        } 
      },
      { $unwind: '$splits' },
      { 
        $match: { 
          'splits.accountCode': /^4/,  // Revenue accounts
          'splits.type': 'credit'       // Credits increase revenue
        } 
      },
      { 
        $group: {
          _id: '$period',
          total: { $sum: '$splits.amount' }
        }
      }
    ]);
    
    const thisMonthRevenue = revenueAgg.find(r => r._id === thisMonth)?.total || 0;
    const lastMonthRevenue = revenueAgg.find(r => r._id === lastMonth)?.total || 0;
    const totalRevenue = revenueAgg.reduce((sum, r) => sum + r.total, 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) 
      : 0;
    
    // ========================================
    // 2. EXPENSES from Ledger (Account 5xxx = Expenses)
    // ========================================
    const expensesAgg = await LedgerEntry.aggregate([
      { 
        $match: { 
          companyId: new Types.ObjectId(companyId), 
          status: 'posted' 
        } 
      },
      { $unwind: '$splits' },
      { 
        $match: { 
          'splits.accountCode': /^5/,  // Expense accounts
          'splits.type': 'debit'        // Debits increase expenses
        } 
      },
      { 
        $group: {
          _id: '$period',
          total: { $sum: '$splits.amount' }
        }
      }
    ]);
    
    const thisMonthExpenses = expensesAgg.find(r => r._id === thisMonth)?.total || 0;
    const lastMonthExpenses = expensesAgg.find(r => r._id === lastMonth)?.total || 0;
    const totalExpenses = expensesAgg.reduce((sum, r) => sum + r.total, 0);
    const expensesGrowth = lastMonthExpenses > 0 
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100) 
      : 0;
    
    // ========================================
    // 3. PROFIT Calculation
    // ========================================
    const profit = thisMonthRevenue - thisMonthExpenses;
    const profitMargin = thisMonthRevenue > 0 ? (profit / thisMonthRevenue * 100) : 0;
    const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
    const profitGrowth = lastMonthProfit > 0 
      ? ((profit - lastMonthProfit) / lastMonthProfit * 100) 
      : 0;
    
    // ========================================
    // 4. TAX from Ledger (Account 21xx = Tax Payable)
    // ========================================
    const taxAgg = await LedgerEntry.aggregate([
      { 
        $match: { 
          companyId: new Types.ObjectId(companyId), 
          status: 'posted' 
        } 
      },
      { $unwind: '$splits' },
      { 
        $match: { 
          'splits.accountCode': /^21/,  // Tax liability accounts
          'splits.type': 'credit'        // Credits increase tax payable
        } 
      },
      { 
        $group: {
          _id: null,
          total: { $sum: '$splits.amount' }
        }
      }
    ]);
    
    const sstCollected = taxAgg[0]?.total || 0;
    const sstPayable = sstCollected; // In Malaysia, SST is payable as collected
    const sstRate = 6.0; // Malaysian SST rate
    
    // Calculate next payment due (15th of next month)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    const nextPaymentDue = nextMonth.toISOString().split('T')[0];
    
    // ========================================
    // 5. E-INVOICE Status
    // ========================================
    const einvoiceStats = await InvoiceModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { 
        $group: {
          _id: '$einvoice.status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const einvoiceTotal = einvoiceStats.reduce((sum, s) => sum + s.count, 0);
    const einvoiceApproved = einvoiceStats.find(s => s._id === 'approved')?.count || 0;
    const einvoicePending = einvoiceStats.find(s => s._id === 'pending')?.count || 0;
    const einvoiceRejected = einvoiceStats.find(s => s._id === 'rejected')?.count || 0;
    const einvoiceSubmitted = einvoiceApproved + einvoicePending + einvoiceRejected;
    const einvoiceComplianceRate = einvoiceTotal > 0 
      ? (einvoiceSubmitted / einvoiceTotal * 100) 
      : 0;
    
    // ========================================
    // 6. CUSTOMER Metrics
    // ========================================
    const customerAgg = await SalesOrder.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { 
        $group: {
          _id: '$customerId',
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: '$orderDate' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 1 }
    ]);
    
    const totalCustomers = await SalesOrder.distinct('customerId', { companyId }).then(ids => ids.length);
    const topCustomer = customerAgg[0];
    
    // Count new customers this month
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCustomersThisMonth = await SalesOrder.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { $sort: { orderDate: 1 } },
      { 
        $group: {
          _id: '$customerId',
          firstOrder: { $first: '$orderDate' }
        }
      },
      { $match: { firstOrder: { $gte: firstOfMonth } } },
      { $count: 'count' }
    ]).then(result => result[0]?.count || 0);
    
    // ========================================
    // 7. INVOICE Status
    // ========================================
    const invoiceStats = await InvoiceModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const invoiceTotal = invoiceStats.reduce((sum, s) => sum + s.count, 0);
    const invoicePaid = invoiceStats.find(s => s._id === 'paid')?.count || 0;
    const invoiceSent = invoiceStats.find(s => s._id === 'sent')?.count || 0;
    const invoiceDraft = invoiceStats.find(s => s._id === 'draft')?.count || 0;
    
    // Count overdue invoices
    const overdueCount = await InvoiceModel.countDocuments({
      companyId,
      status: { $in: ['sent', 'draft'] },
      dueDate: { $lt: now }
    });
    
    // ========================================
    // 8. RECENT ACTIVITY (from multiple sources)
    // ========================================
    const recentActivity: any[] = [];
    
    // Recent invoices
    const recentInvoices = await InvoiceModel.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    recentInvoices.forEach(inv => {
      recentActivity.push({
        id: inv._id.toString(),
        type: inv.status === 'paid' ? 'payment_received' : 'invoice_created',
        description: inv.status === 'paid' 
          ? `Payment received from ${inv.customerName}`
          : `New invoice created for ${inv.customerName}`,
        amount: inv.total,
        currency: inv.currency,
        date: inv.createdAt,
        status: inv.status,
        invoiceNumber: inv.invoiceNumber
      });
    });
    
    // Recent ledger entries
    const recentLedger = await LedgerEntry.find({ companyId, status: 'posted' })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();
    
    recentLedger.forEach(entry => {
      recentActivity.push({
        id: entry._id.toString(),
        type: entry.sourceType,
        description: entry.description,
        date: entry.createdAt,
        status: entry.status,
        reference: entry.reference
      });
    });
    
    // Sort by date and limit to 5
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const limitedActivity = recentActivity.slice(0, 5);
    
    // ========================================
    // 9. CASHFLOW (from POS Sales if available)
    // ========================================
    const posSales = await PosSale.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId), status: 'normalized' } },
      { 
        $group: {
          _id: null,
          totalSales: { $sum: '$totals.net' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);
    
    const posTotalSales = posSales[0]?.totalSales || 0;
    const posTransactionCount = posSales[0]?.transactionCount || 0;
    
    // ========================================
    // 10. DIGITAL SHOEBOX Stats
    // ========================================
    const receiptStats = await Receipt.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalReceipts = receiptStats.reduce((sum, s) => sum + s.count, 0);
    const processedReceipts = receiptStats.find(s => s._id === 'approved')?.count || 0;
    const pendingReceipts = receiptStats.find(s => s._id === 'review_pending')?.count || 0;
    
    // ========================================
    // FINAL DASHBOARD DATA
    // ========================================
    const dashboardData = {
      // Main KPIs
      revenue: {
        total: Number(totalRevenue.toFixed(2)),
        currency: 'MYR',
        growth: Number(revenueGrowth.toFixed(2)),
        thisMonth: Number(thisMonthRevenue.toFixed(2)),
        lastMonth: Number(lastMonthRevenue.toFixed(2))
      },
      expenses: {
        total: Number(totalExpenses.toFixed(2)),
        currency: 'MYR',
        growth: Number(expensesGrowth.toFixed(2)),
        thisMonth: Number(thisMonthExpenses.toFixed(2)),
        lastMonth: Number(lastMonthExpenses.toFixed(2))
      },
      profit: {
        total: Number((totalRevenue - totalExpenses).toFixed(2)),
        currency: 'MYR',
        margin: Number(profitMargin.toFixed(2)),
        growth: Number(profitGrowth.toFixed(2)),
        thisMonth: Number(profit.toFixed(2)),
        lastMonth: Number(lastMonthProfit.toFixed(2))
      },
      
      // Malaysian Tax Information
      tax: {
        sstCollected: Number(sstCollected.toFixed(2)),
        sstPayable: Number(sstPayable.toFixed(2)),
        taxRate: sstRate,
        nextPaymentDue,
        compliance: sstPayable > 0 ? 'Current' : 'No Tax Due'
      },

      // E-Invoice Status
      einvoice: {
        submitted: einvoiceSubmitted,
        approved: einvoiceApproved,
        pending: einvoicePending,
        rejected: einvoiceRejected,
        total: einvoiceTotal,
        complianceRate: Number(einvoiceComplianceRate.toFixed(2))
      },

      // Customer Metrics
      customers: {
        total: totalCustomers,
        active: totalCustomers, // Simplification: all are considered active
        newThisMonth: newCustomersThisMonth,
        topCustomer: topCustomer ? {
          id: topCustomer._id,
          revenue: topCustomer.totalRevenue,
          orders: topCustomer.orderCount
        } : null
      },

      // Invoice Status
      invoices: {
        total: invoiceTotal,
        paid: invoicePaid,
        pending: invoiceSent,
        overdue: overdueCount,
        draft: invoiceDraft
      },

      // Recent Activity
      recentActivity: limitedActivity,

      // Additional Stats
      pos: {
        totalSales: Number(posTotalSales.toFixed(2)),
        transactionCount: posTransactionCount
      },
      digitalShoebox: {
        total: totalReceipts,
        processed: processedReceipts,
        pending: pendingReceipts
      }
    };

    res.json({
      success: true,
      data: dashboardData,
      generatedAt: new Date().toISOString(),
      period: thisMonth
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get chart data for revenue/expenses over time
 */
router.get('/charts/revenue-expenses', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const months = parseInt(req.query.months as string) || 6;
    
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }
    
    // Generate period array for last N months
    const periods = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    
    // Get revenue and expenses by period
    const ledgerData = await LedgerEntry.aggregate([
      { 
        $match: { 
          companyId: new Types.ObjectId(companyId), 
          status: 'posted',
          period: { $in: periods }
        } 
      },
      { $unwind: '$splits' },
      { 
        $group: {
          _id: {
            period: '$period',
            accountPrefix: { $substr: ['$splits.accountCode', 0, 1] },
            type: '$splits.type'
          },
          total: { $sum: '$splits.amount' }
        }
      }
    ]);
    
    // Format data for charts
    const chartData = periods.map(period => {
      const revenue = ledgerData
        .filter(d => d._id.period === period && d._id.accountPrefix === '4' && d._id.type === 'credit')
        .reduce((sum, d) => sum + d.total, 0);
      
      const expenses = ledgerData
        .filter(d => d._id.period === period && d._id.accountPrefix === '5' && d._id.type === 'debit')
        .reduce((sum, d) => sum + d.total, 0);
      
      return {
        period,
        revenue: Number(revenue.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        profit: Number((revenue - expenses).toFixed(2))
      };
    });
    
    res.json({ success: true, data: chartData });
    
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chart data' });
  }
});

export default router;

