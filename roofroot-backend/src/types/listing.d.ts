import { Request } from 'express';
import { IListing } from '../models/Listing';

// Request types
export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'sale' | 'lease';
  images?: string[];
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  type?: 'sale' | 'lease';
  images?: string[];
}

// Response types
export interface ListingResponse {
  success: boolean;
  message: string;
  listing?: IListing;
  listings?: IListing[];
  total?: number;
  page?: number;
  limit?: number;
}

import { IUser } from '../models/User';

// Extended Request with user
export interface AuthenticatedListingRequest extends Request {
  user?: IUser & { _id: string };
} 