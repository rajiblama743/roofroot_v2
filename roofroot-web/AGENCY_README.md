# Agency Section - RoofRoot Web App

## Overview

The Agency section provides a dedicated interface for property agencies to manage their listings, view analytics, and update their profile information. This section mirrors the design patterns and user experience of the Admin section for consistency.

## Features

### 🔐 Authentication & Authorization
- **Role-based Access Control**: Only users with `role: 'agency'` can access agency routes
- **Protected Routes**: All agency pages are wrapped with `withAgencyGuard`
- **Automatic Redirects**: Unauthorized users are redirected to `/login`

### 🏠 Dashboard (`/agency`)
- **Overview Statistics**: 
  - Total Listings
  - For Sale properties
  - For Rent properties  
  - Active Listings
- **Recent Activity**: Shows last 5 created/updated listings
- **Responsive Design**: Mobile-first approach with collapsible sidebar

### 📋 Listings Management (`/agency/listings`)
- **List View**: Table format with search and filtering
- **Actions**: View, Edit, Delete for each listing
- **Search & Filter**: By title, location, description, and type (sale/lease)
- **Add New**: Button to create new listings
- **Status Badges**: Visual indicators for listing status

### 📝 Listing Details (`/agency/listings/[id]`)
- **Comprehensive View**: All listing information displayed
- **Quick Actions**: Edit and Delete buttons
- **Breadcrumb Navigation**: Clear navigation hierarchy
- **Responsive Layout**: Two-column layout on desktop, single column on mobile

### ✏️ Edit Listing (`/agency/listings/[id]/edit`)
- **Form Validation**: Required fields and input validation
- **Pre-filled Data**: Loads existing listing information
- **Save/Cancel**: Clear action buttons with loading states

### ➕ Add New Listing (`/agency/listings/new`)
- **Clean Form**: Simple form for creating new listings
- **Validation**: Required fields and proper input types
- **Success Handling**: Redirects to listings page after creation

### ⚙️ Settings (`/agency/settings`)
- **Profile Management**: Update personal and agency information
- **Form Fields**: Name, email, phone, agency name, description
- **Account Info**: Display role, account type, status, last login
- **Sign Out**: Prominent logout button

## Architecture

### Shared Components
All components are built using reusable shared components located in `/src/components/shared/`:

- **Sidebar**: Collapsible navigation with mobile support
- **Header**: Top header with user info and sign out
- **StatCard**: Statistics display cards
- **Table**: Responsive data table with actions
- **SearchBar**: Search input with icon
- **ConfirmDialog**: Confirmation dialogs for destructive actions
- **Breadcrumbs**: Navigation breadcrumbs
- **Skeleton**: Loading state components

### Layout Structure
```
AgencyLayout
├── Sidebar (Navigation)
│   ├── Logo & Title
│   ├── Navigation Items
│   └── Bottom Content (Agency Name + Sign Out)
├── Header (User Info + Sign Out)
└── Main Content Area
    └── Page-specific content
```

### Navigation Items
1. **Dashboard** (`/agency`) - Overview and statistics
2. **Listings** (`/agency/listings`) - Manage property listings
3. **Settings** (`/agency/settings`) - Profile and account settings

## Styling & Design

### Design System
- **Colors**: Consistent with admin section (blue primary, gray neutrals)
- **Typography**: Same font hierarchy and sizing
- **Spacing**: Consistent margins, padding, and gaps
- **Shadows**: Subtle shadows for depth and hierarchy

### Responsive Breakpoints
- **Mobile**: `< 1024px` - Collapsible sidebar, single column layouts
- **Desktop**: `≥ 1024px` - Fixed sidebar, multi-column layouts
- **Tablet**: Responsive grid adjustments

### Component Patterns
- **Cards**: White background with subtle shadows
- **Buttons**: Consistent button styles and states
- **Forms**: Standardized input styling and validation
- **Tables**: Responsive tables with horizontal scroll on mobile

## Security Features

### Route Protection
```typescript
// All agency pages use this guard
export default withAgencyGuard(AgencyPage);
```

### Authentication Checks
- Verifies user is logged in
- Confirms user role is 'agency'
- Redirects unauthorized users to login

### Data Scoping
- Listings are filtered by `createdBy` field
- Users can only access their own data
- No cross-agency data access

## API Integration

### Endpoints Used
- `GET /api/listings/my` - Fetch agency's listings
- `GET /api/listings/:id` - Get specific listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Error Handling
- Toast notifications for success/error states
- Graceful fallbacks for failed API calls
- Loading states during async operations

## Mobile Experience

### Responsive Design
- **Sidebar**: Collapses to hamburger menu on mobile
- **Tables**: Horizontal scroll for wide content
- **Forms**: Single column layout on small screens
- **Actions**: Touch-friendly button sizes

### Touch Interactions
- Proper button hit areas (44px minimum)
- Swipe gestures for mobile navigation
- Optimized for thumb navigation

## Accessibility

### Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color combinations

### Best Practices
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Form labels and descriptions

## Future Enhancements

### Planned Features
- **Bulk Operations**: Select multiple listings for batch actions
- **Advanced Filtering**: More sophisticated search and filter options
- **Analytics Dashboard**: Enhanced statistics and charts
- **Image Management**: Upload and manage listing images
- **Notification System**: Real-time updates and alerts

### Technical Improvements
- **State Management**: Consider Redux/Zustand for complex state
- **Caching**: Implement data caching for better performance
- **Offline Support**: Service worker for offline functionality
- **Performance**: Lazy loading and code splitting

## Development Notes

### File Structure
```
src/
├── app/agency/
│   ├── page.tsx (Dashboard)
│   ├── listings/
│   │   ├── page.tsx (Listings)
│   │   ├── new/page.tsx (Add New)
│   │   └── [id]/
│   │       ├── page.tsx (Details)
│   │       └── edit/page.tsx (Edit)
│   └── settings/page.tsx (Settings)
├── components/
│   ├── AgencyLayout.tsx
│   ├── withAgencyGuard.tsx
│   └── shared/
│       ├── index.ts
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── StatCard.tsx
│       ├── Table.tsx
│       ├── SearchBar.tsx
│       ├── ConfirmDialog.tsx
│       ├── Breadcrumbs.tsx
│       └── Skeleton.tsx
```

### Dependencies
- **@heroicons/react**: Icons for UI elements
- **react-hot-toast**: Toast notifications
- **lucide-react**: Additional icon set
- **Tailwind CSS**: Styling framework

### Testing Considerations
- Test role-based access control
- Verify mobile responsiveness
- Check accessibility compliance
- Test error handling scenarios
- Validate form submissions

## Deployment

### Build Process
The Agency section is included in the main web app build:
```bash
npm run build
```

### Environment Variables
Ensure these are set for production:
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
- Authentication tokens and user management

### Performance
- Optimized bundle size through code splitting
- Lazy loading of components where appropriate
- Efficient re-renders with React hooks
- Minimal API calls with proper caching

