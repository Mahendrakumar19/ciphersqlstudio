#!/bin/bash
set -e

echo "Building CipherSQLStudio Backend..."

# Navigate to backend directory
cd backend || exit 1

# Install dependencies
echo "Installing dependencies..."
npm install

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "✅ Build complete!"
