#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit

echo "🔧 Installing dependencies..."
npm install

echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
