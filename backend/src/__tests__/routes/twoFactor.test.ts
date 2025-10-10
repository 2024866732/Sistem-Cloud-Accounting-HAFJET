import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../../config/config';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('speakeasy');
jest.mock('qrcode');

import User from '../../models/User';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import settingsRouter from '../../routes/settings';

const mockUserModel = User as jest.Mocked<typeof User>;

function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = {
      id: '507f1f77bcf86cd799439011',
      companyId: '507f1f77bcf86cd799439012',
      email: 'admin@test.com'
    };
    next();
  });
  app.use('/api/settings', settingsRouter);
  return app;
}

describe('Two-Factor Auth endpoints', () => {
  let app: Express;
  let token: string;

  beforeAll(() => {
    token = jwt.sign({ userId: '507f1f77bcf86cd799439011', companyId: '507f1f77bcf86cd799439012' }, config.JWT_SECRET);
  });

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  it('POST /api/settings/users/2fa/setup should return secret and qr', async () => {
    // Mock secret generation
    (speakeasy as any).generateSecret = jest.fn().mockReturnValue({ base32: 'BASE32SECRET', otpauth_url: 'otpauth://totp/...' });
    (qrcode as any).toDataURL = jest.fn().mockResolvedValue('data:image/png;base64,...');

    const mockUser = { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), twoFactorSecret: undefined, save: jest.fn().mockResolvedValue(this) };
    mockUserModel.findOne = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) } as any);

    const res = await request(app).post('/api/settings/users/2fa/setup').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.secret).toBe('BASE32SECRET');
    expect(res.body.data.qr).toContain('data:image/png');
  });

  it('POST /api/settings/users/2fa/verify should enable 2FA with valid token', async () => {
    (speakeasy as any).totp = { verify: jest.fn().mockReturnValue(true) };

    const mockUser = { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), twoFactorSecret: 'BASE32SECRET', twoFactorEnabled: false, save: jest.fn().mockResolvedValue(this) };
    mockUserModel.findOne = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) } as any);

    const res = await request(app).post('/api/settings/users/2fa/verify').set('Authorization', `Bearer ${token}`).send({ token: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('2FA enabled');
    expect(Array.isArray(res.body.data.backupCodes)).toBe(true);
  });

  it('POST /api/settings/users/2fa/verify should reject invalid token', async () => {
    (speakeasy as any).totp = { verify: jest.fn().mockReturnValue(false) };

    const mockUser = { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), twoFactorSecret: 'BASE32SECRET', save: jest.fn().mockResolvedValue(this) };
    mockUserModel.findOne = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) } as any);

    const res = await request(app).post('/api/settings/users/2fa/verify').set('Authorization', `Bearer ${token}`).send({ token: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid token');
  });

  it('POST /api/settings/users/2fa/disable should disable 2FA', async () => {
    const mockUser = { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), twoFactorEnabled: true, save: jest.fn().mockResolvedValue(this) };
    mockUserModel.findOne = jest.fn().mockResolvedValue(mockUser as any);

    const res = await request(app).post('/api/settings/users/2fa/disable').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('2FA disabled');
  });
});
