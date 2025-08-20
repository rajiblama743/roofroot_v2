import mongoose, { Schema, Document } from 'mongoose';
import { IAdmin, AdminRole, IPermissions } from '../types/admin';

const permissionsSchema = new Schema<IPermissions>({
  userManagement: { type: Boolean, default: false },
  agencyApproval: { type: Boolean, default: false },
  contentModeration: { type: Boolean, default: false },
  systemSettings: { type: Boolean, default: false },
  analytics: { type: Boolean, default: false },
  financialReports: { type: Boolean, default: false },
  security: { type: Boolean, default: false },
  support: { type: Boolean, default: false }
});

const adminActionSchema = new Schema({
  actionType: { type: String, required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  description: String,
  timestamp: { type: Date, default: Date.now }
});

const adminSchema = new Schema<IAdmin>({
  userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'moderator', 'support'], required: true },
  permissions: { type: permissionsSchema },
  assignedAreas: [String],
  assignedTasks: [String],
  actions: [adminActionSchema],
  notifications: { type: Boolean, default: true },
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'UTC' },
  lastLoginAt: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  lastActiveAt: Date
}, {
  timestamps: true
});

// Indexes
adminSchema.index({ userId: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ 'actions.timestamp': 1 });
adminSchema.index({ lastActiveAt: 1 });

// Pre-save hook to set default permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isNew && !this.permissions) {
    this.permissions = {} as IPermissions;
    
    switch (this.role) {
      case 'super_admin':
        this.permissions = {
          userManagement: true,
          agencyApproval: true,
          contentModeration: true,
          systemSettings: true,
          analytics: true,
          financialReports: true,
          security: true,
          support: true
        };
        break;
      case 'admin':
        this.permissions = {
          userManagement: true,
          agencyApproval: true,
          contentModeration: true,
          systemSettings: false,
          analytics: true,
          financialReports: true,
          security: false,
          support: true
        };
        break;
      case 'moderator':
        this.permissions = {
          userManagement: false,
          agencyApproval: false,
          contentModeration: true,
          systemSettings: false,
          analytics: false,
          financialReports: false,
          security: false,
          support: true
        };
        break;
      case 'support':
        this.permissions = {
          userManagement: false,
          agencyApproval: false,
          contentModeration: false,
          systemSettings: false,
          analytics: false,
          financialReports: false,
          security: false,
          support: true
        };
        break;
    }
  }
  next();
});

const Admin = mongoose.model<IAdmin>('Admins', adminSchema);

export default Admin;
