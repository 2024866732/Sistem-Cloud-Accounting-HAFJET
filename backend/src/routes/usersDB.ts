import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import User from '../models/User.js';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

const router = Router();

// List users (admin only)
router.get('/', authenticateToken, authorize('admin.manage_users'), async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { page = 1, limit = 50, role, active, search } = req.query;
    const query: any = { companyId };
    if (role) query.role = role;
    if (active !== undefined) query.active = active === 'true';
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -twoFactorSecret')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({ 
      success: true, 
      users, 
      pagination: { 
        total, 
        page: Number(page), 
        limit: Number(limit), 
        pages: Math.ceil(total / Number(limit)) || 1 
      } 
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user?.id;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Users can view their own profile or admins can view any
    if (id !== requestingUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const user = await User.findById(id).select('-password -twoFactorSecret').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, authorize('admin.manage_users'), async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Valid companyId required' });
    }

    const { name, email, password, role, permissions } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      companyId,
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      permissions: permissions || [],
      active: true
    });

    // Return user without password
    const userResponse: any = user.toObject();
    delete userResponse.password;
    delete userResponse.twoFactorSecret;

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user?.id;
    const requestingUserRole = req.user?.role;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Users can update their own profile or admins can update any
    if (id !== requestingUserId && requestingUserRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateData: any = {};
    const { name, email, role, permissions, active } = req.body;

    // Regular users can only update their own name
    if (id === requestingUserId) {
      if (name) updateData.name = name;
      if (email) updateData.email = email;
    }

    // Admins can update everything except password (use separate endpoint)
    if (requestingUserRole === 'admin') {
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (permissions) updateData.permissions = permissions;
      if (active !== undefined) updateData.active = active;
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret').lean();

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated successfully', user: updated });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// Change password
router.post('/:id/change-password', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Users can only change their own password
    if (id !== requestingUserId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    // Verify current password
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorize('admin.manage_users'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user?.id;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Can't delete yourself
    if (id === requestingUserId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

export default router;

