# RoofRoot Backend API - 7-Collection Architecture

## Overview

RoofRoot Backend API has been refactored to a modern 7-collection architecture using Node.js, Express, TypeScript, and MongoDB with Mongoose. This architecture provides better separation of concerns, improved scalability, and enhanced security through uniform gating.

## Architecture Overview

### 7 Collections

1. **Users** - Authentication hub with role-based access control
2. **Agencies** - Business intelligence and verification management
3. **Properties** - Physical asset data with GeoJSON support
4. **Listings** - Marketing and availability management
5. **Customers** - User behavior and preferences
6. **Transactions** - Deal management and tracking
7. **Admins** - Platform administration and oversight

### Key Features

- **Uniform Gating**: Agency access requires both active user status AND verified verification
- **Role-Based Access Control**: Admin, Agency, and Customer roles with granular permissions
- **GeoJSON Support**: 2dsphere indexing for location-based queries
- **Denormalization**: Best-effort sync for performance optimization
- **Legacy Compatibility**: V1 endpoints with deprecation warnings
- **Comprehensive Validation**: Zod schemas for all inputs
- **Error Handling**: Consistent error responses with proper HTTP status codes

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Build the project
npm run build

# Run in development mode
npm run dev

# Run in production
npm start
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/roofroot
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## Database Setup

### Seed Data

```bash
# Seed the database with test data
npm run seed
```

This creates:
- 1 admin user (admin@roofroot.com / admin123)
- 1 pending agency (pending@roofroot.com / agency123) - **CANNOT LOGIN**
- 1 active agency (active@roofroot.com / agency123) - **CAN LOGIN**
- 1 customer user (customer@roofroot.com / customer123)
- Sample properties and listings

### Migration from V1

```bash
# Migrate existing V1 data to V2 architecture
npm run migrate:v2
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login with uniform gating
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/agency-application` - Agency application
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change password

### Agencies

- `GET /api/agencies` - Public agency listing (uniform gating enforced)
- `GET /api/agencies/:slug` - Public agency detail (uniform gating enforced)
- `POST /api/agencies` - Create agency (admin only)
- `PATCH /api/agencies/:id` - Update agency (owner or admin)
- `DELETE /api/agencies/:id` - Delete agency (owner or admin)
- `PATCH /api/agencies/:id/verify` - Verify agency (admin only)

### Properties

- `GET /api/properties` - Public property listing with search/filters
- `GET /api/properties/:id` - Public property detail
- `POST /api/properties` - Create property (agency only)
- `PATCH /api/properties/:id` - Update property (owner or admin)
- `DELETE /api/properties/:id` - Delete property (owner or admin)

### Listings

- `GET /api/listings` - Public listing listing with search/filters
- `GET /api/listings/:id` - Public listing detail
- `POST /api/listings` - Create listing (agency only)
- `PATCH /api/listings/:id` - Update listing (owner or admin)
- `DELETE /api/listings/:id` - Delete listing (owner or admin)
- `GET /api/listings/v1/legacy` - Legacy V1 compatibility (deprecated)

## Uniform Gating

### Agency Login Requirements

Agency users can ONLY log in if BOTH conditions are met:
1. `Users.status === 'active'`
2. `Agencies.verificationStatus === 'verified'`

### Public Agency Endpoints

All public agency endpoints (listing, search, detail) only return agencies that satisfy both uniform gating conditions.

### Admin Override

Admin users can see and manage all agencies regardless of status/verification.

## Data Models

### Users Collection

```typescript
interface IUser {
  email: string;           // unique, lowercase, trimmed
  password: string;        // hashed
  name: string;
  phoneNumber?: string;
  role: 'admin' | 'agency' | 'customer';
  status: 'active' | 'pending' | 'suspended';
  emailVerified: boolean;
  phoneVerified: boolean;
  lastActiveAt?: Date;
}
```

### Agencies Collection

```typescript
interface IAgency {
  userId: ObjectId;        // ref Users, unique
  name: string;
  slug: string;            // unique, URL-friendly
  description?: string;
  verificationStatus: 'unverified' | 'verified' | 'rejected';
  businessInfo: IBusinessInfo;
  licensing: ILicensing;
  locations: ILocations;
  expertise: IExpertise;
  performance: IPerformance;
  socialProof: ISocialProof;
}
```

### Properties Collection

```typescript
interface IProperty {
  agencyId: ObjectId;      // ref Agencies
  title: string;
  description: string;
  propertyType: string;
  status: PropertyStatus;
  physicalDetails: IPhysicalDetails;
  features: IFeatures;
  media: IMedia;
  marketInfo: IMarketInfo;
}
```

### Listings Collection

```typescript
interface IListing {
  propertyId: ObjectId;    // ref Properties
  agencyId: ObjectId;      // ref Agencies
  agentId: ObjectId;       // ref Users
  listingDetails: IListingDetails;
  marketing: IMarketing;
  status: ListingStatus;
  performance: IPerformance;
  saleOrLease: 'sale' | 'lease';
  denorm: IDenormData;     // { agencyName, propertyTitle }
}
```

## Indexes

### Performance Indexes

- **Users**: `{ email: 1 }`, `{ role: 1, status: 1 }`, `{ lastActiveAt: -1 }`
- **Agencies**: `{ userId: 1 }`, `{ slug: 1 }`, `{ verificationStatus: 1 }`
- **Properties**: `{ agencyId: 1 }`, `{ 'physicalDetails.coordinates': '2dsphere' }`
- **Listings**: `{ agencyId: 1, status: 1, createdAt: -1 }`, `{ 'marketing.featured': 1 }`

### GeoJSON Support

Properties support GeoJSON coordinates for location-based queries:

```typescript
physicalDetails: {
  coordinates: {
    type: 'Point',
    coordinates: [longitude, latitude] // [lng, lat]
  }
}
```

## Middleware

### Authentication

- `authenticateToken` - JWT verification with uniform gating
- `requireRole(['admin', 'agency'])` - Role-based access control
- `requireAgency` - Agency-specific operations
- `requireAdmin` - Admin-only operations

### Validation

- `validate(schema)` - Zod schema validation
- `validateBody(schema)` - Body-only validation
- `validateQuery(schema)` - Query-only validation

## Error Handling

### Custom Error Classes

- `AppError` - Base error class
- `ValidationError` - Input validation errors
- `AuthenticationError` - Authentication failures
- `AuthorizationError` - Permission denied
- `UniformGatingError` - Agency verification/activation required
- `NotFoundError` - Resource not found
- `ConflictError` - Duplicate or conflicting data

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": ["Detailed error messages"]
}
```

## Testing Uniform Gating

### Test Scenarios

1. **Pending Agency Login** (should fail):
   ```bash
   POST /api/auth/login
   {
     "email": "pending@roofroot.com",
     "password": "agency123"
   }
   # Response: 403 "Your agency account is not yet verified or activated"
   ```

2. **Active Agency Login** (should succeed):
   ```bash
   POST /api/auth/login
   {
     "email": "active@roofroot.com",
     "password": "agency123"
   }
   # Response: 200 with JWT token
   ```

3. **Public Agency Endpoints** (only show verified + active):
   ```bash
   GET /api/agencies
   # Only returns agencies where user.status='active' AND verificationStatus='verified'
   ```

## Development

### Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # TypeScript compilation
npm run start        # Production server
npm run clean        # Clean build artifacts
npm run seed         # Seed database with test data
npm run migrate:v2   # Migrate from V1 to V2
```

### Code Structure

```
src/
├── models/          # Mongoose models
├── controllers/     # Route handlers
├── routes/          # Express routes
├── middlewares/     # Custom middleware
├── validation/      # Zod schemas
├── utils/           # Utility functions
├── types/           # TypeScript interfaces
└── config/          # Configuration files
```

## Migration Notes

### V1 to V2 Changes

- **Users**: Split into Users + role-specific collections (Agencies, Customers, Admins)
- **Listings**: Split into Properties (physical data) + Listings (marketing/availability)
- **Authentication**: Enhanced with uniform gating and role-based permissions
- **Validation**: Replaced express-validator with Zod schemas
- **Error Handling**: Centralized error handling with custom error classes

### Legacy Compatibility

- V1 `/api/listings` endpoint still works with deprecation header
- Response format maintained for backward compatibility
- Gradual migration path for existing clients

## Security Features

- **JWT Authentication** with role-based access control
- **Password Hashing** using bcrypt with salt rounds of 12
- **Input Validation** using Zod schemas
- **Rate Limiting** with endpoint-specific configurations
- **CORS Protection** with configurable origins
- **Helmet Security** headers
- **Uniform Gating** prevents unauthorized agency access

## Performance Considerations

- **Database Indexes** on frequently queried fields
- **Denormalization** for read-heavy operations
- **Pagination** support on all list endpoints
- **GeoJSON Indexing** for location-based queries
- **Lean Queries** where possible for memory efficiency

## Contributing

1. Follow the established code structure
2. Use TypeScript interfaces for all data models
3. Implement proper error handling with custom error classes
4. Add Zod validation schemas for all inputs
5. Maintain uniform gating enforcement
6. Update tests and documentation

## License

MIT License - see LICENSE file for details. 