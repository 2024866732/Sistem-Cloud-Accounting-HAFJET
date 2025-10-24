import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  
  // 2FA fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  
  // Profile
  phone?: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  
  // Security
  lastLogin?: Date;
  lastPasswordChange?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>({
  companyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true,
    // Do not set global unique here; we enforce uniqueness per company via a compound index below
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8,
    select: false // Don't include password in queries by default
  },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'staff', 'viewer'], 
    default: 'staff',
    required: true
  },
  permissions: {
    type: [String],
    default: []
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active',
    required: true,
    index: true
  },
  
  // 2FA
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  twoFactorSecret: { 
    type: String, 
    select: false // Sensitive - don't include by default
  },
  twoFactorBackupCodes: {
    type: [String],
    select: false // Sensitive - don't include by default
  },
  
  // Profile
  phone: { 
    type: String,
    trim: true
  },
  department: { 
    type: String,
    trim: true
  },
  jobTitle: { 
    type: String,
    trim: true
  },
  avatar: { 
    type: String 
  },
  
  // Security
  lastLogin: { 
    type: Date 
  },
  lastPasswordChange: { 
    type: Date,
    default: Date.now
  },
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: { 
    type: Date 
  },
  
  // Metadata
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true
});

// Indexes for performance & scoped uniqueness (allow same email in different companies)
UserSchema.index({ companyId: 1, email: 1 }, { unique: true });
UserSchema.index({ companyId: 1, status: 1 });
UserSchema.index({ companyId: 1, role: 1 });

// Pre-save middleware: Hash password before saving
UserSchema.pre('save', async function(next) {
  const user = this as IUser;
  
  // Only hash password if it's been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }
  
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
    user.lastPasswordChange = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method: Compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method: Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours
  
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    
    // Lock the account if max attempts reached
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
      this.lockUntil = new Date(Date.now() + LOCK_TIME);
    }
  }
  
  await this.save();
};

// Method: Reset login attempts
UserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  if (this.loginAttempts === 0 && !this.lockUntil) {
    return; // Nothing to reset
  }
  
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// Method: Check if account is locked
UserSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Virtual for checking if account is locked
UserSchema.virtual('locked').get(function() {
  return this.isLocked();
});

// Don't return sensitive fields in JSON
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc, ret) {
    delete (ret as any).password;
    delete (ret as any).twoFactorSecret;
    delete (ret as any).twoFactorBackupCodes;
    delete (ret as any).__v;
    return ret;
  }
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
