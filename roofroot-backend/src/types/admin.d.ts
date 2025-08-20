import { Document, Types } from 'mongoose';

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface IPermissions {
  userManagement: boolean;
  agencyApproval: boolean;
  contentModeration: boolean;
  systemSettings: boolean;
  analytics: boolean;
  financialReports: boolean;
  security: boolean;
  support: boolean;
}

export interface IAdminAction {
  actionType: string;
  targetId: Types.ObjectId;
  description?: string;
  timestamp: Date;
}

export interface IAdmin extends Document {
  userId: Types.ObjectId;
  role: AdminRole;
  permissions: IPermissions;
  assignedAreas?: string[];
  assignedTasks?: string[];
  actions?: IAdminAction[];
  notifications?: boolean;
  language?: string;
  timezone?: string;
  lastLoginAt?: Date;
  twoFactorEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface IAdminResponse {
  _id: string;
  userId: string;
  role: AdminRole;
  permissions: IPermissions;
  assignedAreas?: string[];
  assignedTasks?: string[];
  actions?: IAdminAction[];
  notifications?: boolean;
  language?: string;
  timezone?: string;
  lastLoginAt?: Date;
  twoFactorEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface IAdminCreate {
  userId: string;
  role: AdminRole;
  permissions?: Partial<IPermissions>;
  assignedAreas?: string[];
  assignedTasks?: string[];
  language?: string;
  timezone?: string;
}

export interface IAdminUpdate {
  role?: AdminRole;
  permissions?: Partial<IPermissions>;
  assignedAreas?: string[];
  assignedTasks?: string[];
  notifications?: boolean;
  language?: string;
  timezone?: string;
  lastLoginAt?: Date;
  twoFactorEnabled?: boolean;
  lastActiveAt?: Date;
}

export interface IAdminFilters {
  role?: AdminRole;
  assignedAreas?: string[];
  page?: number;
  limit?: number;
}
