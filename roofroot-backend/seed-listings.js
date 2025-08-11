const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample listings data
const sampleListings = [
  {
    title: 'Beautiful 3-Bedroom House in Downtown',
    description: 'This stunning 3-bedroom house features modern amenities, spacious rooms, and a beautiful garden. Perfect for families looking for comfort and style in the heart of the city.',
    price: 450000,
    type: 'sale',
    location: 'Downtown, City Center',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
    ],
    bedrooms: 3,
    bathrooms: 2,
    carBay: 2,
    area: 1800,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Modern 2-Bedroom Apartment for Rent',
    description: 'Contemporary 2-bedroom apartment with high-end finishes, balcony views, and access to building amenities. Available for immediate occupancy.',
    price: 2500,
    type: 'lease',
    location: 'Uptown District',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    bedrooms: 2,
    bathrooms: 1,
    carBay: 1,
    area: 1200,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Luxury 4-Bedroom Villa with Pool',
    description: 'Exclusive 4-bedroom villa featuring luxury finishes, private pool, and stunning mountain views. This is a once-in-a-lifetime opportunity.',
    price: 1200000,
    type: 'sale',
    location: 'Hillside Estates',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    ],
    bedrooms: 4,
    bathrooms: 3,
    carBay: 3,
    area: 2800,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Cozy 1-Bedroom Studio for Students',
    description: 'Perfect 1-bedroom studio apartment ideal for students or young professionals. Close to university and public transportation.',
    price: 1200,
    type: 'lease',
    location: 'University District',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    bedrooms: 1,
    bathrooms: 1,
    carBay: 0,
    area: 600,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Family Home with Large Backyard',
    description: 'Spacious family home with 5 bedrooms, large backyard perfect for children, and excellent school district. A dream home for growing families.',
    price: 750000,
    type: 'sale',
    location: 'Suburban Family Area',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    ],
    bedrooms: 5,
    bathrooms: 3,
    carBay: 2,
    area: 2200,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Seed the database
const seedListings = async () => {
  try {
    await connectDB();
    
    // Import the Listing model
    const Listing = require('./dist/models/Listing').default;
    
    // Clear existing listings (optional - comment out if you want to keep existing)
    // await Listing.deleteMany({});
    // console.log('🗑️  Cleared existing listings');
    
    // Check if listings already exist
    const existingCount = await Listing.countDocuments();
    if (existingCount > 0) {
      console.log(`📊 Database already has ${existingCount} listings`);
      console.log('💡 If you want to add more, uncomment the deleteMany line above');
      process.exit(0);
    }
    
    // Insert sample listings
    const result = await Listing.insertMany(sampleListings);
    console.log(`✅ Successfully seeded ${result.length} listings`);
    
    // Display the created listings
    console.log('\n📋 Created listings:');
    result.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - $${listing.price.toLocaleString()} (${listing.type})`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seeding
seedListings();
