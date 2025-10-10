import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Generate 2FA setup (TOTP) secret and return otpauth_url (and QR encoded data)
export const setup2FA = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser || !currentUser.companyId) {
      return res.status(401).json({ success: false, message: 'Unauthorized - missing company context' });
    }

    const secret = speakeasy.generateSecret({ length: 20, name: `HAFJET (${currentUser.email})` });

    // Save secret temporarily to user record (not enabling 2FA yet)
    const user = await User.findOne({ _id: currentUser.id, companyId: currentUser.companyId }).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code data URL from otpauth
    const otpauth = secret.otpauth_url as string;
    const qr = await qrcode.toDataURL(otpauth);

    res.json({ success: true, data: { secret: secret.base32, otpauth, qr } });
  } catch (error) {
  logger.error('Error generating 2FA setup:', error);
    res.status(500).json({ success: false, message: 'Failed to generate 2FA setup' });
  }
};

// Verify 2FA code and enable 2FA for user
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { token } = req.body;

    if (!currentUser || !currentUser.companyId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token required' });
    }

    const user = await User.findOne({ _id: currentUser.id, companyId: currentUser.companyId }).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA not setup' });
    }

    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 1 });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = generateBackupCodes();
    await user.save();

    res.json({ success: true, message: '2FA enabled', data: { backupCodes: user.twoFactorBackupCodes } });
  } catch (error) {
  logger.error('Error verifying 2FA:', error);
    res.status(500).json({ success: false, message: 'Failed to verify 2FA' });
  }
};

// Disable 2FA
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser || !currentUser.companyId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findOne({ _id: currentUser.id, companyId: currentUser.companyId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.json({ success: true, message: '2FA disabled' });
  } catch (error) {
  logger.error('Error disabling 2FA:', error);
    res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
};

// Generate backup codes helper
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    codes.push(Math.random().toString(36).slice(2, 10).toUpperCase());
  }
  return codes;
}
