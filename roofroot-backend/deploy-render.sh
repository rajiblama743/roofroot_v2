#!/bin/bash

echo "🚀 Deploying RoofRoot Backend to Render..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the roofroot-backend directory."
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -f "dist/server.js" ]; then
    echo "❌ Build failed! dist/server.js not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Test the build locally
echo "🧪 Testing build locally..."
timeout 10s npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Test the health endpoint
if curl -s http://localhost:10000/api/health > /dev/null; then
    echo "✅ Local server test passed!"
else
    echo "⚠️ Local server test failed, but continuing with deployment..."
fi

# Kill the test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ Build completed"
echo "2. ✅ Dependencies installed"
echo "3. ✅ TypeScript compilation successful"
echo ""
echo "🔗 Next steps:"
echo "1. Push this code to your Git repository"
echo "2. Render will automatically redeploy"
echo "3. Check Render dashboard for deployment status"
echo "4. Verify environment variables are set in Render dashboard"
echo ""
echo "🌐 Backend URL: https://roofroot-backend.onrender.com"
echo "🔍 Health Check: https://roofroot-backend.onrender.com/api/health"
