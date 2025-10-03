import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HAFJET Bukku API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  if (email === 'admin@hafjet.com' && password === 'admin123') {
    const token = 'mock-jwt-token-for-testing';
    const user = {
      id: '1',
      email: 'admin@hafjet.com',
      name: 'Administrator',
      role: 'admin',
      companyId: '1'
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      data: { token, user }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      revenue: { total: 127500, growth: 12.5, thisMonth: 28400, lastMonth: 25200 },
      expenses: { total: 45600, growth: -8.2, thisMonth: 8900, lastMonth: 9700 },
      profit: { total: 81900, margin: 64.2, growth: 22.1 },
      tax: { sstCollected: 7650, sstPayable: 2736, taxRate: 6 },
      einvoice: { submitted: 24, approved: 22, complianceRate: 91.7 },
      customers: { total: 48, active: 35, newThisMonth: 5 },
      recentActivity: [
        { id: '1', type: 'payment_received', description: 'Payment received from ABC Sdn Bhd', amount: 5300, date: new Date().toISOString(), status: 'completed' }
      ]
    }
  });
});

// Avoid starting server during test runs to prevent port collisions
if (process.env.JEST_WORKER_ID === undefined) {
  app.listen(PORT, () => {
    console.log(`🚀 Simple HAFJET Bukku API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/api/auth`);
  });
}

export default app;