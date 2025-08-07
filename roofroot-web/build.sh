#!/bin/bash

echo "🔧 Installing dependencies..."
npm install

echo "🔧 Installing Tailwind CSS PostCSS plugin..."
npm install @tailwindcss/postcss

echo "🔧 Building application..."
npm run build

echo "✅ Build completed!"
