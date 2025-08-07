# 🌐 Multi-URL Frontend Setup Guide

## 🎯 **How to Configure Multiple Frontend URLs**

### **Option 1: Environment-Specific Files (Recommended)**

#### **Development (.env.development)**
```bash
# Local development only
FRONTEND_URLS=http://localhost:3000,http://localhost:3001
NODE_ENV=development
```

#### **Production (.env.production)**
```bash
# Production domains only
FRONTEND_URLS=https://your-deployed-domain.com,https://www.your-deployed-domain.com
NODE_ENV=production
```

### **Option 2: Single File with All URLs**

#### **Single .env file**
```bash
# ========================================
# MULTI-ENVIRONMENT CONFIGURATION
# ========================================

# JWT Security
JWT_SECRET=7eb5e60c3214c4a92cdd0e6b4b75448c1f36a12e728d4685a347162d37bc2367
JWT_REFRESH_SECRET=f4bd297bfdf11396b10c354eb35f9311c8621b0a8db6f0998eecf163e5a76fd7

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot

# Server
PORT=3001
NODE_ENV=development

# Multiple Frontend URLs (comma-separated)
FRONTEND_URLS=http://localhost:3000,https://your-deployed-domain.com,https://www.your-deployed-domain.com
```

## 🔧 **How It Works**

### **CORS Configuration**
The backend now supports multiple origins:

1. **Local Development**: Always allowed
   - `http://localhost:3000`
   - `http://localhost:3001`

2. **Production Domains**: From environment variable
   - `https://your-deployed-domain.com`
   - `https://www.your-deployed-domain.com`

3. **Dynamic URLs**: From `FRONTEND_URLS` environment variable
   - Split by commas
   - Automatically trimmed

## 📋 **Setup Instructions**

### **Step 1: Create .env file**
Create a `.env` file in `roofroot-backend` with your URLs:

```bash
# Replace with your actual URLs
FRONTEND_URLS=http://localhost:3000,https://your-deployed-domain.com
```

### **Step 2: Update with your domains**
Replace the example URLs with your actual domains:

```bash
# Example for different scenarios:
FRONTEND_URLS=http://localhost:3000,https://roofroot.com,https://www.roofroot.com
FRONTEND_URLS=http://localhost:3000,https://app.roofroot.com
FRONTEND_URLS=http://localhost:3000,https://your-custom-domain.com
```

### **Step 3: Test the setup**
```bash
# Start backend
npm run dev

# Test from localhost
curl -H "Origin: http://localhost:3000" http://localhost:3001/api/health

# Test from your domain (when deployed)
curl -H "Origin: https://your-deployed-domain.com" http://localhost:3001/api/health
```

## 🎯 **URL Format Examples**

### **Single Domain**
```bash
FRONTEND_URLS=http://localhost:3000,https://roofroot.com
```

### **Multiple Domains**
```bash
FRONTEND_URLS=http://localhost:3000,https://roofroot.com,https://www.roofroot.com
```

### **Subdomain**
```bash
FRONTEND_URLS=http://localhost:3000,https://app.roofroot.com
```

### **Custom Domain**
```bash
FRONTEND_URLS=http://localhost:3000,https://your-custom-domain.com
```

## 🔍 **Troubleshooting**

### **CORS Errors**
- ✅ Check that your domain is in `FRONTEND_URLS`
- ✅ Ensure exact match (including protocol)
- ✅ No trailing slashes
- ✅ Case sensitive

### **Common Issues**
- ❌ `https://domain.com/` (trailing slash)
- ❌ `http://domain.com` (should be https in production)
- ❌ `domain.com` (missing protocol)

### **Testing**
```bash
# Check allowed origins in logs
npm run dev
# Look for: "CORS blocked request from: [domain]"
```

## 🚀 **Deployment**

### **Local Development**
```bash
FRONTEND_URLS=http://localhost:3000
```

### **Production**
```bash
FRONTEND_URLS=https://your-deployed-domain.com,https://www.your-deployed-domain.com
```

### **Staging**
```bash
FRONTEND_URLS=http://localhost:3000,https://staging.your-domain.com
```

## ✅ **Benefits**

1. **Flexible**: Add/remove domains without code changes
2. **Secure**: Only specified domains can access API
3. **Development-friendly**: Local development always works
4. **Production-ready**: Multiple production domains supported
5. **Easy management**: Single environment variable
