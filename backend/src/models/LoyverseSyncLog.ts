import mongoose, { Document, Schema } from 'mongoose';

export interface ILoyverseSyncLog extends Document {
  integrationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  syncType: 'products' | 'customers' | 'sales' | 'inventory' | 'all';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // seconds
  recordsProcessed: {
    products?: number;
    customers?: number;
    sales?: number;
    inventory?: number;
  };
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorDetails?: {
    message: string;
    code?: string;
    stack?: string;
  };
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const LoyverseSyncLogSchema = new Schema<ILoyverseSyncLog>(
  {
    integrationId: {
      type: Schema.Types.ObjectId,
      ref: 'LoyverseIntegration',
      required: true,
      index: true,
    },
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
    syncType: {
      type: String,
      enum: ['products', 'customers', 'sales', 'inventory', 'all'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    recordsProcessed: {
      products: { type: Number, default: 0 },
      customers: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
      inventory: { type: Number, default: 0 },
    },
    recordsCreated: {
      type: Number,
      default: 0,
    },
    recordsUpdated: {
      type: Number,
      default: 0,
    },
    recordsFailed: {
      type: Number,
      default: 0,
    },
    errorDetails: {
      message: String,
      code: String,
      stack: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
LoyverseSyncLogSchema.index({ integrationId: 1, createdAt: -1 });
LoyverseSyncLogSchema.index({ status: 1, startedAt: -1 });

export default mongoose.model<ILoyverseSyncLog>(
  'LoyverseSyncLog',
  LoyverseSyncLogSchema
);
