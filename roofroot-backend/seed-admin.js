const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for admin seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Admin user data
const adminUser = {
  name: 'Admin User',
  email: 'admin@roofroot.com',
  password: 'Admin123!@#', // Strong password that meets all requirements
  role: 'admin',
  status: 'active',
  phoneNumber: '+1234567890',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Seed the admin user
const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Import the User model
    const User = require('./dist/models/User').default;
    
    // Check if admin already exists and delete it to recreate
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('🗑️  Deleting existing admin user...');
      await User.findByIdAndDelete(existingAdmin._id);
      console.log('✅ Existing admin user deleted');
    }
    
    // Create admin user
    const user = new User(adminUser);
    await user.save();
    
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`📊 Status: ${user.status}`);
    console.log(`🆔 ID: ${user._id}`);
    console.log('\n💡 You can now login with:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    
    console.log('\n🎉 Admin user seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin seeding error:', error);
    process.exit(1);
  }
};

// Run the seeding
seedAdmin();
