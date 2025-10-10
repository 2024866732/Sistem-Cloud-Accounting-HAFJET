/**
 * User Management Test Suite
 * Tests all user CRUD operations, password management, and role enforcement
 */

import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../../config/config';

// Mock User model BEFORE importing anything else
jest.mock('../../models/User');
import User from '../../models/User';
import settingsRouter from '../../routes/settings';

// Create mock User model methods
const mockUserModel = User as jest.Mocked<typeof User>;

// Create a minimal test app
function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  
  // Mock auth middleware - inject test user into request
  app.use((req: any, _res, next) => {
    req.user = {
      id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
      companyId: '507f1f77bcf86cd799439012',
      role: 'admin',
      email: 'admin@test.com'
    };
    next();
  });
  
  // Mount settings router (includes user management)
  app.use('/api/settings', settingsRouter);
  
  return app;
}

describe('User Management - Complete Test Suite', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    // Generate a valid test token
    token = jwt.sign(
      { 
        userId: '507f1f77bcf86cd799439011', 
        companyId: '507f1f77bcf86cd799439012',
        role: 'admin'
      },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /api/settings/users - List Users', () => {
    it('should return list of users for company', async () => {
      const mockUsers = [
        {
          _id: new mongoose.Types.ObjectId(),
          companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          status: 'active',
          toJSON: function() { return this; }
        },
        {
          _id: new mongoose.Types.ObjectId(),
          companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          name: 'Staff User',
          email: 'staff@test.com',
          role: 'staff',
          status: 'active',
          toJSON: function() { return this; }
        }
      ];

      // Mock the query chain
      mockUserModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers)
        })
      } as any);

      const res = await request(app)
        .get('/api/settings/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.count).toBe(2);
    });

    it('should return 401 when no company context', async () => {
      // Create app WITHOUT company context
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req: any, _res, next) => {
        req.user = {
          id: '507f1f77bcf86cd799439011',
          companyId: undefined, // Missing company context
          role: 'admin',
          email: 'admin@test.com'
        };
        next();
      });
      testApp.use('/api/settings', settingsRouter);

      const res = await request(testApp)
        .get('/api/settings/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('company context');
    });
  });

  describe('GET /api/settings/users/:id - Get User by ID', () => {
    it('should return user when found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'Test User',
        email: 'test@example.com',
        role: 'staff',
        status: 'active'
      };

      mockUserModel.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      } as any);

      const res = await request(app)
        .get(`/api/settings/users/${userId.toString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should return 404 when user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      mockUserModel.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      } as any);

      const res = await request(app)
        .get(`/api/settings/users/${userId.toString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const res = await request(app)
        .get('/api/settings/users/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid');
    });
  });

  describe('POST /api/settings/users - Create User', () => {
    it('should create new user with valid data', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        role: 'staff'
      };

      const mockCreatedUser = {
        _id: new mongoose.Types.ObjectId(),
        ...newUserData,
        password: undefined, // Should not return password
        companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        status: 'active',
        save: jest.fn().mockResolvedValue(this),
        toJSON: function() { 
          const obj = { ...this };
          delete obj.password;
          return obj;
        }
      };

      // Mock duplicate check
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock user creation
      mockUserModel.prototype.save = jest.fn().mockResolvedValue(mockCreatedUser);
      (mockUserModel as any).mockImplementation(() => mockCreatedUser);

      const res = await request(app)
        .post('/api/settings/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUserData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('created successfully');
    });

    it('should return 400 when required fields missing', async () => {
      const res = await request(app)
        .post('/api/settings/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' }); // Missing email and password

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/email|password/i);
    });

    it('should return 400 when password too short', async () => {
      const res = await request(app)
        .post('/api/settings/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short' // Too short
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('8 characters');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/settings/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test User',
          email: 'invalid-email', // Invalid format
          password: 'ValidPass123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('email');
    });

    it('should return 409 when email already exists', async () => {
      const existingUser = {
        _id: new mongoose.Types.ObjectId(),
        email: 'existing@example.com',
        name: 'Existing User'
      };

      mockUserModel.findOne = jest.fn().mockResolvedValue(existingUser as any);

      const res = await request(app)
        .post('/api/settings/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New User',
          email: 'existing@example.com',
          password: 'SecurePass123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('PUT /api/settings/users/:id - Update User', () => {
    it('should update user with valid data', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'Original Name',
        email: 'original@example.com',
        role: 'staff',
        save: jest.fn().mockResolvedValue(this),
        toJSON: function() { return this; }
      };

      mockUserModel.findOne = jest.fn().mockResolvedValue(mockUser as any);

      const updates = {
        name: 'Updated Name',
        phone: '+60123456789'
      };

      const res = await request(app)
        .put(`/api/settings/users/${userId.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/settings/users/${userId.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    it('should reject password update through this endpoint', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        email: 'test@example.com'
      };

      mockUserModel.findOne = jest.fn().mockResolvedValue(mockUser as any);

      const res = await request(app)
        .put(`/api/settings/users/${userId.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'NewPassword123!' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('change-password');
    });

    it('should return 409 when updating to existing email', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        email: 'original@example.com'
      };

      const existingUser = {
        _id: new mongoose.Types.ObjectId(),
        email: 'existing@example.com'
      };

      mockUserModel.findOne = jest.fn()
        .mockResolvedValueOnce(mockUser as any) // First call - find user to update
        .mockResolvedValueOnce(existingUser as any); // Second call - check email exists

      const res = await request(app)
        .put(`/api/settings/users/${userId.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'existing@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already in use');
    });
  });

  describe('DELETE /api/settings/users/:id - Delete/Deactivate User', () => {
    it('should deactivate user successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        status: 'active',
        save: jest.fn().mockResolvedValue(this)
      };

      mockUserModel.findOne = jest.fn().mockResolvedValue(mockUser as any);

      const res = await request(app)
        .delete(`/api/settings/users/${userId.toString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deactivated');
    });

    it('should prevent self-deletion', async () => {
      const currentUserId = '507f1f77bcf86cd799439011'; // Same as authenticated user

      const res = await request(app)
        .delete(`/api/settings/users/${currentUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('own account');
    });

    it('should return 404 when user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/settings/users/${userId.toString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('POST /api/settings/change-password - Change Own Password', () => {
    it('should change password with valid credentials', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(true),
        isLocked: jest.fn().mockReturnValue(false),
        save: jest.fn().mockResolvedValue(this)
      };

      mockUserModel.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      } as any);

      const res = await request(app)
        .post('/api/settings/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('successfully');
    });

    it('should return 401 when current password incorrect', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        comparePassword: jest.fn().mockResolvedValue(false), // Wrong password
        isLocked: jest.fn().mockReturnValue(false),
        incrementLoginAttempts: jest.fn()
      };

      mockUserModel.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      } as any);

      const res = await request(app)
        .post('/api/settings/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPass123!',
          newPassword: 'NewPass123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('incorrect');
    });

    it('should return 400 when new password too short', async () => {
      const res = await request(app)
        .post('/api/settings/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'short'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('8 characters');
    });

    it('should return 400 when new password same as current', async () => {
      const res = await request(app)
        .post('/api/settings/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'SamePass123!',
          newPassword: 'SamePass123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('different');
    });

    it('should return 423 when account locked', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        isLocked: jest.fn().mockReturnValue(true), // Account is locked
        lockUntil: new Date(Date.now() + 3600000)
      };

      mockUserModel.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      } as any);

      const res = await request(app)
        .post('/api/settings/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!'
        });

      expect(res.status).toBe(423);
      expect(res.body.message).toContain('locked');
    });
  });

  describe('POST /api/settings/users/:id/reset-password - Admin Reset Password', () => {
    it('should allow admin to reset user password', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        email: 'user@example.com',
        save: jest.fn().mockResolvedValue(this)
      };

      mockUserModel.findOne = jest.fn().mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post(`/api/settings/users/${userId.toString()}/reset-password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'ResetPassword123!' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('reset successfully');
    });

    it('should return 403 when non-admin tries to reset', async () => {
      // Create app with non-admin user
      const staffApp = express();
      staffApp.use(express.json());
      staffApp.use((req: any, _res, next) => {
        req.user = {
          id: '507f1f77bcf86cd799439013',
          companyId: '507f1f77bcf86cd799439012',
          role: 'staff', // Not admin
          email: 'staff@test.com'
        };
        next();
      });
      staffApp.use('/api/settings', settingsRouter);

      const userId = new mongoose.Types.ObjectId();
      const res = await request(staffApp)
        .post(`/api/settings/users/${userId.toString()}/reset-password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'ResetPassword123!' });

  expect(res.status).toBe(403);
  // Middleware may return a generic insufficient permission message
  expect(res.body.message).toMatch(/insufficient|administrator/i);
    });

    it('should return 404 when user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/settings/users/${userId.toString()}/reset-password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'ResetPassword123!' });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });
});
