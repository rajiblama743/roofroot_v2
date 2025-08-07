# 🔐 Security Setup Guide

## 🚨 IMMEDIATE ACTIONS REQUIRED

### Step 1: Generate Secure Secrets
```bash
cd roofroot-backend
node generate-secrets.js
```

### Step 2: Create Environment File
Create a `.env` file in the `roofroot-backend` directory:

```bash
# Copy the output from generate-secrets.js
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot

# Server
PORT=3001
NODE_ENV=development

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Install Dependencies
```bash
npm install express-rate-limit
```

### Step 4: Restart Backend
```bash
npm run dev
```

## ✅ What This Fixes Immediately

1. **Weak JWT Secrets** → Secure 64-character random strings
2. **Long Token Expiration** → 15-minute access tokens
3. **XSS Vulnerable Storage** → sessionStorage instead of localStorage
4. **Missing CSRF Protection** → CSRF tokens added
5. **Basic Security Headers** → Enhanced CSP and HSTS

## 🎯 Priority Order

### **DO NOW (Critical)**
- ✅ Generate and set JWT secrets
- ✅ Create .env file
- ✅ Restart backend

### **DO SOON (High Priority)**
- 🔄 Update frontend to use new token system
- 🔄 Test authentication flow
- 🔄 Verify CSRF protection

### **DO LATER (Medium Priority)**
- 📅 Add httpOnly cookies
- 📅 Implement audit logging
- 📅 Add IP whitelisting
- 📅 Database encryption

## 🔍 Testing the Setup

1. **Check Backend Startup**
   ```bash
   npm run dev
   # Should see: "✅ Security configuration validated"
   ```

2. **Test Authentication**
   - Try logging in
   - Check if tokens are stored in sessionStorage
   - Verify 15-minute expiration

3. **Test Security Headers**
   ```bash
   curl -I http://localhost:3001/api/health
   # Should see security headers
   ```

## 🚨 If You See Errors

### "JWT_SECRET environment variable must be set"
- Make sure your `.env` file exists
- Check that JWT_SECRET is set correctly
- Restart the backend server

### "Invalid token" errors
- Clear browser storage
- Log out and log back in
- Check that tokens are being generated correctly

## 📞 Need Help?

1. Check the console for error messages
2. Verify your `.env` file format
3. Make sure all dependencies are installed
4. Restart both frontend and backend

## 🎉 Success Indicators

- ✅ Backend starts without security errors
- ✅ Login works with new token system
- ✅ Tokens expire after 15 minutes
- ✅ Security headers are present
- ✅ No localStorage usage for tokens
