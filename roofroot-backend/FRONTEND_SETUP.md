# 🌐 Frontend Setup Guide: Local + Domain

## 📋 **Step 1: Local Development Setup**

### **Backend .env for Local Development**
Create/update your `.env` file in `roofroot-backend`:

```bash
# ========================================
# LOCAL DEVELOPMENT CONFIGURATION
# ========================================

# JWT Security
JWT_SECRET=7eb5e60c3214c4a92cdd0e6b4b75448c1f36a12e728d4685a347162d37bc2367
JWT_REFRESH_SECRET=f4bd297bfdf11396b10c354eb35f9311c8621b0a8db6f0998eecf163e5a76fd7

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (LOCAL)
FRONTEND_URL=http://localhost:3000
```

### **Start Local Development**
```bash
# Terminal 1: Start Backend
cd roofroot-backend
npm run dev

# Terminal 2: Start Frontend
cd roofroot-web
npm run dev
```

**Result:** Frontend at `http://localhost:3000` can access backend at `http://localhost:3001`

## 🚀 **Step 2: Domain Deployment Setup**

### **Option A: Vercel Deployment**
1. **Connect your GitHub repo to Vercel**
2. **Set Environment Variables in Vercel:**
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   ```

### **Option B: Netlify Deployment**
1. **Connect your GitHub repo to Netlify**
2. **Set Environment Variables in Netlify:**
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   ```

### **Option C: Custom Domain**
1. **Deploy frontend to your custom domain**
2. **Update backend .env for production:**
   ```bash
   # ========================================
   # PRODUCTION CONFIGURATION
   # ========================================
   
   # JWT Security (use different secrets for production)
   JWT_SECRET=your-production-secret-here
   JWT_REFRESH_SECRET=your-production-refresh-secret-here
   
   # Database
   MONGO_URI=your-production-mongo-uri
   
   # Server
   PORT=3001
   NODE_ENV=production
   
   # Frontend URL (PRODUCTION)
   FRONTEND_URL=https://your-deployed-domain.com
   ```

## 🔄 **Step 3: Environment Switching**

### **Development (.env.development)**
```bash
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### **Production (.env.production)**
```bash
NODE_ENV=production
FRONTEND_URL=https://your-deployed-domain.com
```

## 🌐 **Step 4: Frontend Configuration**

### **Update Frontend API Configuration**
In `roofroot-web/src/lib/api.ts`:

```typescript
// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

### **Environment Variables for Frontend**
Create `.env.local` in `roofroot-web`:

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Production (set this in your deployment platform)
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## 🧪 **Step 5: Testing Both Environments**

### **Test Local Development**
1. Start both backend and frontend
2. Visit `http://localhost:3000`
3. Try logging in and using features
4. Check browser console for CORS errors

### **Test Production Deployment**
1. Deploy frontend to your domain
2. Update backend .env with production settings
3. Deploy backend to your hosting platform
4. Test the deployed frontend

## 🔍 **Step 6: Troubleshooting**

### **CORS Errors**
- ✅ Check `FRONTEND_URL` in backend .env
- ✅ Ensure domain matches exactly
- ✅ Use `https://` in production, `http://` in development

### **API Connection Errors**
- ✅ Check `NEXT_PUBLIC_API_URL` in frontend
- ✅ Ensure backend is running and accessible
- ✅ Verify API endpoints are working

### **Authentication Errors**
- ✅ Check JWT secrets are set correctly
- ✅ Ensure tokens are being generated
- ✅ Verify token expiration settings

## 📊 **Environment Summary**

| Environment | Frontend URL | Backend URL | CORS Setting |
|-------------|--------------|-------------|--------------|
| **Local** | `http://localhost:3000` | `http://localhost:3001` | `http://localhost:3000` |
| **Production** | `https://your-domain.com` | `https://your-backend.com` | `https://your-domain.com` |

## 🎯 **Quick Setup Commands**

### **For Local Development:**
```bash
# Backend
cd roofroot-backend
echo "FRONTEND_URL=http://localhost:3000" >> .env
npm run dev

# Frontend
cd roofroot-web
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" >> .env.local
npm run dev
```

### **For Production:**
```bash
# Update backend .env
FRONTEND_URL=https://your-deployed-domain.com
NODE_ENV=production

# Deploy frontend with environment variable
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```
