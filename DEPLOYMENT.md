# 🚀 RoofRoot Deployment Guide

Complete deployment instructions for all RoofRoot platform components.

## 📋 Prerequisites

### Backend Requirements
- Node.js 18+ installed
- MongoDB Atlas account
- Git repository access

### Web Frontend Requirements  
- Node.js 18+ installed
- Expo account (optional)
- Git repository access

### iOS App Requirements
- macOS with Xcode 15+
- Apple Developer Account
- iOS device or simulator

## 🔙 Backend Deployment

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account:**
   - Visit [cloud.mongodb.com](https://cloud.mongodb.com)
   - Sign up for free account

2. **Create Cluster:**
   - Choose "M0 Free" tier
   - Select cloud provider (AWS/Google Cloud/Azure)
   - Choose region closest to your users

3. **Configure Database Access:**
   - Go to "Database Access"
   - Create new database user
   - Set username and password
   - Grant "Read and write to any database" permissions

4. **Configure Network Access:**
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allows all IPs)
   - Or add specific IP addresses for security

5. **Get Connection String:**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 2. Railway Deployment (Recommended)

1. **Connect Repository:**
   - Visit [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select `roofroot-backend` directory

2. **Configure Environment Variables:**
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot
   PORT=5000
   NODE_ENV=production
   ```

3. **Deploy:**
   - Railway will automatically detect Node.js
   - Build and deploy automatically
   - Get your production URL

### 3. Render Deployment (Alternative)

1. **Create New Service:**
   - Visit [render.com](https://render.com)
   - Create new "Web Service"
   - Connect your GitHub repository

2. **Configure Settings:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Add Environment Variables:**
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `NODE_ENV` - `production`

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete
   - Get your production URL

### 4. Heroku Deployment

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App:**
   ```bash
   heroku create roofroot-backend
   ```

3. **Add Buildpack:**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set MONGO_URI="your-mongodb-uri"
   heroku config:set NODE_ENV="production"
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

## 🌐 Web Frontend Deployment

### 1. Vercel Deployment (Recommended)

1. **Connect Repository:**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select `roofroot-web` directory

2. **Configure Build Settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `web-build`
   - **Install Command:** `npm install`

3. **Add Environment Variables:**
   - `EXPO_PUBLIC_API_URL` - Your backend URL

4. **Deploy:**
   - Click "Deploy"
   - Get your production URL

### 2. Netlify Deployment

1. **Connect Repository:**
   - Visit [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Select `roofroot-web` directory

2. **Configure Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `web-build`

3. **Add Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add `EXPO_PUBLIC_API_URL`

4. **Deploy:**
   - Netlify will build and deploy automatically
   - Get your production URL

### 3. Expo Hosting

1. **Install Expo CLI:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Login to Expo:**
   ```bash
   expo login
   ```

3. **Build for Web:**
   ```bash
   cd roofroot-web
   expo build:web
   ```

4. **Deploy:**
   ```bash
   expo publish
   ```

## 📱 iOS App Deployment

### 1. TestFlight Setup

1. **Configure App Store Connect:**
   - Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Create new app: "RoofRoot"
   - Bundle ID: `com.roofroot.ios`

2. **Archive and Upload:**
   ```bash
   # In Xcode
   Product → Archive
   ```

3. **Upload to App Store Connect:**
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow upload process

4. **Create TestFlight Build:**
   - Go to App Store Connect
   - Select your app
   - Go to "TestFlight" tab
   - Add internal testers
   - Submit for beta review

### 2. App Store Release

1. **Complete App Information:**
   - App description
   - Screenshots
   - Privacy policy
   - App review information

2. **Submit for Review:**
   - Go to "App Store" tab
   - Click "Submit for Review"
   - Wait for Apple's review process

3. **Release:**
   - Once approved, click "Release"
   - App will be available on App Store

## 🔧 Environment Configuration

### Backend Environment Variables

```bash
# Production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot
PORT=5000
NODE_ENV=production

# Development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot-dev
PORT=5000
NODE_ENV=development
```

### Web Frontend Environment Variables

```bash
# Production
EXPO_PUBLIC_API_URL=https://your-backend-url.com

# Development
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### iOS App Configuration

```swift
// Config.swift
struct Config {
    #if DEBUG
    static let apiBaseURL = "http://localhost:5000"
    #else
    static let apiBaseURL = "https://your-backend-url.com"
    #endif
}
```

## 🔐 Security Checklist

### Backend Security
- [ ] Use HTTPS in production
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up monitoring (Sentry)
- [ ] Configure logging

### Web Frontend Security
- [ ] Use HTTPS only
- [ ] Sanitize user inputs
- [ ] Implement CSP headers
- [ ] Add error boundaries
- [ ] Set up analytics

### iOS App Security
- [ ] Remove App Transport Security exceptions
- [ ] Use Keychain for sensitive data
- [ ] Implement certificate pinning
- [ ] Add crash reporting
- [ ] Validate all API responses

## 📊 Monitoring & Analytics

### Backend Monitoring
- **Sentry:** Error tracking
- **MongoDB Atlas:** Database monitoring
- **Railway/Render:** Platform monitoring

### Web Analytics
- **Google Analytics:** User tracking
- **Vercel Analytics:** Performance monitoring
- **Sentry:** Error tracking

### iOS Analytics
- **App Store Connect:** App analytics
- **Crashlytics:** Crash reporting
- **Firebase Analytics:** User behavior

## 🚀 Performance Optimization

### Backend Optimization
- Enable MongoDB Atlas indexes
- Implement caching (Redis)
- Use compression middleware
- Optimize database queries

### Web Frontend Optimization
- Enable code splitting
- Optimize bundle size
- Use CDN for assets
- Implement lazy loading

### iOS App Optimization
- Enable app thinning
- Optimize image assets
- Use background processing
- Implement caching

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy RoofRoot
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          cd roofroot-backend
          npm install
          npm run build
      # Add deployment steps for your platform

  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          cd roofroot-web
          npm install
          npm run build
      # Add deployment steps for your platform
```

## 📞 Support

- **Backend Issues:** Check `roofroot-backend/README.md`
- **Web Issues:** Check `roofroot-web/README.md`
- **iOS Issues:** Check `roofroot-ios/README.md`
- **Deployment Issues:** Check platform-specific documentation

---

**Ready to deploy your RoofRoot platform! 🚀** 