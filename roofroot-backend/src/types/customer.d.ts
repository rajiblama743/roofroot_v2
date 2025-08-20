import { Document, Types } from 'mongoose';

export type CommunicationMethod = 'email' | 'sms' | 'call';
export type CommunicationFrequency = 'low' | 'normal' | 'high';

export interface ISearchHistory {
  q: string;
  at: Date;
}

export interface IPreferences {
  propertyTypes?: string[];
  priceRanges?: string[];
  locations?: string[];
  notifications?: boolean;
}

export interface ICommunication {
  method?: CommunicationMethod;
  frequency?: CommunicationFrequency;
  marketingConsent?: boolean;
}

export interface IBehavior {
  pageViews?: number;
  timeSpentSec?: number;
  conversions?: number;
}

export interface ICustomer extends Document {
  userId: Types.ObjectId;
  preferences: IPreferences;
  searchHistory?: ISearchHistory[];
  savedProperties?: Types.ObjectId[];
  savedListings?: Types.ObjectId[];
  communication: ICommunication;
  behavior: IBehavior;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerResponse {
  _id: string;
  userId: string;
  preferences: IPreferences;
  searchHistory?: ISearchHistory[];
  savedProperties?: string[];
  savedListings?: string[];
  communication: ICommunication;
  behavior: IBehavior;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerCreate {
  userId: string;
  preferences?: IPreferences;
  communication?: ICommunication;
}

export interface ICustomerUpdate {
  preferences?: Partial<IPreferences>;
  communication?: Partial<ICommunication>;
  behavior?: Partial<IBehavior>;
}

export interface ICustomerPreferencesUpdate {
  propertyTypes?: string[];
  priceRanges?: string[];
  locations?: string[];
  notifications?: boolean;
}

export interface ICustomerCommunicationUpdate {
  method?: CommunicationMethod;
  frequency?: CommunicationFrequency;
  marketingConsent?: boolean;
}
