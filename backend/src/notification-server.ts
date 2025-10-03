import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

// Initialize Socket.IO with proper types
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'], // Prioritize polling first
  allowEIO3: true
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());

// Simple notification store
const notifications: any[] = [];

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });

  // Test notification
  socket.on('test_notification', () => {
    const testNotification = {
      id: `test_${Date.now()}`,
      type: 'system_alert',
      title: 'Test Notification',
      message: 'Sistem notifikasi real-time berfungsi dengan sempurna! 🎉',
      timestamp: new Date(),
      priority: 'medium',
      read: false
    };

    socket.emit('notification', testNotification);
    console.log('📤 Test notification sent');
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HAFJET Bukku API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    notifications: 'enabled'
  });
});

// Auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email });
  
  if (email === 'admin@hafjet.com' && password === 'admin123') {
    const token = 'mock-jwt-token-for-testing';
    const user = {
      id: '1',
      email: 'admin@hafjet.com',
      name: 'Administrator',
      role: 'admin',
      company: 'HAFJET Sdn Bhd'
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

// Test notification endpoint
app.post('/api/test-notification', (req, res) => {
  const { userId, message } = req.body;
  
  const notification = {
    id: `notif_${Date.now()}`,
    type: 'system_alert',
    title: 'Test Notification',
    message: message || 'Test notification from backend! 🎉',
    timestamp: new Date(),
    priority: 'medium',
    read: false
  };

  // Broadcast to all connected clients
  io.emit('notification', notification);
  
  console.log('📤 Notification broadcasted:', notification.message);
  
  res.json({
    success: true,
    message: 'Test notification sent successfully',
    data: notification
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 HAFJET Bukku API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/api/auth`);
  console.log(`🔔 Real-time notification service initialized`);
});

export default app;