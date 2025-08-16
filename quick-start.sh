#!/bin/bash

# Quick Start Script for Migrate Mate Cancellation Flow
# This script sets up the development environment and runs tests

echo "🚀 Migrate Mate Cancellation Flow - Quick Start"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your Supabase Cloud credentials:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "🔗 Get these from your Supabase project dashboard"
    echo ""
    read -p "Press Enter after updating .env.local..."
else
    echo "✅ .env.local found"
fi

# Check if Supabase credentials are set
if grep -q "your_supabase_project_url" .env.local; then
    echo "⚠️  Please update .env.local with your actual Supabase credentials"
    echo "   Run this script again after updating the credentials"
    exit 1
fi

# Type check
echo "🔍 Running TypeScript type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before continuing."
    exit 1
fi

echo "✅ TypeScript check passed"

# Build check
echo "🔨 Testing build process..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before continuing."
    exit 1
fi

echo "✅ Build successful"

# Start development server
echo "🌐 Starting development server..."
echo "📱 Open http://localhost:3000 in your browser"
echo "🧪 Test the cancellation flow by clicking 'Cancel Migrate Mate'"
echo ""
echo "📊 To test A/B testing:"
echo "   1. Clear browser data between tests"
echo "   2. Check database for variant assignments"
echo "   3. Verify pricing differences (Variant A: $25/$29, Variant B: $15/$19)"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

npm run dev
