# RoofRoot User Management API Documentation

This document describes the secure User Management API endpoints for the RoofRoot backend with authentication and role-based access control.

## Base URLs
```
Authentication: http://localhost:3001/api/auth
User Management: http://localhost:3001/api/users
```

## Authentication Endpoints

### 1. User Registration
**POST** `/api/auth/register`

Registers a new customer user (public endpoint).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "agencyName": "Doe Real Estate",
  "agencyDescription": "Professional real estate services"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "agencyName": "Doe Real Estate",
    "agencyDescription": "Professional real estate services",
    "role": "customer",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

**Notes:**
- Only creates users with role "customer"
- Role field is ignored if provided in registration
- Returns JWT token for immediate authentication

### 2. User Login
**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "agencyName": "Doe Real Estate",
    "agencyDescription": "Professional real estate services",
    "role": "customer",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

## User Management Endpoints

**Authentication Required:** All user management endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### 3. Create User (Admin Only)
**POST** `/api/users`

Creates a new user with any role (admin only).

**Request Body:**
```json
{
  "name": "Jane Admin",
  "email": "jane@example.com",
  "password": "password123",
  "role": "admin",
  "phoneNumber": "+1234567890",
  "agencyName": "Admin Agency",
  "agencyDescription": "Administrative services"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Jane Admin",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890",
    "agencyName": "Admin Agency",
    "agencyDescription": "Administrative services",
    "role": "admin",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### 4. Get All Users (Admin Only)
**GET** `/api/users`

Retrieves all users (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "users": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "agencyName": "Doe Real Estate",
      "role": "customer",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    },
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Jane Admin",
      "email": "jane@example.com",
      "phoneNumber": "+1234567890",
      "agencyName": "Admin Agency",
      "role": "admin",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

### 5. Get User by ID
**GET** `/api/users/:id`

Retrieves a specific user by ID (own profile or admin).

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "agencyName": "Doe Real Estate",
    "agencyDescription": "Professional real estate services",
    "role": "customer",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### 6. Update User
**PUT** `/api/users/:id`

Updates a specific user (own profile or admin).

**Request Body:**
```json
{
  "name": "John Smith",
  "phoneNumber": "+1987654321",
  "role": "agency"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Smith",
    "email": "john@example.com",
    "phoneNumber": "+1987654321",
    "agencyName": "Doe Real Estate",
    "agencyDescription": "Professional real estate services",
    "role": "agency",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T11:00:00.000Z"
  }
}
```

### 7. Delete User (Admin Only)
**DELETE** `/api/users/:id`

Deletes a specific user (admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## User Roles

The system supports three user roles:

1. **customer**: Default role for registered users
2. **agency**: Real estate agency users
3. **admin**: Administrative users with full access

## Access Control Rules

### Registration (`/api/auth/register`)
- **Public endpoint** (no authentication required)
- Only creates users with role "customer"
- Ignores role field if provided

### Login (`/api/auth/login`)
- **Public endpoint** (no authentication required)
- Returns JWT token for authentication

### User Management Endpoints
- **Authentication required** for all endpoints
- **Admin-only endpoints**: POST `/api/users`, GET `/api/users`, DELETE `/api/users/:id`
- **Ownership-based endpoints**: GET `/api/users/:id`, PUT `/api/users/:id`
  - Users can access/modify their own profile
  - Admins can access/modify any user's profile
  - Customers cannot change their role

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

### Common Error Codes
- **400**: Validation error or bad request
- **401**: Authentication required or invalid token
- **403**: Access denied (insufficient permissions)
- **404**: User not found
- **500**: Internal server error

## Validation Rules

- **name**: Required, 2-100 characters
- **email**: Required, unique, valid email format
- **password**: Required, min 6 characters (hashed with bcrypt)
- **role**: Required for admin creation, enum: ['admin', 'agency', 'customer']
- **phoneNumber**: Optional, valid international phone format
- **agencyName**: Optional, max 200 characters
- **agencyDescription**: Optional, max 1000 characters

## Security Features

- **Password Hashing**: All passwords are hashed with bcrypt before storage
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions based on user roles
- **Input Validation**: Comprehensive validation for all inputs
- **Password Exclusion**: Passwords are never returned in API responses
- **Ownership Checks**: Users can only access their own resources (unless admin)

## Environment Variables

Required environment variables:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/roofroot
PORT=3001
NODE_ENV=development
```

## Notes

- All timestamps are in ISO format
- Email addresses are automatically converted to lowercase
- Phone numbers are validated for international format
- JWT tokens expire after 24 hours
- Passwords are automatically excluded from all responses
- Role changes are restricted based on user permissions 