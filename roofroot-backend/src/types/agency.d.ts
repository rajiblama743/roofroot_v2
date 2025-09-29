import { Document, Types } from 'mongoose';

export type VerificationStatus = 'unverified' | 'pending_verification' | 'verified' | 'rejected';

export interface IVerificationWorkflow {
  verificationStatus: VerificationStatus;
  profileComplete: boolean;
  completionPercentage: number;
  verificationRequestedAt?: Date;
  verificationRequestedBy?: Types.ObjectId;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  rejectionReason?: string;
  rejectedAt?: Date;
  rejectedBy?: Types.ObjectId;
  lastProfileUpdate: Date;
}

export interface IBusinessInfo {
  legalName?: string;
  businessType?: string;
  taxId?: string;
  yearEstablished?: number;
}

export interface ILicensing {
  licenseNumber?: string;
  insurance?: string;
  complianceStatus?: string;
}

export interface ILocations {
  headquarters?: string;
  branches?: string[];
  serviceAreas?: string[];
}

export interface IExpertise {
  propertyTypes?: string[];
  priceRanges?: string[];
  neighborhoods?: string[];
}

export interface IPerformance {
  totalTransactions?: number;
  satisfactionScore?: number;
  responseTime?: number;
}

export interface ISocialProof {
  reviews?: number;
  ratings?: number;
  awards?: string[];
  testimonials?: number;
}

export interface IAgency extends Document {
  userId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  logo?: string;
  coverImage?: string;
  businessInfo: IBusinessInfo;
  licensing: ILicensing;
  locations: ILocations;
  expertise: IExpertise;
  performance: IPerformance;
  socialProof: ISocialProof;
  verificationWorkflow: IVerificationWorkflow;
  approvalDate?: Date;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgencyResponse {
  _id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  logo?: string;
  coverImage?: string;
  businessInfo: IBusinessInfo;
  licensing: ILicensing;
  locations: ILocations;
  expertise: IExpertise;
  performance: IPerformance;
  socialProof: ISocialProof;
  verificationWorkflow: IVerificationWorkflow;
  approvalDate?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgencyCreate {
  userId: string;
  name: string;
  description?: string;
  tagline?: string;
  logo?: string;
  coverImage?: string;
  businessInfo?: IBusinessInfo;
  licensing?: ILicensing;
  locations?: ILocations;
  expertise?: IExpertise;
}

export interface IAgencyUpdate {
  name?: string;
  description?: string;
  tagline?: string;
  logo?: string;
  coverImage?: string;
  businessInfo?: Partial<IBusinessInfo>;
  licensing?: Partial<ILicensing>;
  locations?: Partial<ILocations>;
  expertise?: Partial<IExpertise>;
  verificationWorkflow?: Partial<IVerificationWorkflow>;
  approvalDate?: Date;
  approvedBy?: string;
}

export interface IAgencyFilters {
  q?: string;
  serviceAreas?: string[];
  propertyTypes?: string[];
  priceRanges?: string[];
  verificationStatus?: VerificationStatus;
  page?: number;
  limit?: number;
}
