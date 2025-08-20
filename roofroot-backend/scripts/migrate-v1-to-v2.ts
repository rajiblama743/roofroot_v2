import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/Users';
import Agency from '../src/models/Agencies';
import Property from '../src/models/Properties';
import Listing from '../src/models/Listings';
import Customer from '../src/models/Customers';
import Admin from '../src/models/Admins';
import { generateSlug, generateUniqueSlug } from '../src/utils/slugify';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roofroot';

interface V1User {
  _id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  license?: string;
  address?: string;
  role: 'admin' | 'agency' | 'customer';
  status: 'active' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

interface V1Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'sale' | 'lease';
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  carBay?: number;
  area?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

async function migrateV1ToV2() {
  try {
    console.log('🚀 Starting V1 to V2 migration...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get old collections
    const oldUsers = mongoose.connection.collection('users');
    const oldListings = mongoose.connection.collection('listings');

    console.log('📊 Reading old data...');
    
    // Read old users
    const v1Users: V1User[] = await oldUsers.find({}).toArray();
    console.log(`📋 Found ${v1Users.length} old users`);

    // Read old listings
    const v1Listings: V1Listing[] = await oldListings.find({}).toArray();
    console.log(`🏠 Found ${v1Listings.length} old listings`);

    let userMigrationCount = 0;
    let agencyMigrationCount = 0;
    let customerMigrationCount = 0;
    let adminMigrationCount = 0;
    let propertyMigrationCount = 0;
    let listingMigrationCount = 0;
    let errors: string[] = [];

    console.log('\n👥 Migrating users...');

    // Migrate users
    for (const v1User of v1Users) {
      try {
        // Create new user
        const newUser = new User({
          email: v1User.email,
          password: v1User.password,
          name: v1User.name,
          phoneNumber: v1User.phoneNumber,
          role: v1User.role,
          status: v1User.role === 'agency' ? 'pending' : 'active',
          emailVerified: false,
          phoneVerified: false
        });

        await newUser.save();
        userMigrationCount++;

        // Create role-specific profiles
        if (v1User.role === 'agency') {
          try {
            // Generate unique slug
            const baseSlug = generateSlug(v1User.agencyName || v1User.name);
            const existingSlugs = await Agency.distinct('slug');
            const slug = generateUniqueSlug(baseSlug, existingSlugs);

            const agency = new Agency({
              userId: newUser._id,
              name: v1User.agencyName || v1User.name,
              slug,
              description: v1User.agencyDescription,
              businessInfo: {
                licenseNumber: v1User.license
              },
              locations: {
                headquarters: v1User.address
              },
              verificationStatus: 'unverified'
            });

            await agency.save();
            agencyMigrationCount++;
          } catch (agencyError) {
            errors.push(`Failed to create agency for user ${v1User.email}: ${agencyError}`);
          }
        } else if (v1User.role === 'customer') {
          try {
            const customer = new Customer({
              userId: newUser._id
            });
            await customer.save();
            customerMigrationCount++;
          } catch (customerError) {
            errors.push(`Failed to create customer for user ${v1User.email}: ${customerError}`);
          }
        } else if (v1User.role === 'admin') {
          try {
            const admin = new Admin({
              userId: newUser._id,
              role: 'admin'
            });
            await admin.save();
            adminMigrationCount++;
          } catch (adminError) {
            errors.push(`Failed to create admin for user ${v1User.email}: ${adminError}`);
          }
        }

        console.log(`✅ Migrated user: ${v1User.email} (${v1User.role})`);
      } catch (userError) {
        errors.push(`Failed to migrate user ${v1User.email}: ${userError}`);
      }
    }

    console.log('\n🏠 Migrating listings...');

    // Migrate listings
    for (const v1Listing of v1Listings) {
      try {
        // Find the user who created this listing
        const creator = await User.findById(v1Listing.createdBy);
        if (!creator) {
          errors.push(`Creator not found for listing ${v1Listing._id}`);
          continue;
        }

        // Find the agency for this user
        let agencyId;
        if (creator.role === 'agency') {
          const agency = await Agency.findOne({ userId: creator._id });
          if (!agency) {
            errors.push(`Agency not found for user ${creator._id}`);
            continue;
          }
          agencyId = agency._id;
        } else {
          // For non-agency users, we need to create a placeholder or skip
          errors.push(`Cannot migrate listing ${v1Listing._id} - creator is not an agency`);
          continue;
        }

        // Create property
        const property = new Property({
          agencyId,
          title: v1Listing.title,
          description: v1Listing.description,
          propertyType: 'residential', // Default, could be enhanced
          status: 'available',
          physicalDetails: {
            address: v1Listing.location
          },
          features: {
            bedrooms: v1Listing.bedrooms,
            bathrooms: v1Listing.bathrooms,
            parking: v1Listing.carBay ? `${v1Listing.carBay} spaces` : undefined,
            buildingSize: v1Listing.area
          },
          media: {
            photos: v1Listing.images
          },
          marketInfo: {
            marketValue: v1Listing.price
          }
        });

        await property.save();
        propertyMigrationCount++;

        // Create listing
        const listing = new Listing({
          propertyId: property._id,
          agencyId,
          agentId: creator._id,
          listingDetails: {
            title: v1Listing.title,
            description: v1Listing.description
          },
          marketing: {
            featured: false
          },
          status: 'active',
          performance: {
            views: 0,
            inquiries: 0,
            showings: 0,
            offers: 0
          },
          saleOrLease: v1Listing.type,
          denorm: {
            agencyName: creator.name,
            propertyTitle: v1Listing.title
          }
        });

        await listing.save();
        listingMigrationCount++;

        console.log(`✅ Migrated listing: ${v1Listing.title}`);
      } catch (listingError) {
        errors.push(`Failed to migrate listing ${v1Listing._id}: ${listingError}`);
      }
    }

    // Print migration summary
    console.log('\n📊 Migration Summary:');
    console.log('=====================');
    console.log(`Users migrated: ${userMigrationCount}`);
    console.log(`Agencies created: ${agencyMigrationCount}`);
    console.log(`Customers created: ${customerMigrationCount}`);
    console.log(`Admins created: ${adminMigrationCount}`);
    console.log(`Properties created: ${propertyMigrationCount}`);
    console.log(`Listings created: ${listingMigrationCount}`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${errors.length}`);
      console.log('Error details:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n🎉 Migration completed successfully with no errors!');
    }

    console.log('\n⚠️  Important notes:');
    console.log('- Agency users start with status "pending" and need admin verification');
    console.log('- All agencies start with verificationStatus "unverified"');
    console.log('- Legacy listings are now split into Properties and Listings');
    console.log('- Denormalized data has been populated for backward compatibility');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateV1ToV2();
}

export default migrateV1ToV2;
