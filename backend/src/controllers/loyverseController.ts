import { Request, Response } from 'express';
import { LoyverseService } from '../services/loyverseService';
import LoyverseIntegration from '../models/LoyverseIntegration';
import LoyverseSyncLog from '../models/LoyverseSyncLog';

interface AuthRequest extends Request {
  user?: {
    id: string;
    companyId: string;
  };
}

/**
 * Connect to Loyverse POS
 * POST /api/integrations/loyverse/connect
 */
export const connectLoyverse = async (req: AuthRequest, res: Response) => {
  try {
    const { apiKey } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required',
      });
    }

    if (!userId || !companyId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Create integration
    const integration = await LoyverseService.createIntegration(
      userId,
      companyId,
      apiKey
    );

    res.status(200).json({
      success: true,
      message: 'Successfully connected to Loyverse',
      data: {
        integrationId: integration._id,
        connectionStatus: integration.connectionStatus,
        syncSettings: integration.syncSettings,
      },
    });
  } catch (error: any) {
    console.error('Loyverse connection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to connect to Loyverse',
    });
  }
};

/**
 * Get integration status
 * GET /api/integrations/loyverse/status
 */
export const getStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const integration = await LoyverseService.getIntegration(userId, companyId);

    if (!integration) {
      return res.status(200).json({
        success: true,
        data: {
          isConnected: false,
          connectionStatus: 'disconnected',
        },
      });
    }

    // Get recent sync logs
    const syncLogs = await LoyverseService.getSyncLogs(
      String(integration._id),
      5
    );

    // Calculate sync statuses
    const syncStatuses = [
      {
        type: 'products',
        label: 'Products & Services',
        lastSync: integration.lastSyncAt
          ? getTimeAgo(integration.lastSyncAt)
          : 'Never',
        status: getSyncStatus(syncLogs, 'products'),
        count: integration.syncStatistics.totalProductsSynced,
      },
      {
        type: 'customers',
        label: 'Customers',
        lastSync: integration.lastSyncAt
          ? getTimeAgo(integration.lastSyncAt)
          : 'Never',
        status: getSyncStatus(syncLogs, 'customers'),
        count: integration.syncStatistics.totalCustomersSynced,
      },
      {
        type: 'sales',
        label: 'Sales Transactions',
        lastSync: integration.lastSyncAt
          ? getTimeAgo(integration.lastSyncAt)
          : 'Never',
        status: getSyncStatus(syncLogs, 'sales'),
        count: integration.syncStatistics.totalSalesSynced,
      },
      {
        type: 'inventory',
        label: 'Inventory Levels',
        lastSync: integration.lastSyncAt
          ? getTimeAgo(integration.lastSyncAt)
          : 'Never',
        status: getSyncStatus(syncLogs, 'inventory'),
        count: integration.syncStatistics.totalInventorySynced,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        isConnected: integration.isActive,
        connectionStatus: integration.connectionStatus,
        syncSettings: integration.syncSettings,
        syncStatuses,
        syncStatistics: integration.syncStatistics,
        lastSyncAt: integration.lastSyncAt,
        recentSyncLogs: syncLogs.map((log) => ({
          id: log._id,
          syncType: log.syncType,
          status: log.status,
          startedAt: log.startedAt,
          completedAt: log.completedAt,
          duration: log.duration,
          recordsProcessed: log.recordsProcessed,
          recordsCreated: log.recordsCreated,
          recordsUpdated: log.recordsUpdated,
          recordsFailed: log.recordsFailed,
        })),
      },
    });
  } catch (error: any) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get status',
    });
  }
};

/**
 * Trigger manual sync
 * POST /api/integrations/loyverse/sync
 */
export const syncData = async (req: AuthRequest, res: Response) => {
  try {
    const { type = 'all' } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const integration = await LoyverseService.getIntegration(userId, companyId);

    if (!integration || !integration.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Loyverse integration not active',
      });
    }

    // Create sync log
    const syncLog = await LoyverseService.createSyncLog(
      String(integration._id),
      userId,
      companyId,
      type
    );

    // Start sync in background (don't await)
    performSync(integration, String(syncLog._id), type).catch((error) => {
      console.error('Sync error:', error);
    });

    res.status(200).json({
      success: true,
      message: 'Sync started',
      data: {
        syncLogId: syncLog._id,
        syncType: type,
        status: 'processing',
      },
    });
  } catch (error: any) {
    console.error('Sync trigger error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start sync',
    });
  }
};

/**
 * Update sync settings
 * PUT /api/integrations/loyverse/settings
 */
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { syncSettings } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const integration = await LoyverseIntegration.findOneAndUpdate(
      { userId, companyId },
      { syncSettings },
      { new: true }
    );

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        syncSettings: integration.syncSettings,
      },
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings',
    });
  }
};

/**
 * Disconnect from Loyverse
 * DELETE /api/integrations/loyverse/disconnect
 */
export const disconnectLoyverse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    await LoyverseService.disconnectIntegration(userId, companyId);

    res.status(200).json({
      success: true,
      message: 'Successfully disconnected from Loyverse',
    });
  } catch (error: any) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to disconnect',
    });
  }
};

/**
 * Perform actual sync operation (background)
 */
async function performSync(
  integration: any,
  syncLogId: string,
  syncType: string
) {
  const startTime = Date.now();

  try {
    // Update log to processing
    await LoyverseService.updateSyncLog(syncLogId, {
      status: 'processing',
    });

    // Decrypt API key
    const apiKey = LoyverseService.decryptApiKey(integration.apiKey);
    const service = new LoyverseService(apiKey);

    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    const recordsProcessed: any = {};

    // Sync based on type
    if (syncType === 'all' || syncType === 'products') {
      const result = await syncProducts(service);
      recordsProcessed.products = result.processed;
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalProcessed += result.processed;
    }

    if (syncType === 'all' || syncType === 'customers') {
      const result = await syncCustomers(service);
      recordsProcessed.customers = result.processed;
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalProcessed += result.processed;
    }

    if (syncType === 'all' || syncType === 'sales') {
      const result = await syncSales(service);
      recordsProcessed.sales = result.processed;
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalProcessed += result.processed;
    }

    if (syncType === 'all' || syncType === 'inventory') {
      const result = await syncInventory(service);
      recordsProcessed.inventory = result.processed;
      totalUpdated += result.updated;
      totalProcessed += result.processed;
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Update sync log as completed
    await LoyverseService.updateSyncLog(syncLogId, {
      status: 'completed',
      completedAt: new Date(),
      duration,
      recordsProcessed,
      recordsCreated: totalCreated,
      recordsUpdated: totalUpdated,
    });

    // Update integration statistics
    await LoyverseIntegration.findByIdAndUpdate(integration._id, {
      lastSyncAt: new Date(),
      'syncStatistics.totalSyncs': integration.syncStatistics.totalSyncs + 1,
      'syncStatistics.lastSyncDuration': duration,
    });
  } catch (error: any) {
    console.error('Perform sync error:', error);

    // Update sync log as failed
    await LoyverseService.updateSyncLog(syncLogId, {
      status: 'failed',
      completedAt: new Date(),
      errorDetails: {
        message: error.message,
        stack: error.stack,
      },
    });

    // Update integration error log
    await LoyverseIntegration.findByIdAndUpdate(integration._id, {
      'errorLog.lastError': error.message,
      'errorLog.lastErrorAt': new Date(),
      $inc: { 'errorLog.errorCount': 1 },
    });
  }
}

/**
 * Sync products (mock implementation)
 */
async function syncProducts(service: LoyverseService) {
  // TODO: Implement actual product sync logic
  // This is a mock implementation
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { processed: 234, created: 12, updated: 222 };
}

/**
 * Sync customers (mock implementation)
 */
async function syncCustomers(service: LoyverseService) {
  // TODO: Implement actual customer sync logic
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { processed: 892, created: 34, updated: 858 };
}

/**
 * Sync sales (mock implementation)
 */
async function syncSales(service: LoyverseService) {
  // TODO: Implement actual sales sync logic
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { processed: 1547, created: 67, updated: 1480 };
}

/**
 * Sync inventory (mock implementation)
 */
async function syncInventory(service: LoyverseService) {
  // TODO: Implement actual inventory sync logic
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { processed: 189, created: 0, updated: 189 };
}

/**
 * Helper: Get sync status from logs
 */
function getSyncStatus(logs: any[], type: string): string {
  const relevantLog = logs.find(
    (log) => log.syncType === type || log.syncType === 'all'
  );

  if (!relevantLog) return 'success';

  if (relevantLog.status === 'processing') return 'syncing';
  if (relevantLog.status === 'failed') return 'error';
  return 'success';
}

/**
 * Helper: Get time ago string
 */
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
