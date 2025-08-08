import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User role type
export type UserRole = 'admin' | 'agency' | 'customer';

// User status type
export type UserStatus = 'active' | 'pending';

// Interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  license?: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User schema
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  agencyName: {
    type: String,
    trim: true,
    maxlength: [200, 'Agency name cannot be more than 200 characters']
  },
  agencyDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Agency description cannot be more than 1000 characters']
  },
  license: {
    type: String,
    trim: true,
    maxlength: [200, 'License cannot be more than 200 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot be more than 500 characters']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'agency', 'customer'],
      message: 'Role must be either admin, agency, or customer'
    },
    default: 'customer',
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'pending'],
      message: 'Status must be either active or pending'
    },
    default: 'active',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).password;
      return ret;
    }
  }
});

// Pre-save middleware to hash password and set default status
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to set default status based on role
userSchema.pre('save', function(next) {
  // Set default status based on role if status is not explicitly set
  if (this.isNew && !this.status) {
    if (this.role === 'agency') {
      this.status = 'pending';
    } else {
      this.status = 'active';
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model<IUser>('User', userSchema);

export default User; 