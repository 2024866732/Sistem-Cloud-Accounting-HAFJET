import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface SyncStatus {
  type: 'products' | 'customers' | 'sales' | 'inventory';
  label: string;
  lastSync: string;
  status: 'success' | 'syncing' | 'error';
  count: number;
}

export interface ConnectionResponse {
  success: boolean;
  message: string;
  data?: {
    isConnected: boolean;
    statistics?: {
      totalProducts: number;
      totalCustomers: number;
      totalSales: number;
      totalInventoryItems: number;
    };
  };
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data?: {
    syncedCount: number;
    duration: number;
    syncType: string;
  };
}

export interface StatusResponse {
  success: boolean;
  data: {
    isConnected: boolean;
    syncStatuses: SyncStatus[];
    lastSync: string | null;
    syncSettings: {
      autoSyncSales: boolean;
      syncProducts: boolean;
      syncCustomers: boolean;
      syncInventory: boolean;
    };
  };
}

export interface DisconnectResponse {
  success: boolean;
  message: string;
}

// Loyverse Integration API Service
export const loyverseApi = {
  /**
   * Connect to Loyverse using API key
   */
  async connect(apiKey: string): Promise<ConnectionResponse> {
    try {
      const response = await apiClient.post('/integrations/loyverse/connect', {
        apiKey,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to connect to Loyverse');
      }
      throw error;
    }
  },

  /**
   * Get current connection status and sync history
   */
  async getStatus(): Promise<StatusResponse> {
    try {
      const response = await apiClient.get('/integrations/loyverse/status');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get status');
      }
      throw error;
    }
  },

  /**
   * Trigger manual sync
   * @param type - Type of sync: 'all' | 'products' | 'customers' | 'sales' | 'inventory'
   */
  async sync(type: 'all' | 'products' | 'customers' | 'sales' | 'inventory' = 'all'): Promise<SyncResponse> {
    try {
      const response = await apiClient.post('/integrations/loyverse/sync', {
        type,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to sync data');
      }
      throw error;
    }
  },

  /**
   * Update sync settings
   */
  async updateSettings(settings: {
    autoSyncSales?: boolean;
    syncProducts?: boolean;
    syncCustomers?: boolean;
    syncInventory?: boolean;
    syncIntervalMinutes?: number;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.patch('/integrations/loyverse/settings', settings);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update settings');
      }
      throw error;
    }
  },

  /**
   * Disconnect from Loyverse
   */
  async disconnect(): Promise<DisconnectResponse> {
    try {
      const response = await apiClient.delete('/integrations/loyverse/disconnect');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to disconnect');
      }
      throw error;
    }
  },

  /**
   * Get sync history logs
   */
  async getSyncHistory(limit: number = 20): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      syncType: string;
      status: string;
      startedAt: string;
      completedAt: string;
      itemsSynced: number;
      errors: number;
    }>;
  }> {
    try {
      const response = await apiClient.get(`/integrations/loyverse/sync-history?limit=${limit}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get sync history');
      }
      throw error;
    }
  },
};

// Export API client for other services
export default apiClient;
