import mongoose, { Schema, Document } from 'mongoose';
import { IProperty, PropertyStatus } from '../types/property';

const coordinatesSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true } // [longitude, latitude]
}, { _id: false });

const physicalDetailsSchema = new Schema({
  address: { type: String, required: true },
  coordinates: coordinatesSchema,
  lotSize: Number,
  buildingSize: Number
}, { _id: false });

const featuresSchema = new Schema({
  amenities: [String],
  utilities: [String],
  parking: String,
  yearBuilt: Number
}, { _id: false });

const mediaSchema = new Schema({
  photos: [String],
  virtualTours: [String],
  videos: [String],
  floorPlans: [String]
}, { _id: false });

const marketInfoSchema = new Schema({
  marketValue: Number,
  pricePerSqm: Number,
  comparables: [String]
}, { _id: false });

const propertySchema = new Schema<IProperty>({
  agencyId: { type: Schema.Types.ObjectId, ref: 'Agencies', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  propertyType: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['available', 'sold', 'rented', 'under_contract', 'off_market'], 
    default: 'available' 
  },
  physicalDetails: { type: physicalDetailsSchema, required: true },
  features: { type: featuresSchema, default: {} },
  media: { type: mediaSchema, default: {} },
  marketInfo: { type: marketInfoSchema, default: {} }
}, {
  timestamps: true
});

// Indexes
propertySchema.index({ agencyId: 1 });
propertySchema.index({ status: 1, propertyType: 1 });
propertySchema.index({ 'physicalDetails.coordinates': '2dsphere' });
propertySchema.index({ 'marketInfo.marketValue': 1 });

const Property = mongoose.model<IProperty>('Properties', propertySchema);

export default Property;
