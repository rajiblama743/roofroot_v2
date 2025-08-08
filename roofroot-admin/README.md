# RoofRoot Admin

A separate admin web application for the RoofRoot property management platform.

## Features

- **Admin-only authentication** with JWT-based security
- **Dashboard** with platform statistics and overview
- **User management** - view, create, update, and delete users
- **Agency management** - review and manage real estate agencies
- **Listing moderation** - view, filter, and delete property listings
- **Admin profile settings** - manage admin account information
- **Responsive design** with mobile-friendly interface
- **Real-time notifications** with toast messages

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Authentication**: JWT tokens with role-based access control
- **UI Components**: Lucide React icons, Headless UI
- **Notifications**: React Hot Toast
- **API**: Axios with interceptors for auth handling

## Project Structure

```
roofroot-admin/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── login/             # Admin login page
│   │   ├── users/             # User management
│   │   ├── agencies/          # Agency management
│   │   ├── listings/          # Listing moderation
│   │   ├── settings/          # Admin profile settings
│   │   └── layout.tsx         # Root layout with toast provider
│   ├── components/            # Reusable UI components
│   │   ├── AdminLayout.tsx    # Main layout with sidebar
│   │   ├── withAdminGuard.tsx # Authentication HOC
│   │   ├── StatCard.tsx       # Dashboard statistics
│   │   ├── Table.tsx          # Data table component
│   │   ├── SearchBar.tsx      # Search input component
│   │   └── ConfirmDialog.tsx  # Confirmation dialogs
│   └── services/              # API and auth services
│       ├── api.ts             # Axios API client
│       └── auth.ts            # Authentication utilities
├── .env.local                 # Environment configuration
└── package.json               # Dependencies and scripts
```

## Environment Configuration

### Development
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PORT=3007
```

### Production
```bash
# .env.local (for Vercel deployment)
NEXT_PUBLIC_API_URL=https://roofroot-backend.onrender.com
# Vercel project domain: admin.roofroot.com
```

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   # Create .env.local with development settings
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
   echo "NEXT_PUBLIC_PORT=3007" >> .env.local
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the admin panel**:
   - URL: `http://localhost:3007`
   - Login with admin credentials

## API Integration

The admin app uses the shared backend API with the following endpoints:

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Verify admin session

### User Management
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (no self-delete)

### Listing Management
- `GET /api/listings` - Get all listings
- `DELETE /api/listings/:id` - Delete listing

## Authentication & Security

### Admin Guard
- All routes except `/login` are protected
- Uses `withAdminGuard` HOC for client-side protection
- Verifies JWT token and admin role on each page load
- Automatic redirect to login if unauthorized

### Token Management
- JWT tokens stored in localStorage
- Automatic token refresh and validation
- Secure logout with token cleanup

### Role-based Access
- Only users with `role: 'admin'` can access the admin panel
- Backend enforces admin-only endpoints
- Frontend hides admin UI for non-admin users

## Deployment (Vercel)

1. **Create Vercel project**:
   - Connect GitHub repository
   - Set project name: `roofroot-admin`

2. **Configure environment variables**:
   ```bash
   NEXT_PUBLIC_API_URL=https://roofroot-backend.onrender.com
   ```

3. **Set custom domain**:
   - Domain: `admin.roofroot.com`
   - Configure DNS records as needed

4. **Deploy**:
   - Vercel will auto-deploy on git push
   - Build command: `npm run build`
   - Output directory: `.next`

## Security Considerations

- **No indexing**: Admin panel is set to `noindex, nofollow`
- **HTTPS only**: Production requires secure connections
- **Token expiration**: JWT tokens have short expiration times
- **Role validation**: Both frontend and backend validate admin role
- **Secure headers**: Implement security headers in production

## Development Notes

### Adding New Pages
1. Create page component in `src/app/[page-name]/page.tsx`
2. Wrap with `withAdminGuard` HOC
3. Use `AdminLayout` for consistent styling
4. Add navigation item in `AdminLayout.tsx`

### API Integration
1. Add new endpoints to `src/services/api.ts`
2. Handle errors with toast notifications
3. Use loading states for better UX
4. Implement proper error boundaries

### Styling
- Uses Tailwind CSS for responsive design
- Follows existing component patterns
- Mobile-first responsive approach
- Consistent color scheme and spacing

## Troubleshooting

### Common Issues

1. **Login not working**:
   - Check backend API is running on port 3001
   - Verify admin user exists with correct role
   - Check browser console for API errors

2. **API connection errors**:
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings on backend
   - Ensure backend is accessible

3. **Build errors**:
   - Run `npm install` to ensure all dependencies
   - Check TypeScript errors with `npm run lint`
   - Verify all imports are correct

### Development Tips

- Use browser dev tools to debug API calls
- Check Network tab for failed requests
- Use React DevTools for component debugging
- Monitor console for authentication errors

## License

This project is part of the RoofRoot platform and follows the same licensing terms.
