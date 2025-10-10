import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

// Mock company settings data (TODO: Replace with Company model)
const mockCompanySettings = {
  company: {
    name: 'HAFJET SDN BHD',
    registrationNumber: '123456-X',
    address: {
      street: 'Jalan Bukit Bintang 123',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia'
    },
    contact: {
      phone: '+60-3-1234-5678',
      email: 'admin@hafjet.com',
      website: 'https://hafjet.com'
    }
  },
  tax: {
    sstNumber: 'SST-123456789',
    sstRate: 6,
    withholdingTaxRate: 10,
    eInvoiceEnabled: true,
    taxPeriod: 'monthly'
  },
  system: {
    currency: 'MYR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kuala_Lumpur',
    language: 'en',
    fiscalYearStart: '01/01',
    autoBackup: true,
    backupFrequency: 'daily'
  },
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@hafjet.com',
      role: 'admin',
      permissions: ['all'],
      status: 'active',
      lastLogin: new Date()
    }
  ]
};

export const getCompanySettings = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching company settings');
    
    // Simulate slight delay for realistic API behavior
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.json({
      success: true,
      data: mockCompanySettings
    });
  } catch (error) {
    logger.error('Error fetching company settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company settings'
    });
  }
};

export const updateCompanySettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    logger.info('Updating company settings:', updates);
    
    // In a real app, we would update the database
    // For now, we'll just merge the updates with mock data
    const updatedSettings = {
      ...mockCompanySettings,
      ...updates
    };
    
    // Simulate slight delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({
      success: true,
      message: 'Company settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    logger.error('Error updating company settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company settings'
    });
  }
};

export const getTaxSettings = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching tax settings');
    
    const taxSettings = {
      sstSettings: {
        enabled: true,
        rate: 6,
        registrationNumber: 'SST-123456789'
      },
      withholdingTax: {
        enabled: true,
        rate: 10,
        categories: ['services', 'rental', 'interest']
      },
      eInvoice: {
        enabled: true,
        environment: 'sandbox',
        clientId: 'HAFJET_CLIENT_ID',
        tinNumber: '123456789012'
      }
    };
    
    res.json({
      success: true,
      data: taxSettings
    });
  } catch (error) {
    logger.error('Error fetching tax settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax settings'
    });
  }
};

export const updateTaxSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    logger.info('Updating tax settings:', updates);
    
    // Simulate update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({
      success: true,
      message: 'Tax settings updated successfully',
      data: updates
    });
  } catch (error) {
    logger.error('Error updating tax settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tax settings'
    });
  }
};

export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching system settings');
    
    const systemSettings = {
      general: {
        currency: 'MYR',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Kuala_Lumpur',
        language: 'en'
      },
      fiscal: {
        yearStart: '01/01',
        yearEnd: '31/12'
      },
      backup: {
        autoBackup: true,
        frequency: 'daily',
        retention: 30
      },
      notifications: {
        email: true,
        sms: false,
        inApp: true
      }
    };
    
    res.json({
      success: true,
      data: systemSettings
    });
  } catch (error) {
    logger.error('Error fetching system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings'
    });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    logger.info('Updating system settings:', updates);
    
    // Simulate update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: updates
    });
  } catch (error) {
    logger.error('Error updating system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system settings'
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - missing company context'
      });
    }

    logger.info(`Fetching users for company ${user.companyId}`);
    
    // Query users from database
    const users = await User.find({ 
      companyId: user.companyId,
      status: { $ne: 'deleted' } // Exclude deleted users
    })
    .select('-password -twoFactorSecret -twoFactorBackupCodes') // Exclude sensitive fields
  .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser || !currentUser.companyId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - missing company context'
      });
    }

    const { name, email, password, role, permissions, phone, department, jobTitle } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      companyId: currentUser.companyId
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists in your company'
      });
    }

    logger.info(`Creating new user: ${email} for company ${currentUser.companyId}`);
    
    // Create new user
    const newUser = new User({
      companyId: currentUser.companyId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      role: role || 'staff',
      permissions: permissions || [],
      status: 'active',
      phone,
      department,
      jobTitle,
      createdBy: currentUser.id,
      loginAttempts: 0,
      twoFactorEnabled: false
    });

    await newUser.save();

    // Return user without sensitive fields. Some tests mock the created user as a plain object; guard against missing toJSON()
    const created = (newUser && typeof (newUser as any).toJSON === 'function') ? (newUser as any).toJSON() : newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: created
    });
  } catch (error: any) {
    logger.error('Error creating user:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { id } = req.params;
    const updates = req.body;

    if (!currentUser || !currentUser.companyId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - missing company context'
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    logger.info(`Updating user ${id} by ${currentUser.id}`);
    
    // Find user
    const user = await User.findOne({ 
      _id: id, 
      companyId: currentUser.companyId 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent updating password through this endpoint (use dedicated password change endpoint)
    if (updates.password) {
      return res.status(400).json({
        success: false,
        message: 'Use /change-password endpoint to update password'
      });
    }

    // Prevent updating email to existing email
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({
        email: updates.email.toLowerCase(),
        companyId: currentUser.companyId,
        _id: { $ne: id }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }

    // Allowed update fields
    const allowedUpdates = ['name', 'email', 'role', 'permissions', 'status', 'phone', 'department', 'jobTitle', 'avatar'];
    const updateFields: any = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields[field] = updates[field];
      }
    });

    // Update user
    Object.assign(user, updateFields);
    await user.save();

    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error: any) {
    logger.error('Error updating user:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { id } = req.params;

    if (!currentUser || !currentUser.companyId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - missing company context'
      });
    }

    // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Prevent self-deletion
      // Prevent self-deletion (coerce to string to handle ObjectId or mocked values)
      if (String(id) === String(currentUser.id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    logger.info(`Deleting user ${id} by ${currentUser.id}`);
    
    // Find user
    const user = await User.findOne({ 
      _id: id, 
      companyId: currentUser.companyId 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete (set status to inactive instead of removing from database)
    user.status = 'inactive';
    await user.save();

    // For hard delete, use: await User.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { id } = req.params;

    if (!currentUser || !currentUser.companyId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - missing company context'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findOne({ 
      _id: id, 
      companyId: currentUser.companyId 
    })
    .select('-password -twoFactorSecret -twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Change user password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    if (!currentUser || !currentUser.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    logger.info(`Password change requested for user ${currentUser.id}`);

    // Fetch user with password field
    const user = await User.findById(currentUser.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if account is locked
    if (typeof (user as any).isLocked === 'function' ? user.isLocked() : false) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    const isPasswordValid = await (typeof (user as any).comparePassword === 'function' ? user.comparePassword(currentPassword) : false);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed successfully for user ${currentUser.id}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Reset user password (admin only)
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!currentUser || !currentUser.companyId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can reset user passwords'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    logger.info(`Password reset for user ${id} by admin ${currentUser.id}`);

    const user = await User.findOne({ 
      _id: id, 
      companyId: currentUser.companyId 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Reset password and unlock account
    user.password = newPassword;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    logger.info(`Password reset successfully for user ${id}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};