import { Document, Types } from 'mongoose';

export type PropertyStatus = 'available' | 'sold' | 'rented' | 'under_contract' | 'off_market';

export interface ICoordinates {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IPhysicalDetails {
  address: string;
  coordinates?: ICoordinates;
  lotSize?: number;
  buildingSize?: number;
}

export interface IFeatures {
  amenities?: string[];
  utilities?: string[];
  parking?: string;
  yearBuilt?: number;
}

export interface IMedia {
  photos?: string[];
  virtualTours?: string[];
  videos?: string[];
  floorPlans?: string[];
}

export interface IMarketInfo {
  marketValue?: number;
  pricePerSqm?: number;
  comparables?: string[];
}

export interface IProperty extends Document {
  agencyId: Types.ObjectId;
  title: string;
  description: string;
  propertyType: string;
  status: PropertyStatus;
  physicalDetails: IPhysicalDetails;
  features: IFeatures;
  media: IMedia;
  marketInfo: IMarketInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyResponse {
  _id: string;
  agencyId: string;
  title: string;
  description: string;
  propertyType: string;
  status: PropertyStatus;
  physicalDetails: IPhysicalDetails;
  features: IFeatures;
  media: IMedia;
  marketInfo: IMarketInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyCreate {
  agencyId: string;
  title: string;
  description: string;
  propertyType: string;
  status?: PropertyStatus;
  physicalDetails: IPhysicalDetails;
  features?: IFeatures;
  media?: IMedia;
  marketInfo?: IMarketInfo;
}

export interface IPropertyUpdate {
  title?: string;
  description?: string;
  propertyType?: string;
  status?: PropertyStatus;
  physicalDetails?: Partial<IPhysicalDetails>;
  features?: Partial<IFeatures>;
  media?: Partial<IMedia>;
  marketInfo?: Partial<IMarketInfo>;
}

export interface IPropertyFilters {
  q?: string;
  propertyType?: string;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  location?: {
    near?: ICoordinates;
    maxDistance?: number; // in meters
  };
  amenities?: string[];
  page?: number;
  limit?: number;
}
