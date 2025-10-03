// Advanced caching strategy for HAFJET Cloud Accounting System
class CacheManager {
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }>;
  private maxSize: number;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  // Set cache with TTL (time to live) in milliseconds
  set(key: string, data: unknown, ttl = 300000): void { // 5 minutes default
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get cached data if not expired
  get(key: string): unknown | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Remove specific key
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would need to implement hit tracking for accurate rate
    };
  }
}

// Global cache instances
export const apiCache = new CacheManager(50);
export const componentCache = new CacheManager(30);
export const userDataCache = new CacheManager(20);

// API response caching wrapper
export const cachedApiCall = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl = 300000
): Promise<T> => {
  // Check cache first
  const cached = apiCache.get(key) as T;
  if (cached) {
    console.log(`🎯 Cache hit: ${key}`);
    return cached;
  }

  console.log(`🌐 API call: ${key}`);
  try {
    const result = await apiCall();
    apiCache.set(key, result, ttl);
    return result;
  } catch (error) {
    console.error(`API call failed for ${key}:`, error);
    throw error;
  }
};

// Local storage wrapper with compression
export const localStorage = {
  setItem: (key: string, value: unknown): void => {
    try {
      const compressed = JSON.stringify(value);
      window.localStorage.setItem(key, compressed);
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }
  },

  getItem: (key: string): unknown | null => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
    }
  },

  clear: (): void => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

// Session storage wrapper
export const sessionStorage = {
  setItem: (key: string, value: unknown): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error);
    }
  },

  getItem: (key: string): unknown | null => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error);
    }
  },

  clear: (): void => {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }
};

// Cache invalidation strategies
export const invalidateCache = {
  // Invalidate user-specific data
  user: (): void => {
    userDataCache.clear();
    apiCache.delete('user-profile');
    apiCache.delete('user-settings');
    localStorage.removeItem('user-preferences');
  },

  // Invalidate financial data
  financial: (): void => {
    apiCache.delete('dashboard-data');
    apiCache.delete('transactions');
    apiCache.delete('invoices');
    apiCache.delete('reports');
  },

  // Invalidate all caches
  all: (): void => {
    apiCache.clear();
    componentCache.clear();
    userDataCache.clear();
    localStorage.clear();
    sessionStorage.clear();
  }
};

// Performance monitoring for cache
export const cacheMetrics = {
  logHit: (key: string): void => {
    console.log(`✅ Cache hit: ${key}`);
  },

  logMiss: (key: string): void => {
    console.log(`❌ Cache miss: ${key}`);
  },

  getOverallStats: () => {
    return {
      api: apiCache.getStats(),
      component: componentCache.getStats(),
      userData: userDataCache.getStats()
    };
  }
};