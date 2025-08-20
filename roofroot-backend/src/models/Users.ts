import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole, UserStatus } from '../types/user';

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false },
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, trim: true },
  role: { 
    type: String, 
    enum: ['admin', 'super_admin', 'agency', 'customer'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'pending', 'suspended'], 
    default: 'pending' 
  },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  lastActiveAt: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ lastActiveAt: 1 });

// Pre-save hook to hash password and set default status
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save hook to set default status based on role
userSchema.pre('save', function(next) {
  if (this.isNew) {
    if (this.role === 'customer') {
      this.status = 'active';
    } else if (this.role === 'agency') {
      this.status = 'pending';
    } else if (this.role === 'admin' || this.role === 'super_admin') {
      this.status = 'active';
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const User = mongoose.model<IUser>('Users', userSchema);

export default User;
