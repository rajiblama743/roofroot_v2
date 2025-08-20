import { Document, Types } from 'mongoose';

export type TransactionType = 'sale' | 'lease' | 'auction';
export type TransactionStatus = 'pending' | 'under_contract' | 'contingent' | 'closed' | 'cancelled';

export interface IFinancials {
  purchasePrice?: number;
  earnestMoney?: number;
  closingCosts?: number;
  commission?: number;
}

export interface ITimeline {
  offerDate?: Date;
  acceptanceDate?: Date;
  inspectionDate?: Date;
  closingDate?: Date;
}

export interface IDocuments {
  purchaseAgreement?: string;
  addendums?: string[];
  disclosures?: string[];
}

export interface ITransaction extends Document {
  listingId: Types.ObjectId;
  propertyId: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  agencyId: Types.ObjectId;
  transactionType: TransactionType;
  status: TransactionStatus;
  financials?: IFinancials;
  timeline?: ITimeline;
  documents?: IDocuments;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface ITransactionResponse {
  _id: string;
  listingId: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  agencyId: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  financials?: IFinancials;
  timeline?: ITimeline;
  documents?: IDocuments;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface ITransactionCreate {
  listingId: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  agencyId: string;
  transactionType: TransactionType;
  status?: TransactionStatus;
  financials?: IFinancials;
  timeline?: ITimeline;
  documents?: IDocuments;
}

export interface ITransactionUpdate {
  status?: TransactionStatus;
  financials?: Partial<IFinancials>;
  timeline?: Partial<ITimeline>;
  documents?: Partial<IDocuments>;
  closedAt?: Date;
}

export interface ITransactionFilters {
  listingId?: string;
  propertyId?: string;
  buyerId?: string;
  sellerId?: string;
  agencyId?: string;
  transactionType?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
}
