#!/bin/bash

echo "🚀 Preparing for Render deployment..."

# Build the backend
echo "📦 Building backend..."
cd roofroot-backend
npm run build
cd ..

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Commit and push to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Fix Render deployment configuration'"
    echo "   git push origin main"
    echo ""
    echo "2. On Render dashboard:"
    echo "   - Set Root Directory to: roofroot-backend"
    echo "   - Build Command: npm install --include=dev && npm run build"
    echo "   - Start Command: npm start"
    echo "   - Add environment variables:"
    echo "     MONGO_URI=your_mongodb_connection_string"
    echo "     NODE_ENV=production"
    echo ""
    echo "3. Deploy! 🎉"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi 