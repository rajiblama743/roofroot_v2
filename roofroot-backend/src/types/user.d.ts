import { Document } from 'mongoose';

export type UserRole = 'admin' | 'super_admin' | 'agency' | 'customer';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  _id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface IUserUpdate {
  name?: string;
  phoneNumber?: string;
  status?: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastActiveAt?: Date;
}

export interface IUserLogin {
  email: string;
  password: string;
} 