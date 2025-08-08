import { Request } from 'express';
import { IUser, UserRole, UserStatus } from '../models/User';

// Extended Request interface with user property
export interface AuthenticatedRequest extends Request {
  user?: IUser & { _id: string };
}

// Registration request type
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  license?: string;
  address?: string;
}

// Login request type
export interface LoginRequest {
  email: string;
  password: string;
}

// User creation request type (admin only)
export interface CreateUserRequest extends RegisterRequest {
  role: UserRole;
  status?: UserStatus;
}

// User update request type
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  license?: string;
  address?: string;
  role?: UserRole;
  status?: UserStatus;
}

// Status update request type (admin only)
export interface UpdateUserStatusRequest {
  status: UserStatus;
}

// JWT payload type
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// API response types
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<IUser, 'password'>;
}

export interface UserResponse {
  success: boolean;
  message: string;
  user?: Omit<IUser, 'password'>;
  users?: Omit<IUser, 'password'>[];
}

// Error response type
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
} 