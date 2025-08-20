import mongoose, { Schema, Document } from 'mongoose';
import { IListing, ListingStatus, SaleOrLease, PromotionLevel } from '../types/listing';

const listingDetailsSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  highlights: [String],
  showingInstructions: String
}, { _id: false });

const marketingSchema = new Schema({
  featured: { type: Boolean, default: false },
  promotionLevel: { 
    type: String, 
    enum: ['basic', 'boosted', 'premium'], 
    default: 'basic' 
  },
  seoKeywords: [String]
}, { _id: false });

const performanceSchema = new Schema({
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  showings: { type: Number, default: 0 },
  offers: { type: Number, default: 0 }
}, { _id: false });

const financialsSchema = new Schema({
  commission: Number,
  fees: Number,
  expenses: Number,
  roi: Number
}, { _id: false });

const denormDataSchema = new Schema({
  agencyName: String,
  propertyTitle: String
}, { _id: false });

const listingSchema = new Schema<IListing>({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Properties', required: true },
  agencyId: { type: Schema.Types.ObjectId, ref: 'Agencies', required: true },
  agentId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  listingDetails: { type: listingDetailsSchema, required: true },
  marketing: { type: marketingSchema, default: {} },
  status: { 
    type: String, 
    enum: ['active', 'pending', 'sold', 'rented', 'inactive'], 
    default: 'pending' 
  },
  performance: { type: performanceSchema, default: {} },
  financials: { type: financialsSchema, default: {} },
  saleOrLease: { 
    type: String, 
    enum: ['sale', 'lease'], 
    required: true 
  },
  denorm: { type: denormDataSchema, default: {} },
  publishedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
listingSchema.index({ propertyId: 1 });
listingSchema.index({ agencyId: 1, status: 1, createdAt: 1 });
listingSchema.index({ status: 1, createdAt: 1 });
listingSchema.index({ 'marketing.featured': 1 });

const Listing = mongoose.model<IListing>('Listings', listingSchema);

export default Listing;
