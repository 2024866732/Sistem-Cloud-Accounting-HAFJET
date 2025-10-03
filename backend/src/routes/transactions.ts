import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Sample Malaysian transaction data
const sampleTransactions = [
  {
    id: '1',
    type: 'income',
    category: 'Sales',
    description: 'Payment from ABC Sdn Bhd - Invoice INV202410001',
    amount: 5300.00,
    currency: 'MYR',
    date: '2024-10-15',
    referenceNumber: 'TXN202410001',
    paymentMethod: 'Online Banking',
    taxAmount: 300.00,
    taxType: 'SST',
    status: 'completed',
    metadata: {
      invoiceId: '1',
      customerId: 'ABC123',
      bankReference: 'MB240015001'
    }
  },
  {
    id: '2',
    type: 'expense',
    category: 'Office Supplies',
    description: 'Purchase office equipment',
    amount: 1060.00,
    currency: 'MYR',
    date: '2024-10-10',
    referenceNumber: 'TXN202410002',
    paymentMethod: 'Company Card',
    taxAmount: 60.00,
    taxType: 'SST',
    status: 'completed',
    metadata: {
      supplierId: 'SUP001',
      receiptNumber: 'RCP-2024-001'
    }
  },
  {
    id: '3',
    type: 'income',
    category: 'Consulting',
    description: 'Payment from XYZ Trading - Invoice INV202410002',
    amount: 3180.00,
    currency: 'MYR',
    date: '2024-10-12',
    referenceNumber: 'TXN202410003',
    paymentMethod: 'Cheque',
    taxAmount: 180.00,
    taxType: 'SST',
    status: 'completed',
    metadata: {
      invoiceId: '2',
      customerId: 'XYZ456',
      chequeNumber: 'CHQ001234'
    }
  },
  {
    id: '4',
    type: 'expense',
    category: 'Professional Services',
    description: 'Legal consultation fees',
    amount: 2120.00,
    currency: 'MYR',
    date: '2024-10-08',
    referenceNumber: 'TXN202410004',
    paymentMethod: 'Bank Transfer',
    taxAmount: 120.00,
    taxType: 'SST',
    status: 'pending',
    metadata: {
      supplierId: 'LAW001',
      invoiceRef: 'LEGAL-2024-10'
    }
  }
];

// Get all transactions with filtering
router.get('/', authenticateToken, (req, res) => {
  try {
    const { type, category, status, startDate, endDate } = req.query;
    let filteredTransactions = [...sampleTransactions];

    // Apply filters
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }
    if (startDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
    }

    // Calculate summary
    const summary = {
      totalIncome: filteredTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpense: filteredTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalTax: filteredTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.taxAmount, 0),
      netIncome: 0
    };
    summary.netIncome = summary.totalIncome - summary.totalExpense;

    res.json({
      success: true,
      data: filteredTransactions,
      summary,
      pagination: {
        total: filteredTransactions.length,
        page: 1,
        limit: 50,
        pages: 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const transaction = sampleTransactions.find(t => t.id === id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
});

// Create new transaction
router.post('/', authenticateToken, (req, res) => {
  try {
    const newTransaction = {
      id: String(sampleTransactions.length + 1),
      referenceNumber: `TXN${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(sampleTransactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      currency: 'MYR',
      ...req.body
    };

    sampleTransactions.push(newTransaction);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

// Update transaction
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const transactionIndex = sampleTransactions.findIndex(t => t.id === id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    sampleTransactions[transactionIndex] = {
      ...sampleTransactions[transactionIndex],
      ...req.body
    };

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: sampleTransactions[transactionIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction'
    });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const transactionIndex = sampleTransactions.findIndex(t => t.id === id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    sampleTransactions.splice(transactionIndex, 1);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  }
});

export default router;