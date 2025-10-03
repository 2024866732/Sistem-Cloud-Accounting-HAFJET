const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003; // Try port 3003

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server working' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@hafjet.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        token: 'test-token',
        user: { id: '1', email, name: 'Admin', role: 'admin' }
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Test server running on http://127.0.0.1:${PORT}`);
  console.log(`📊 Health check: http://127.0.0.1:${PORT}/api/health`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});