const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.log('❌ MONGO_URI not found in environment variables');
      console.log('📋 Please set MONGO_URI in your .env file or environment');
      return;
    }
    
    console.log('🔌 Testing MongoDB connection...');
    console.log('📊 Connection string (masked):', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Make sure your connection string is correct and IP is whitelisted');
  }
}

testConnection(); 