const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB Atlas connection...');
    console.log('Connection string:', process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas connection successful!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your username and password in MongoDB Atlas');
    console.log('2. Verify Network Access allows your IP (0.0.0.0/0 for all)');
    console.log('3. Make sure the user has "Read and write to any database" permissions');
    console.log('4. Try creating a new database user with a simple password');
  }
}

testConnection(); 