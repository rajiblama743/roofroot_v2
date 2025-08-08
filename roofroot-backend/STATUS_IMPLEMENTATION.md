# RoofRoot User Status Implementation

This document outlines the implementation of user status handling and admin workflows for the RoofRoot project.

## Overview

The implementation adds a `status` field to the User model with two possible values:
- `'active'` - User can login and access the system
- `'pending'` - User cannot login until approved by admin

## Backend Changes

### 1. User Model Updates (`src/models/User.ts`)

- Added `UserStatus` type: `'active' | 'pending'`
- Added `status` field to User schema with default logic:
  - Customers: `'active'` by default
  - Agencies: `'pending'` by default
- Added pre-save middleware to set default status based on role

### 2. Authentication Updates (`src/controllers/authController.ts`)

- **Login Guard**: Added status check in login endpoint
  - Agencies with `status='pending'` receive 403 error with message "Your account is pending approval."
  - Customers with `status='active'` can login normally
- **Agency Request Endpoint**: New `/auth/request-agency` endpoint
  - Creates agency users with `status='pending'`
  - Returns success message indicating approval is required

### 3. Admin Status Management (`src/controllers/userController.ts`)

- **Status Update Endpoint**: `PATCH /admin/users/:id/status`
  - Admin-only endpoint to change user status
  - Prevents changing status for admin accounts
  - Validates status values: `'active' | 'pending'`
- **Agency Search Updates**: Enhanced `/users/search/agencies` endpoint
  - Added `status` query parameter (defaults to `'active'`)
  - Filters agencies by status

### 4. TypeScript Types (`src/types/user.d.ts`)

- Added `UserStatus` type
- Updated interfaces to include status field
- Added `UpdateUserStatusRequest` interface

## Frontend Changes

### Web Frontend (`roofroot-web`)

#### Login Page (`src/app/login/page.tsx`)
- Added specific handling for 403 "pending approval" errors
- Shows clear message: "Your account is pending approval. Please contact an administrator."

#### Find Agency Page (`src/app/find-agency/page.tsx`)
- Updated to only display agencies with `status='active'`
- Added status filter to API calls

#### API Client (`src/lib/api.ts`)
- Updated `Agency` interface to include `status` field
- Added `status` parameter to `AgencySearchFilters`

### Admin Frontend (`roofroot-admin`)

#### New Requests Page (`src/app/requests/page.tsx`)
- Shows list of agencies with `status='pending'`
- Provides approve button to set status to `'active'`
- Search functionality for pending agencies
- Status badges and action buttons

#### Updated Agencies Page (`src/app/agencies/page.tsx`)
- Added status management with toggle buttons
- Fixed table layout with proper column widths
- Added horizontal scroll for mobile responsiveness
- Removed edit buttons, kept view functionality

#### New Agency Detail Page (`src/app/agencies/[id]/page.tsx`)
- Shows comprehensive agency information
- Status toggle functionality
- Responsive design with proper layout

#### Admin Layout (`src/components/AdminLayout.tsx`)
- Added "Requests" navigation item with Clock icon
- Links to `/requests` page

#### Table Component (`src/components/Table.tsx`)
- Enhanced with column classes for better mobile support
- Added `overflow-x-auto` for horizontal scrolling
- Improved padding and text sizing

#### API Service (`src/services/api.ts`)
- Added `updateUserStatus` function
- Added `getUser` function for detail pages

## API Endpoints

### New Endpoints
- `POST /api/auth/request-agency` - Submit agency application
- `PATCH /api/admin/users/:id/status` - Update user status (admin only)

### Updated Endpoints
- `POST /api/auth/login` - Now checks user status
- `GET /api/users/search/agencies` - Added status filter parameter

## Database Migration

The User model now includes a `status` field. Existing users will need to be updated:

```javascript
// Migration script (run once)
db.users.updateMany(
  { status: { $exists: false } },
  { 
    $set: { 
      status: 'active' 
    } 
  }
);
```

## Testing

A test script is provided (`test-status-implementation.js`) that verifies:

1. Customer registration creates active users
2. Agency requests create pending users
3. Pending agencies cannot login
4. Active agencies can login
5. Status filtering works correctly

Run the test:
```bash
cd roofroot-backend
node test-status-implementation.js
```

## Usage Examples

### Creating a Customer
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
// Result: status = 'active'
```

### Creating an Agency Request
```javascript
POST /api/auth/request-agency
{
  "name": "Jane Smith",
  "email": "jane@agency.com",
  "password": "password123",
  "agencyName": "Smith Real Estate",
  "agencyDescription": "Professional real estate services",
  "license": "RE123456",
  "address": "123 Main St, City, State"
}
// Result: status = 'pending'
```

### Approving an Agency (Admin Only)
```javascript
PATCH /api/admin/users/:id/status
{
  "status": "active"
}
```

### Searching Active Agencies
```javascript
GET /api/users/search/agencies?status=active
```

## Security Considerations

1. **Password Protection**: Passwords are never exposed in responses
2. **Admin Only**: Status updates require admin authentication
3. **Role Validation**: Admins cannot change their own status
4. **Input Validation**: All status values are validated
5. **Error Handling**: Proper error messages for different scenarios

## Mobile Responsiveness

- Tables include horizontal scroll on small screens
- Action buttons are properly sized for touch
- Status badges are mobile-friendly
- Navigation works on all screen sizes

## Future Enhancements

1. Email notifications for status changes
2. Bulk status updates for multiple agencies
3. Status change history tracking
4. Automatic status expiration for inactive accounts
5. Advanced filtering and sorting options

## Troubleshooting

### Common Issues

1. **Agency can't login after approval**
   - Check if status was actually updated in database
   - Verify admin permissions

2. **Table layout issues on mobile**
   - Ensure `overflow-x-auto` is applied
   - Check column width classes

3. **Status not updating**
   - Verify admin authentication
   - Check API endpoint permissions

### Debug Commands

```bash
# Check user status in database
db.users.findOne({email: "agency@example.com"}, {status: 1, role: 1})

# List all pending agencies
db.users.find({role: "agency", status: "pending"})

# Update user status manually
db.users.updateOne(
  {email: "agency@example.com"},
  {$set: {status: "active"}}
)
```
