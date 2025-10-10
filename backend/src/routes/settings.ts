import { Router } from 'express';
import {
  getCompanySettings,
  updateCompanySettings,
  getTaxSettings,
  updateTaxSettings,
  getSystemSettings,
  updateSystemSettings,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  resetUserPassword
} from '../controllers/settingsController.js';
import { setup2FA, verify2FA, disable2FA } from '../controllers/twoFactorController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Company settings routes
router.get('/company', getCompanySettings);
router.put('/company', updateCompanySettings);

// Tax settings routes
router.get('/tax', getTaxSettings);
router.put('/tax', updateTaxSettings);

// System settings routes
router.get('/system', getSystemSettings);
router.put('/system', updateSystemSettings);

// User management routes
router.get('/users', authorize('admin.manage_users'), getUsers);
router.get('/users/:id', getUserById);
router.post('/users', authorize('admin.manage_users'), createUser);
router.put('/users/:id', authorize('admin.manage_users'), updateUser);
router.delete('/users/:id', authorize('admin.manage_users'), deleteUser);

// Password management routes
router.post('/change-password', changePassword);
router.post('/users/:id/reset-password', authorize('admin.manage_users'), resetUserPassword);

// Two-factor authentication routes
router.post('/users/2fa/setup', setup2FA);
router.post('/users/2fa/verify', verify2FA);
router.post('/users/2fa/disable', disable2FA);

export default router;