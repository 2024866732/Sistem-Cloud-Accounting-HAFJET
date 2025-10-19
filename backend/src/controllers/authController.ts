import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/config.js';
import User from '../models/User.js';
import { Company } from '../models/Company.js';
import mongoose from 'mongoose';

export const authController = {
  // Login user
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user in MongoDB
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      
      if (!user) {
        console.log(`[AUTH] Login failed: User not found for email ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      console.log(`[AUTH] User found: ${user.email}, status: ${user.status}, hasPassword: ${!!user.password}`);

      // Check if user is active
      if (user.status !== 'active') {
        console.log(`[AUTH] Login failed: User ${user.email} is ${user.status}`);
        return res.status(403).json({
          success: false,
          message: 'Account is disabled. Please contact support.'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log(`[AUTH] Password verification for ${user.email}: ${isValidPassword}`);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id.toString(), 
          email: user.email, 
          role: user.role,
          companyId: user.companyId.toString()
        },
        config.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      console.log(`User ${user.email} logged in at ${new Date()}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId.toString()
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Register user
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, companyName } = req.body;

      // Validate input
      if (!name || !email || !password || !companyName) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create company first
      const company = await Company.create({
        name: companyName,
        registrationNumber: `REG-${Date.now()}`,
        taxNumber: `TAX-${Date.now()}`,
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Malaysia'
        },
        contact: {
          email: email.toLowerCase(),
          phone: '',
          website: ''
        },
        settings: {
          currency: 'MYR',
          language: 'en',
          taxType: 'SST'
        }
      });

      // Create new user (password will be hashed by pre-save hook)
      console.log(`[AUTH-REG] Creating user with email: ${email.toLowerCase()}, password length: ${password.length}`);
      const newUser = await User.create({
        email: email.toLowerCase(),
        password: password, // Will be hashed by pre-save hook with 12 rounds
        name,
        role: 'admin', // First user is admin of their company
        companyId: company._id as mongoose.Types.ObjectId,
        permissions: ['*'], // Full permissions for company admin
        status: 'active',
        twoFactorEnabled: false,
        lastLogin: new Date()
      });
      console.log(`[AUTH-REG] User created with hashed password length: ${newUser.password.length}`);

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser._id.toString(), 
          email: newUser.email, 
          role: newUser.role,
          companyId: (company._id as mongoose.Types.ObjectId).toString()
        },
        config.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      console.log(`[AUTH-v2] New user registered: ${newUser.email} for company: ${company.name}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            companyId: (company._id as mongoose.Types.ObjectId).toString()
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get current user
  me: async (req: Request, res: Response) => {
    try {
      // Get user from JWT token (added by auth middleware)
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Find user in MongoDB
      const user = await User.findById(userId).select('-password -twoFactorSecret');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId.toString(),
          status: user.status,
          permissions: user.permissions
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Logout user
  logout: async (req: Request, res: Response) => {
    try {
      // In a real implementation, you might:
      // - Add token to blacklist
      // - Update last logout time
      // - Clear refresh tokens
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};