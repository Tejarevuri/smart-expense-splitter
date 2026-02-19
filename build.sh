#!/bin/bash

echo "📦 Building Expense Sharing System..."

# Get to project root
pwd
ls -la

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "📦 Installing backend..."
cd backend
npm install
cd ..

echo "✅ Build complete!"
