import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import LoyverseIntegration, { ILoyverseIntegration } from '../models/LoyverseIntegration';
import LoyverseSyncLog, { ILoyverseSyncLog } from '../models/LoyverseSyncLog';

const LOYVERSE_API_BASE_URL = 'https://api.loyverse.com/v1.0';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

interface LoyverseProduct {
  id: string;
  item_name: string;
  reference_id?: string;
  description?: string;
  variants: Array<{
    variant_id: string;
    item_name: string;
    sku?: string;
    price: number;
    cost: number;
  }>;
  category?: {
    id: string;
    name: string;
  };
}

interface LoyverseCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  customer_code?: string;
  total_visits?: number;
  total_spent?: number;
}

interface LoyverseSale {
  id: string;
  receipt_number: string;
  receipt_date: string;
  total_money: number;
  total_tax: number;
  total_discount: number;
  customer_id?: string;
  line_items: Array<{
    id: string;
    item_name: string;
    quantity: number;
    price: number;
    cost: number;
    line_total: number;
    line_tax: number;
  }>;
  payments: Array<{
    payment_type_id: string;
    payment_type_name: string;
    amount: number;
  }>;
}

interface LoyverseInventory {
  variant_id: string;
  store_id: string;
  available_quantity: number;
  on_hand_quantity: number;
}

export class LoyverseService {
  private apiClient: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiClient = axios.create({
      baseURL: LOYVERSE_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Encrypt API key for storage
   */
  static encryptApiKey(apiKey: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32),
        iv
      );

      let encrypted = cipher.update(apiKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
      throw new Error('Failed to encrypt API key');
    }
  }

  /**
   * Decrypt API key from storage
   */
  static decryptApiKey(encryptedKey: string): string {
    try {
      const parts = encryptedKey.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted key format');
      }

      const [ivHex, encrypted, authTagHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32),
        iv
      );

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Test connection to Loyverse API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.get('/items', {
        params: { limit: 1 },
      });

      return {
        success: true,
        message: 'Connection successful',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Connection failed',
      };
    }
  }

  /**
   * Fetch all products from Loyverse
   */
  async fetchProducts(cursor?: string): Promise<{
    items: LoyverseProduct[];
    cursor?: string;
  }> {
    try {
      const params: any = { limit: 100 };
      if (cursor) {
        params.cursor = cursor;
      }

      const response = await this.apiClient.get('/items', { params });

      return {
        items: response.data.items || [],
        cursor: response.data.cursor,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch products: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Fetch all customers from Loyverse
   */
  async fetchCustomers(cursor?: string): Promise<{
    customers: LoyverseCustomer[];
    cursor?: string;
  }> {
    try {
      const params: any = { limit: 100 };
      if (cursor) {
        params.cursor = cursor;
      }

      const response = await this.apiClient.get('/customers', { params });

      return {
        customers: response.data.customers || [],
        cursor: response.data.cursor,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch customers: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Fetch sales/receipts from Loyverse
   */
  async fetchSales(
    startDate?: Date,
    endDate?: Date,
    cursor?: string
  ): Promise<{
    receipts: LoyverseSale[];
    cursor?: string;
  }> {
    try {
      const params: any = { limit: 100 };

      if (startDate) {
        params.created_at_min = startDate.toISOString();
      }
      if (endDate) {
        params.created_at_max = endDate.toISOString();
      }
      if (cursor) {
        params.cursor = cursor;
      }

      const response = await this.apiClient.get('/receipts', { params });

      return {
        receipts: response.data.receipts || [],
        cursor: response.data.cursor,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch sales: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Fetch inventory levels from Loyverse
   */
  async fetchInventory(cursor?: string): Promise<{
    inventory: LoyverseInventory[];
    cursor?: string;
  }> {
    try {
      const params: any = { limit: 100 };
      if (cursor) {
        params.cursor = cursor;
      }

      const response = await this.apiClient.get('/inventory', { params });

      return {
        inventory: response.data.inventory || [],
        cursor: response.data.cursor,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch inventory: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Create or update integration record
   */
  static async createIntegration(
    userId: string,
    companyId: string,
    apiKey: string
  ): Promise<ILoyverseIntegration> {
    try {
      // Test connection first
      const service = new LoyverseService(apiKey);
      const testResult = await service.testConnection();

      if (!testResult.success) {
        throw new Error(testResult.message);
      }

      // Encrypt API key
      const encryptedKey = this.encryptApiKey(apiKey);

      // Create or update integration
      const integration = await LoyverseIntegration.findOneAndUpdate(
        { userId, companyId },
        {
          apiKey: encryptedKey,
          isActive: true,
          connectionStatus: 'connected',
          lastSyncAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return integration;
    } catch (error: any) {
      throw new Error(`Failed to create integration: ${error.message}`);
    }
  }

  /**
   * Get integration for user
   */
  static async getIntegration(
    userId: string,
    companyId: string
  ): Promise<ILoyverseIntegration | null> {
    return await LoyverseIntegration.findOne({ userId, companyId });
  }

  /**
   * Disconnect integration
   */
  static async disconnectIntegration(
    userId: string,
    companyId: string
  ): Promise<void> {
    await LoyverseIntegration.findOneAndUpdate(
      { userId, companyId },
      {
        isActive: false,
        connectionStatus: 'disconnected',
      }
    );
  }

  /**
   * Create sync log
   */
  static async createSyncLog(
    integrationId: string,
    userId: string,
    companyId: string,
    syncType: 'products' | 'customers' | 'sales' | 'inventory' | 'all'
  ): Promise<ILoyverseSyncLog> {
    return await LoyverseSyncLog.create({
      integrationId,
      userId,
      companyId,
      syncType,
      status: 'pending',
      startedAt: new Date(),
    });
  }

  /**
   * Update sync log
   */
  static async updateSyncLog(
    logId: string,
    updates: Partial<ILoyverseSyncLog>
  ): Promise<void> {
    await LoyverseSyncLog.findByIdAndUpdate(logId, updates);
  }

  /**
   * Get sync logs
   */
  static async getSyncLogs(
    integrationId: string,
    limit: number = 20
  ): Promise<ILoyverseSyncLog[]> {
    return await LoyverseSyncLog.find({ integrationId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export default LoyverseService;
