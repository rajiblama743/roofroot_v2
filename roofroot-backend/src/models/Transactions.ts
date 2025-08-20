import mongoose, { Schema, Document } from 'mongoose';
import { ITransaction, TransactionType, TransactionStatus } from '../types/transaction';

const financialsSchema = new Schema({
  purchasePrice: Number,
  earnestMoney: Number,
  closingCosts: Number,
  commission: Number
}, { _id: false });

const timelineSchema = new Schema({
  offerDate: Date,
  acceptanceDate: Date,
  inspectionDate: Date,
  closingDate: Date
}, { _id: false });

const documentsSchema = new Schema({
  purchaseAgreement: String,
  addendums: [String],
  disclosures: [String]
}, { _id: false });

const transactionSchema = new Schema<ITransaction>({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listings', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Properties', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  agencyId: { type: Schema.Types.ObjectId, ref: 'Agencies', required: true },
  transactionType: { 
    type: String, 
    enum: ['sale', 'lease', 'auction'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'under_contract', 'contingent', 'closed', 'cancelled'], 
    default: 'pending' 
  },
  financials: financialsSchema,
  timeline: timelineSchema,
  documents: documentsSchema,
  closedAt: Date
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ listingId: 1 });
transactionSchema.index({ agencyId: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: 1 });

const Transaction = mongoose.model<ITransaction>('Transactions', transactionSchema);

export default Transaction;
