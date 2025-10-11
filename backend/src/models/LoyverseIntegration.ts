import mongoose, { Document, Schema } from 'mongoose';

export interface ILoyverseIntegration extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  apiKey: string; // Encrypted
  isActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSyncAt?: Date;
  syncSettings: {
    autoSyncSales: boolean;
    autoSyncInterval: number; // minutes
    syncProducts: boolean;
    syncCustomers: boolean;
    syncInventory: boolean;
  };
  syncStatistics: {
    totalSyncs: number;
    lastSyncDuration?: number; // seconds
    totalProductsSynced: number;
    totalCustomersSynced: number;
    totalSalesSynced: number;
    totalInventorySynced: number;
  };
  errorLog?: {
    lastError?: string;
    lastErrorAt?: Date;
    errorCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LoyverseIntegrationSchema = new Schema<ILoyverseIntegration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    apiKey: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    connectionStatus: {
      type: String,
      enum: ['connected', 'disconnected', 'error'],
      default: 'disconnected',
    },
    lastSyncAt: {
      type: Date,
    },
    syncSettings: {
      autoSyncSales: {
        type: Boolean,
        default: true,
      },
      autoSyncInterval: {
        type: Number,
        default: 5, // 5 minutes
      },
      syncProducts: {
        type: Boolean,
        default: true,
      },
      syncCustomers: {
        type: Boolean,
        default: true,
      },
      syncInventory: {
        type: Boolean,
        default: true,
      },
    },
    syncStatistics: {
      totalSyncs: {
        type: Number,
        default: 0,
      },
      lastSyncDuration: {
        type: Number,
      },
      totalProductsSynced: {
        type: Number,
        default: 0,
      },
      totalCustomersSynced: {
        type: Number,
        default: 0,
      },
      totalSalesSynced: {
        type: Number,
        default: 0,
      },
      totalInventorySynced: {
        type: Number,
        default: 0,
      },
    },
    errorLog: {
      lastError: String,
      lastErrorAt: Date,
      errorCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
LoyverseIntegrationSchema.index({ userId: 1, companyId: 1 }, { unique: true });
LoyverseIntegrationSchema.index({ isActive: 1, connectionStatus: 1 });

export default mongoose.model<ILoyverseIntegration>(
  'LoyverseIntegration',
  LoyverseIntegrationSchema
);
