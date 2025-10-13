#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit

echo "🔧 Installing dependencies..."
npm install --production=false

echo "🏗️ Building application..."
npx vite build

echo "✅ Build completed successfully!"
