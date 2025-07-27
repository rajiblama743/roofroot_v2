import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      console.log('📊 Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        RENDER_PORT: process.env.RENDER_PORT,
        MONGO_URI: mongoURI ? '***SET***' : '***NOT SET***'
      });
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit in development, but exit in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Continuing without database in development mode');
    }
  }
};

export default connectDB; 