const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/roofroot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phoneNumber: String,
  agencyName: String,
  agencyDescription: String,
  role: {
    type: String,
    enum: ['admin', 'agency', 'customer'],
    default: 'customer'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAgencyAccount() {
  try {
    // Check if agency already exists
    const existingAgency = await User.findOne({ email: 'agency@test.com' });
    if (existingAgency) {
      console.log('Agency account already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create agency account
    const agency = new User({
      name: 'Test Agency',
      email: 'agency@test.com',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      agencyName: 'Test Real Estate Agency',
      agencyDescription: 'A test agency for development purposes',
      role: 'agency'
    });

    await agency.save();
    console.log('Agency account created successfully!');
    console.log('Email: agency@test.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error creating agency account:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAgencyAccount(); 