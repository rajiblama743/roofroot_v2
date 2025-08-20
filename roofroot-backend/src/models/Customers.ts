import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer, CommunicationMethod, CommunicationFrequency } from '../types/customer';

const searchHistorySchema = new Schema({
  q: { type: String, required: true },
  at: { type: Date, default: Date.now }
}, { _id: false });

const preferencesSchema = new Schema({
  propertyTypes: [String],
  priceRanges: [String],
  locations: [String],
  notifications: { type: Boolean, default: true }
}, { _id: false });

const communicationSchema = new Schema({
  method: { 
    type: String, 
    enum: ['email', 'sms', 'call'], 
    default: 'email' 
  },
  frequency: { 
    type: String, 
    enum: ['low', 'normal', 'high'], 
    default: 'normal' 
  },
  marketingConsent: { type: Boolean, default: false }
}, { _id: false });

const behaviorSchema = new Schema({
  pageViews: { type: Number, default: 0 },
  timeSpentSec: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 }
}, { _id: false });

const customerSchema = new Schema<ICustomer>({
  userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  preferences: { type: preferencesSchema, default: {} },
  searchHistory: [searchHistorySchema],
  savedProperties: [{ type: Schema.Types.ObjectId, ref: 'Properties' }],
  savedListings: [{ type: Schema.Types.ObjectId, ref: 'Listings' }],
  communication: { type: communicationSchema, default: {} },
  behavior: { type: behaviorSchema, default: {} }
}, {
  timestamps: true
});

// Indexes
customerSchema.index({ userId: 1 }, { unique: true });
customerSchema.index({ 'preferences.locations': 1 });

const Customer = mongoose.model<ICustomer>('Customers', customerSchema);

export default Customer;
