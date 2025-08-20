import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/Users';
import Agency from '../src/models/Agencies';
import Property from '../src/models/Properties';
import Listing from '../src/models/Listings';
import Customer from '../src/models/Customers';
import Admin from '../src/models/Admins';
import { generateSlug } from '../src/utils/slugify';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roofroot';

async function seedV2() {
  try {
    console.log('🌱 Starting V2 seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Agency.deleteMany({});
    await Property.deleteMany({});
    await Listing.deleteMany({});
    await Customer.deleteMany({});
    await Admin.deleteMany({});

    console.log('👥 Creating users and profiles...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      email: 'admin@roofroot.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      phoneVerified: true
    });
    await adminUser.save();

    const admin = new Admin({
      userId: adminUser._id,
      role: 'super_admin'
    });
    await admin.save();

    console.log('✅ Created admin user');

    // Create pending agency (cannot login until verified + active)
    const pendingAgencyPassword = await bcrypt.hash('agency123', 12);
    const pendingAgencyUser = new User({
      email: 'pending@roofroot.com',
      password: pendingAgencyPassword,
      name: 'Pending Agency',
      role: 'agency',
      status: 'pending',
      emailVerified: false,
      phoneVerified: false
    });
    await pendingAgencyUser.save();

    const pendingAgency = new Agency({
      userId: pendingAgencyUser._id,
      name: 'Pending Real Estate Agency',
      slug: generateSlug('Pending Real Estate Agency'),
      description: 'A real estate agency waiting for verification',
      tagline: 'Your trusted partner in real estate',
      businessInfo: {
        legalName: 'Pending Real Estate Agency LLC',
        businessType: 'Real Estate',
        yearEstablished: 2023
      },
      licensing: {
        licenseNumber: 'RE123456',
        insurance: 'Active',
        complianceStatus: 'Pending'
      },
      locations: {
        headquarters: '123 Main St, City, State',
        serviceAreas: ['Downtown', 'Suburbs', 'Rural']
      },
      expertise: {
        propertyTypes: ['Residential', 'Commercial'],
        priceRanges: ['$100k-$500k', '$500k-$1M', '$1M+'],
        neighborhoods: ['Downtown', 'Suburbs', 'Rural']
      },
      verificationStatus: 'unverified'
    });
    await pendingAgency.save();

    console.log('✅ Created pending agency (cannot login)');

    // Create verified and active agency (can login)
    const activeAgencyPassword = await bcrypt.hash('agency123', 12);
    const activeAgencyUser = new User({
      email: 'active@roofroot.com',
      password: activeAgencyPassword,
      name: 'Active Agency',
      role: 'agency',
      status: 'active',
      emailVerified: true,
      phoneVerified: true
    });
    await activeAgencyUser.save();

    const activeAgency = new Agency({
      userId: activeAgencyUser._id,
      name: 'Active Real Estate Agency',
      slug: generateSlug('Active Real Estate Agency'),
      description: 'A fully verified and active real estate agency',
      tagline: 'Excellence in real estate services',
      businessInfo: {
        legalName: 'Active Real Estate Agency LLC',
        businessType: 'Real Estate',
        yearEstablished: 2020
      },
      licensing: {
        licenseNumber: 'RE789012',
        insurance: 'Active',
        complianceStatus: 'Compliant'
      },
      locations: {
        headquarters: '456 Oak Ave, City, State',
        serviceAreas: ['Downtown', 'Suburbs', 'Rural', 'Beachfront']
      },
      expertise: {
        propertyTypes: ['Residential', 'Commercial', 'Luxury'],
        priceRanges: ['$100k-$500k', '$500k-$1M', '$1M+', '$5M+'],
        neighborhoods: ['Downtown', 'Suburbs', 'Rural', 'Beachfront', 'Mountains']
      },
      performance: {
        totalTransactions: 150,
        satisfactionScore: 4.8,
        responseTime: 2.5
      },
      socialProof: {
        reviews: 89,
        ratings: 4.8,
        awards: ['Best Agency 2023', 'Customer Choice 2022'],
        testimonials: 45
      },
      verificationStatus: 'verified',
      approvalDate: new Date(),
      approvedBy: adminUser._id
    });
    await activeAgency.save();

    console.log('✅ Created active agency (can login)');

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customerUser = new User({
      email: 'customer@roofroot.com',
      password: customerPassword,
      name: 'John Customer',
      role: 'customer',
      status: 'active',
      emailVerified: true,
      phoneVerified: false
    });
    await customerUser.save();

    const customer = new Customer({
      userId: customerUser._id,
      preferences: {
        propertyTypes: ['Residential', 'Single Family'],
        priceRanges: ['$200k-$500k'],
        locations: ['Suburbs', 'Downtown'],
        notifications: true
      },
      communication: {
        method: 'email',
        frequency: 'normal',
        marketingConsent: true
      }
    });
    await customer.save();

    console.log('✅ Created customer user');

    // Create properties for the active agency
    console.log('🏠 Creating properties...');

    const property1 = new Property({
      agencyId: activeAgency._id,
      title: 'Beautiful Family Home',
      description: 'A spacious 4-bedroom family home with modern amenities and a large backyard.',
      propertyType: 'residential',
      status: 'available',
      physicalDetails: {
        address: '789 Pine St, Suburbs, State',
        coordinates: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610] // Example coordinates
        },
        lotSize: 8000,
        buildingSize: 2500
      },
      features: {
        amenities: ['Pool', 'Garden', 'Garage', 'Fireplace'],
        utilities: ['Electric', 'Gas', 'Water', 'Internet'],
        parking: '2-car garage',
        yearBuilt: 2018
      },
      media: {
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg'
        ]
      },
      marketInfo: {
        marketValue: 450000,
        pricePerSqm: 180
      }
    });
    await property1.save();

    const property2 = new Property({
      agencyId: activeAgency._id,
      title: 'Downtown Luxury Condo',
      description: 'Modern luxury condo in the heart of downtown with city views.',
      propertyType: 'residential',
      status: 'available',
      physicalDetails: {
        address: '123 Downtown Blvd, City, State',
        coordinates: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610] // Example coordinates
        },
        lotSize: 1200,
        buildingSize: 1800
      },
      features: {
        amenities: ['Gym', 'Pool', 'Concierge', 'Parking'],
        utilities: ['Electric', 'Water', 'Internet', 'Cable'],
        parking: '1 assigned space',
        yearBuilt: 2020
      },
      media: {
        photos: [
          'https://example.com/condo1.jpg',
          'https://example.com/condo2.jpg'
        ]
      },
      marketInfo: {
        marketValue: 650000,
        pricePerSqm: 361
      }
    });
    await property2.save();

    console.log('✅ Created 2 properties');

    // Create listings for the properties
    console.log('📋 Creating listings...');

    const listing1 = new Listing({
      propertyId: property1._id,
      agencyId: activeAgency._id,
      agentId: activeAgencyUser._id,
      listingDetails: {
        title: 'Beautiful Family Home for Sale',
        description: 'A spacious 4-bedroom family home with modern amenities and a large backyard.',
        highlights: ['4 Bedrooms', '3 Bathrooms', 'Large Backyard', 'Modern Kitchen'],
        showingInstructions: 'Call to schedule a viewing'
      },
      marketing: {
        featured: true,
        promotionLevel: 'premium',
        seoKeywords: ['family home', '4 bedroom', 'suburbs', 'modern']
      },
      status: 'active',
      performance: {
        views: 45,
        inquiries: 8,
        showings: 3,
        offers: 0
      },
      saleOrLease: 'sale',
      denorm: {
        agencyName: activeAgency.name,
        propertyTitle: property1.title
      },
      publishedAt: new Date()
    });
    await listing1.save();

    const listing2 = new Listing({
      propertyId: property2._id,
      agencyId: activeAgency._id,
      agentId: activeAgencyUser._id,
      listingDetails: {
        title: 'Downtown Luxury Condo for Sale',
        description: 'Modern luxury condo in the heart of downtown with city views.',
        highlights: ['Luxury', 'City Views', 'Modern Amenities', 'Downtown Location'],
        showingInstructions: 'Contact agent for private viewing'
      },
      marketing: {
        featured: false,
        promotionLevel: 'boosted',
        seoKeywords: ['luxury condo', 'downtown', 'city views', 'modern']
      },
      status: 'active',
      performance: {
        views: 32,
        inquiries: 5,
        showings: 2,
        offers: 0
      },
      saleOrLease: 'sale',
      denorm: {
        agencyName: activeAgency.name,
        propertyTitle: property2.title
      },
      publishedAt: new Date()
    });
    await listing2.save();

    console.log('✅ Created 2 listings');

    // Print seed summary
    console.log('\n📊 Seed Summary:');
    console.log('=================');
    console.log('👤 Users:');
    console.log(`  - Admin: admin@roofroot.com (admin123)`);
    console.log(`  - Pending Agency: pending@roofroot.com (agency123) - CANNOT LOGIN`);
    console.log(`  - Active Agency: active@roofroot.com (agency123) - CAN LOGIN`);
    console.log(`  - Customer: customer@roofroot.com (customer123)`);
    console.log('\n🏢 Agencies:');
    console.log(`  - Pending Agency: status=pending, verificationStatus=unverified`);
    console.log(`  - Active Agency: status=active, verificationStatus=verified`);
    console.log('\n🏠 Properties: 2 created');
    console.log('📋 Listings: 2 created');
    console.log('\n🔐 Test the uniform gating:');
    console.log('1. Try logging in with pending@roofroot.com - should fail with uniform gating error');
    console.log('2. Try logging in with active@roofroot.com - should succeed');
    console.log('3. Public agency endpoints will only show the active, verified agency');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run seed if called directly
if (require.main === module) {
  seedV2();
}

export default seedV2;
