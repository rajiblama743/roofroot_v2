import { IUser } from '../models/User';

// Request body interface for creating/updating users
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
}

// Response interfaces
export interface UserResponse {
  success: boolean;
  message: string;
  data?: IUser;
  count?: number;
  error?: string;
}

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
} 