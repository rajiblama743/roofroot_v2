# RoofRoot Listing API Documentation

## Overview
The Listing API provides full CRUD operations for real estate properties with role-based access control.

## Base URL
```
http://localhost:3001/api/listings
```

## Authentication
Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Listings (Public)
**GET** `/api/listings`

Get all listings with filtering, searching, and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by type ("sale" or "lease")
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `search` (optional): Text search in title, description, and location

**Example Request:**
```bash
GET /api/listings?page=1&limit=5&type=sale&minPrice=100000&maxPrice=500000&search=apartment
```

**Response:**
```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "listings": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Modern Downtown Apartment",
      "description": "Beautiful 2-bedroom apartment in the heart of downtown...",
      "price": 250000,
      "location": "123 Main St, Downtown",
      "type": "sale",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "ABC Real Estate",
        "email": "contact@abcrealestate.com",
        "agencyName": "ABC Real Estate"
      },
      "createdAt": "2023-09-05T10:30:00.000Z",
      "updatedAt": "2023-09-05T10:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 5,
  "totalPages": 5
}
```

### 2. Get Single Listing (Public)
**GET** `/api/listings/:id`

Get a specific listing by ID.

**Example Request:**
```bash
GET /api/listings/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response:**
```json
{
  "success": true,
  "message": "Listing retrieved successfully",
  "listing": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Modern Downtown Apartment",
    "description": "Beautiful 2-bedroom apartment...",
    "price": 250000,
    "location": "123 Main St, Downtown",
    "type": "sale",
    "images": ["https://example.com/image1.jpg"],
    "createdBy": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "ABC Real Estate",
      "email": "contact@abcrealestate.com",
      "agencyName": "ABC Real Estate"
    },
    "createdAt": "2023-09-05T10:30:00.000Z",
    "updatedAt": "2023-09-05T10:30:00.000Z"
  }
}
```

### 3. Create Listing (Agency Only)
**POST** `/api/listings`

Create a new listing. Only authenticated users with "agency" role can create listings.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Modern Downtown Apartment",
  "description": "Beautiful 2-bedroom apartment in the heart of downtown with stunning city views. Features include hardwood floors, granite countertops, and in-unit laundry.",
  "price": 250000,
  "location": "123 Main St, Downtown, City, State 12345",
  "type": "sale",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Validation Rules:**
- `title`: 5-200 characters
- `description`: 20-2000 characters
- `price`: Positive number
- `location`: 5-500 characters
- `type`: Must be "sale" or "lease"
- `images`: Optional array of URLs (max 10)

**Response:**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "listing": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Modern Downtown Apartment",
    "description": "Beautiful 2-bedroom apartment...",
    "price": 250000,
    "location": "123 Main St, Downtown, City, State 12345",
    "type": "sale",
    "images": ["https://example.com/image1.jpg"],
    "createdBy": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "ABC Real Estate",
      "email": "contact@abcrealestate.com",
      "agencyName": "ABC Real Estate"
    },
    "createdAt": "2023-09-05T10:30:00.000Z",
    "updatedAt": "2023-09-05T10:30:00.000Z"
  }
}
```

### 4. Update Listing (Creator Only)
**PUT** `/api/listings/:id`

Update an existing listing. Only the agency that created the listing can update it.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Modern Downtown Apartment",
  "price": 275000,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing updated successfully",
  "listing": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Updated Modern Downtown Apartment",
    "description": "Beautiful 2-bedroom apartment...",
    "price": 275000,
    "location": "123 Main St, Downtown, City, State 12345",
    "type": "sale",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg"
    ],
    "createdBy": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "ABC Real Estate",
      "email": "contact@abcrealestate.com",
      "agencyName": "ABC Real Estate"
    },
    "createdAt": "2023-09-05T10:30:00.000Z",
    "updatedAt": "2023-09-05T11:45:00.000Z"
  }
}
```

### 5. Delete Listing (Creator or Admin)
**DELETE** `/api/listings/:id`

Delete a listing. Only the agency that created the listing or an admin can delete it.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

### 6. Get My Listings (Agency Only)
**GET** `/api/listings/my/listings`

Get all listings created by the authenticated agency.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Your listings retrieved successfully",
  "listings": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Modern Downtown Apartment",
      "description": "Beautiful 2-bedroom apartment...",
      "price": 250000,
      "location": "123 Main St, Downtown",
      "type": "sale",
      "images": ["https://example.com/image1.jpg"],
      "createdBy": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "ABC Real Estate",
        "email": "contact@abcrealestate.com",
        "agencyName": "ABC Real Estate"
      },
      "createdAt": "2023-09-05T10:30:00.000Z",
      "updatedAt": "2023-09-05T10:30:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title must be between 5 and 200 characters",
    "Price must be a positive number"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Only agencies can perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Listing not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error while creating listing"
}
```

## Access Control Summary

| Endpoint | Method | Authentication | Role Required | Description |
|----------|--------|----------------|---------------|-------------|
| `/listings` | GET | ❌ | None | Get all listings (public) |
| `/listings/:id` | GET | ❌ | None | Get single listing (public) |
| `/listings` | POST | ✅ | Agency | Create listing |
| `/listings/:id` | PUT | ✅ | Creator | Update listing |
| `/listings/:id` | DELETE | ✅ | Creator or Admin | Delete listing |
| `/listings/my/listings` | GET | ✅ | Agency | Get agency's listings |

## Testing Examples

### Create a Test Listing
```bash
curl -X POST http://localhost:3001/api/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Property",
    "description": "This is a test property for demonstration purposes.",
    "price": 150000,
    "location": "123 Test St, Test City",
    "type": "sale",
    "images": ["https://example.com/test-image.jpg"]
  }'
```

### Get All Listings with Filters
```bash
curl "http://localhost:3001/api/listings?type=sale&minPrice=100000&maxPrice=300000&page=1&limit=5"
```

### Update a Listing
```bash
curl -X PUT http://localhost:3001/api/listings/LISTING_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 175000,
    "title": "Updated Test Property"
  }'
``` 