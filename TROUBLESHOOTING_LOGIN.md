# 🔐 Login Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. Environment Variables Not Set

**Problem:** Frontend can't connect to backend API
**Solution:** Set the following environment variables in your deployment platform:

#### For Frontend (Vercel/Netlify):
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

#### For Backend (Railway/Render/Heroku):
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters-long
NODE_ENV=production
FRONTEND_URLS=https://your-frontend-url.com,https://www.your-frontend-url.com
```

### 2. CORS Issues

**Problem:** Browser blocks requests due to CORS policy
**Symptoms:** Network errors in browser console
**Solution:** 
- Check that your frontend URL is in the allowed origins
- Add your domain to `FRONTEND_URLS` environment variable
- Check backend logs for CORS errors

### 3. Database Connection Issues

**Problem:** Backend can't connect to MongoDB
**Symptoms:** 500 errors on login
**Solution:**
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas network access settings
- Ensure database user has proper permissions

### 4. JWT Secret Issues

**Problem:** Token generation fails
**Symptoms:** Login appears successful but subsequent requests fail
**Solution:**
- Ensure `JWT_SECRET` is at least 32 characters
- Ensure `JWT_REFRESH_SECRET` is set
- Use secure random strings, not default values

### 5. Agency User Role Issues

**Problem:** Agency users can't login
**Symptoms:** Login fails with "Invalid credentials"
**Solution:**
- Check that the user exists in database
- Verify the user has `role: 'agency'` in database
- Check password is correct

## 🔍 Debugging Steps

### Step 1: Check Frontend Console
1. Open browser developer tools
2. Go to Network tab
3. Try to login
4. Look for failed requests
5. Check response status and body

### Step 2: Check Backend Logs
1. Access your deployment platform logs
2. Look for login attempts
3. Check for error messages
4. Verify CORS logs

### Step 3: Test API Directly
```bash
# Test health endpoint
curl https://your-backend-url.com/api/health

# Test login endpoint
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Step 4: Check Database
1. Connect to MongoDB Atlas
2. Check users collection
3. Verify agency user exists
4. Check user role and password hash

## 🛠️ Quick Fixes

### Fix 1: Update Environment Variables
```bash
# Backend (Railway/Render)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters-long
NODE_ENV=production
FRONTEND_URLS=https://your-frontend-url.com

# Frontend (Vercel/Netlify)
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Fix 2: Create Test Agency User
```javascript
// In MongoDB Atlas console or via API
{
  "name": "Test Agency",
  "email": "agency@test.com",
  "password": "$2a$12$...", // bcrypt hash
  "role": "agency",
  "agencyName": "Test Agency",
  "phoneNumber": "+1234567890"
}
```

### Fix 3: Update CORS Configuration
```javascript
// In backend security config
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-url.com',
  'https://www.your-frontend-url.com'
];
```

## 📋 Deployment Checklist

### Backend Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Database user with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for development)
- [ ] Environment variables set:
  - [ ] `MONGO_URI`
  - [ ] `JWT_SECRET` (32+ characters)
  - [ ] `JWT_REFRESH_SECRET` (32+ characters)
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URLS`
- [ ] Backend deployed and accessible
- [ ] Health endpoint responding

### Frontend Deployment
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_API_URL`
- [ ] Frontend deployed and accessible
- [ ] Can connect to backend API
- [ ] Login form working

### Testing
- [ ] Backend health check passes
- [ ] Frontend can reach backend
- [ ] Login endpoint responds correctly
- [ ] Agency user can login
- [ ] JWT token is generated
- [ ] User is redirected to dashboard

## 🚨 Emergency Fixes

### If Nothing Works:
1. **Reset Environment Variables:**
   ```bash
   # Generate new JWT secrets
   JWT_SECRET=$(openssl rand -hex 32)
   JWT_REFRESH_SECRET=$(openssl rand -hex 32)
   ```

2. **Create New Agency User:**
   ```bash
   # Use registration endpoint
   curl -X POST https://your-backend-url.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Agency",
       "email": "agency@test.com",
       "password": "password123",
       "agencyName": "Test Agency",
       "role": "customer"
     }'
   ```

3. **Check Database Connection:**
   ```bash
   # Test MongoDB connection
   mongosh "your-mongodb-uri"
   ```

## 📞 Support

If you're still having issues:
1. Check the deployment platform logs
2. Verify all environment variables are set
3. Test the API endpoints directly
4. Check browser console for errors
5. Verify database connection and user data

---

**Remember:** Always check the logs first! They contain the most valuable debugging information.
