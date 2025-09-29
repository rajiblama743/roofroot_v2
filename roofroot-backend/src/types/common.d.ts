import { Request } from 'express';
import { IUser } from './user';

// Pagination types
export interface IPaginationQuery {
  page?: number;
  limit?: number;
}

export interface IPaginationResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface IErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  code?: string;
}

export interface ISuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
}

// Authentication types
export interface IAuthenticatedRequest extends Request {
  user?: IUser & { _id: string; agencyId?: string };
}

export interface IJWTPayload {
  userId: string;
  email: string;
  role: string;
  agencyId?: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<IUser, 'password'> & { agencyId?: string };
  agency?: any; // Agency profile data for agency login responses
  nextStep?: string; // Next step for onboarding flow
  redirectTo?: string; // Redirect URL for frontend
  profileCompletion?: number; // Profile completion percentage
  estimatedReviewTime?: string; // Estimated time for verification review
  rejectionReason?: string; // Reason for profile rejection
}

// Validation types
export interface IValidationError {
  field: string;
  message: string;
}

// Search and filter types
export interface ISearchFilters extends IPaginationQuery {
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Legacy compatibility
export interface ILegacyResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
}
