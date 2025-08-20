import { Document, Types } from 'mongoose';

export type ListingStatus = 'active' | 'pending' | 'sold' | 'rented' | 'inactive';
export type SaleOrLease = 'sale' | 'lease';
export type PromotionLevel = 'basic' | 'boosted' | 'premium';

export interface IListingDetails {
  title: string;
  description: string;
  highlights?: string[];
  showingInstructions?: string;
}

export interface IMarketing {
  featured: boolean;
  promotionLevel?: PromotionLevel;
  seoKeywords?: string[];
}

export interface IPerformance {
  views: number;
  inquiries: number;
  showings: number;
  offers: number;
}

export interface IFinancials {
  commission?: number;
  fees?: number;
  expenses?: number;
  roi?: number;
}

export interface IDenormData {
  agencyName?: string;
  propertyTitle?: string;
}

export interface IListing extends Document {
  propertyId: Types.ObjectId;
  agencyId: Types.ObjectId;
  agentId: Types.ObjectId;
  listingDetails: IListingDetails;
  marketing: IMarketing;
  status: ListingStatus;
  performance: IPerformance;
  financials: IFinancials;
  saleOrLease: SaleOrLease;
  denorm: IDenormData;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date;
}

export interface IListingResponse {
  _id: string;
  propertyId: string;
  agencyId: string;
  agentId: string;
  listingDetails: IListingDetails;
  marketing: IMarketing;
  status: ListingStatus;
  performance: IPerformance;
  financials: IFinancials;
  saleOrLease: SaleOrLease;
  denorm: IDenormData;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date;
}

export interface IListingCreate {
  propertyId: string;
  agencyId: string;
  agentId: string;
  listingDetails: IListingDetails;
  marketing?: IMarketing;
  status?: ListingStatus;
  saleOrLease: SaleOrLease;
  publishedAt?: Date;
  expiresAt?: Date;
}

export interface IListingUpdate {
  listingDetails?: Partial<IListingDetails>;
  marketing?: Partial<IMarketing>;
  status?: ListingStatus;
  performance?: Partial<IPerformance>;
  financials?: Partial<IFinancials>;
  publishedAt?: Date;
  expiresAt?: Date;
}

export interface IListingFilters {
  q?: string;
  status?: ListingStatus;
  saleOrLease?: SaleOrLease;
  featured?: boolean;
  agencyId?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// Legacy v1 compatibility interface
export interface ILegacyListingResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'sale' | 'lease';
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  carBay?: number;
  area?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
} 