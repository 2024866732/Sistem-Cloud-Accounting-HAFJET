import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// Mock company settings data
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
    logger.info('Fetching users');
    
    const users = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@hafjet.com',
        role: 'admin',
        permissions: ['all'],
        status: 'active',
        lastLogin: new Date(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Finance Manager',
        email: 'finance@hafjet.com',
        role: 'manager',
        permissions: ['transactions', 'reports', 'invoices'],
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Accounting Staff',
        email: 'staff@hafjet.com',
        role: 'staff',
        permissions: ['transactions', 'invoices'],
        status: 'active',
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }
    ];
    
    res.json({
      success: true,
      data: users
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
    const userData = req.body;
    logger.info('Creating new user:', userData);
    
    // Simulate user creation
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      status: 'active',
      createdAt: new Date(),
      lastLogin: null
    };
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    logger.info(`Updating user ${id}:`, updates);
    
    // Simulate update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { id, ...updates }
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`Deleting user ${id}`);
    
    // Simulate deletion
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};