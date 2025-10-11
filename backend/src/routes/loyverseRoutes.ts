import express from 'express';
import {
  connectLoyverse,
  getStatus,
  syncData,
  updateSettings,
  disconnectLoyverse,
} from '../controllers/loyverseController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/integrations/loyverse/connect
 * @desc    Connect to Loyverse POS
 * @access  Private
 */
router.post('/connect', connectLoyverse);

/**
 * @route   GET /api/integrations/loyverse/status
 * @desc    Get integration status and sync history
 * @access  Private
 */
router.get('/status', getStatus);

/**
 * @route   POST /api/integrations/loyverse/sync
 * @desc    Trigger manual sync
 * @access  Private
 */
router.post(
  '/sync',
  [
    body('type')
      .optional()
      .isIn(['all', 'products', 'customers', 'sales', 'inventory'])
      .withMessage('Invalid sync type'),
  ],
  validateRequest,
  syncData
);

/**
 * @route   PUT /api/integrations/loyverse/settings
 * @desc    Update sync settings
 * @access  Private
 */
router.put(
  '/settings',
  [
    body('syncSettings').isObject().withMessage('syncSettings must be an object'),
    body('syncSettings.autoSyncSales')
      .optional()
      .isBoolean()
      .withMessage('autoSyncSales must be boolean'),
    body('syncSettings.autoSyncInterval')
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage('autoSyncInterval must be between 1 and 1440 minutes'),
    body('syncSettings.syncProducts')
      .optional()
      .isBoolean()
      .withMessage('syncProducts must be boolean'),
    body('syncSettings.syncCustomers')
      .optional()
      .isBoolean()
      .withMessage('syncCustomers must be boolean'),
    body('syncSettings.syncInventory')
      .optional()
      .isBoolean()
      .withMessage('syncInventory must be boolean'),
  ],
  validateRequest,
  updateSettings
);

/**
 * @route   DELETE /api/integrations/loyverse/disconnect
 * @desc    Disconnect from Loyverse
 * @access  Private
 */
router.delete('/disconnect', disconnectLoyverse);

export default router;
