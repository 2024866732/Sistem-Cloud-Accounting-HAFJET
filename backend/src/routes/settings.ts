import { Router } from 'express';
import {
  getCompanySettings,
  updateCompanySettings,
  getTaxSettings,
  updateTaxSettings,
  getSystemSettings,
  updateSystemSettings,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/settingsController';
import { authenticateToken } from '../middleware/auth';

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
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;