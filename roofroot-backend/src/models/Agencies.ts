import mongoose, { Schema, Document } from 'mongoose';
import { IAgency, VerificationStatus } from '../types/agency';

const businessInfoSchema = new Schema({
  legalName: String,
  businessType: String,
  taxId: String,
  yearEstablished: Number
}, { _id: false });

const licensingSchema = new Schema({
  licenseNumber: String,
  insurance: String,
  complianceStatus: String
}, { _id: false });

const locationsSchema = new Schema({
  headquarters: String,
  branches: [String],
  serviceAreas: [String]
}, { _id: false });

const expertiseSchema = new Schema({
  propertyTypes: [String],
  priceRanges: [String],
  neighborhoods: [String]
}, { _id: false });

const performanceSchema = new Schema({
  totalTransactions: { type: Number, default: 0 },
  satisfactionScore: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 }
}, { _id: false });

const socialProofSchema = new Schema({
  reviews: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },
  awards: [String],
  testimonials: { type: Number, default: 0 }
}, { _id: false });

const agencySchema = new Schema<IAgency>({
  userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true },
  description: String,
  tagline: String,
  logo: String,
  coverImage: String,
  businessInfo: { type: businessInfoSchema, default: {} },
  licensing: { type: licensingSchema, default: {} },
  locations: { type: locationsSchema, default: {} },
  expertise: { type: expertiseSchema, default: {} },
  performance: { type: performanceSchema, default: {} },
  socialProof: { type: socialProofSchema, default: {} },
  verificationStatus: { 
    type: String, 
    enum: ['unverified', 'verified', 'rejected'], 
    default: 'unverified' 
  },
  approvalDate: Date,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Users' }
}, {
  timestamps: true
});

// Indexes
agencySchema.index({ userId: 1 }, { unique: true });
agencySchema.index({ slug: 1 });
agencySchema.index({ verificationStatus: 1 });
agencySchema.index({ 'locations.serviceAreas': 1 });

const Agency = mongoose.model<IAgency>('Agencies', agencySchema);

export default Agency;
