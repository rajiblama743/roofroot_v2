# User API Documentation

This document describes the User API endpoints for the RoofRoot backend.

## Base URL
```
http://localhost:3001/api/users
```

## Endpoints

### 1. Create User
**POST** `/api/users`

Creates a new user.

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
  "message": "User created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "agencyName": "Doe Real Estate",
    "agencyDescription": "Professional real estate services",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### 2. Get All Users
**GET** `/api/users`

Retrieves all users.

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "count": 2,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "agencyName": "Doe Real Estate",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

### 3. Get User by ID
**GET** `/api/users/:id`

Retrieves a specific user by ID.

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "agencyName": "Doe Real Estate",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### 4. Update User
**PUT** `/api/users/:id`

Updates a specific user by ID.

**Request Body:**
```json
{
  "name": "John Smith",
  "phoneNumber": "+1987654321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Smith",
    "email": "john@example.com",
    "phoneNumber": "+1987654321",
    "agencyName": "Doe Real Estate",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T11:00:00.000Z"
  }
}
```

### 5. Delete User
**DELETE** `/api/users/:id`

Deletes a specific user by ID.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "agencyName": "Doe Real Estate",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Validation Rules

- **name**: Required, max 100 characters
- **email**: Required, unique, valid email format
- **password**: Required, min 6 characters
- **phoneNumber**: Optional, valid phone number format
- **agencyName**: Optional, max 200 characters
- **agencyDescription**: Optional, max 1000 characters

## Notes

- Passwords are automatically excluded from responses for security
- All timestamps are in ISO format
- Email addresses are automatically converted to lowercase
- Phone numbers are validated for international format 