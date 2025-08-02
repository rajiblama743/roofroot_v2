import mongoose, { Document, Schema } from 'mongoose';

// Listing type enum
export type ListingType = 'sale' | 'lease';

// Interface for Listing document
export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  location: string;
  type: ListingType;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  carBay?: number;
  area?: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Listing schema
const listingSchema = new Schema<IListing>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [500, 'Location cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['sale', 'lease'],
      message: 'Type must be either sale or lease'
    },
    required: [true, 'Type is required']
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(images: string[]) {
        return images.length <= 10; // Maximum 10 images
      },
      message: 'Cannot have more than 10 images'
    }
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative']
  },
  carBay: {
    type: Number,
    min: [0, 'CarBay cannot be negative']
  },
  area: {
    type: Number,
    min: [0, 'Area cannot be negative']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'CreatedBy is required']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for better query performance
listingSchema.index({ createdBy: 1, createdAt: -1 });
listingSchema.index({ type: 1, price: 1 });
listingSchema.index({ location: 'text', title: 'text', description: 'text' });

// Create and export the Listing model
const Listing = mongoose.model<IListing>('Listing', listingSchema);

export default Listing; 