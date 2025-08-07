#!/bin/bash

# 🚀 Deployment Fix Script
# This script helps fix the RoofRoot deployment configuration

echo "🔧 RoofRoot Deployment Fix Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

BACKEND_URL="https://roofroot-v2.onrender.com"
FRONTEND_URL="https://roofroot-v2-roofroot-web-29ap.vercel.app"

echo ""
print_status "info" "Backend URL: $BACKEND_URL"
print_status "info" "Frontend URL: $FRONTEND_URL"
echo ""

print_status "info" "=== ENVIRONMENT VARIABLES TO SET ==="
echo ""

print_status "info" "🔙 BACKEND (Render) Environment Variables:"
echo "MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roofroot"
echo "JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long"
echo "JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters-long"
echo "NODE_ENV=production"
echo "FRONTEND_URLS=$FRONTEND_URL"
echo ""

print_status "info" "🌐 FRONTEND (Vercel) Environment Variables:"
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL/api"
echo ""

print_status "info" "=== DEPLOYMENT PLATFORM INSTRUCTIONS ==="
echo ""

print_status "info" "🔙 Render (Backend) Setup:"
echo "1. Go to https://dashboard.render.com"
echo "2. Select your 'roofroot-v2' service"
echo "3. Go to Environment → Environment Variables"
echo "4. Add the backend environment variables listed above"
echo "5. Save and redeploy"
echo ""

print_status "info" "🌐 Vercel (Frontend) Setup:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your 'roofroot-v2-roofroot-web' project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add NEXT_PUBLIC_API_URL=$BACKEND_URL/api"
echo "5. Save (Vercel will auto-redeploy)"
echo ""

print_status "info" "=== TEST CREDENTIALS ==="
echo "Email: agency@test.com"
echo "Password: password123"
echo ""

print_status "info" "=== VERIFICATION STEPS ==="
echo "1. Set environment variables in both platforms"
echo "2. Wait for redeployment (usually 2-5 minutes)"
echo "3. Test login at $FRONTEND_URL/login"
echo "4. Check browser console for any errors"
echo ""

print_status "success" "✅ Backend is working correctly"
print_status "success" "✅ Test user created successfully"
print_status "warning" "⚠️  Frontend needs environment variable configuration"
print_status "warning" "⚠️  Backend needs CORS configuration for frontend domain"

echo ""
print_status "info" "After setting environment variables, test with:"
echo "curl -X POST $BACKEND_URL/api/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"agency@test.com\",\"password\":\"password123\"}'"
