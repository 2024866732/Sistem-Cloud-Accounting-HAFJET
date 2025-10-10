import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

// Temporary user data for testing
const tempUsers = [
  {
    id: '1',
    email: 'admin@hafjet.com',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin',
    companyId: '1'
  },
  {
    id: '2',
    email: 'user@hafjet.com', 
    password: 'user123',
    name: 'Test User',
    role: 'user',
    companyId: '1'
  }
];

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

      // Find user (temporary implementation)
      const user = tempUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password (temporary - plain text comparison)
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          companyId: user.companyId
        },
        config.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      // Update last login (would update database in real implementation)
      console.log(`User ${user.email} logged in at ${new Date()}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId
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

      // Check if user already exists
      const existingUser = tempUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user (temporary implementation)
      const newUser = {
        id: String(tempUsers.length + 1),
        email,
        password, // In real implementation, this would be hashed
        name,
        role: 'user' as const,
        companyId: '1' // Would create/assign company in real implementation
      };

      tempUsers.push(newUser);

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          role: newUser.role,
          companyId: newUser.companyId
        },
        config.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            companyId: newUser.companyId
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

      // Find user (temporary implementation)
      const user = tempUsers.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId
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