@echo off
REM Quick Start Script for Migrate Mate Cancellation Flow (Windows)
REM This script sets up the development environment and runs tests

echo 🚀 Migrate Mate Cancellation Flow - Quick Start
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if .env.local exists
if not exist .env.local (
    echo ⚠️  .env.local not found. Creating from template...
    copy env.example .env.local
    echo 📝 Please edit .env.local with your Supabase Cloud credentials:
    echo    - NEXT_PUBLIC_SUPABASE_URL
    echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo    - SUPABASE_SERVICE_ROLE_KEY
    echo.
    echo 🔗 Get these from your Supabase project dashboard
    echo.
    pause
) else (
    echo ✅ .env.local found
)

REM Check if Supabase credentials are set
findstr "your_supabase_project_url" .env.local >nul
if %errorlevel% equ 0 (
    echo ⚠️  Please update .env.local with your actual Supabase credentials
    echo    Run this script again after updating the credentials
    pause
    exit /b 1
)

REM Type check
echo 🔍 Running TypeScript type check...
call npm run type-check

if %errorlevel% neq 0 (
    echo ❌ TypeScript errors found. Please fix them before continuing.
    pause
    exit /b 1
)

echo ✅ TypeScript check passed

REM Build check
echo 🔨 Testing build process...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors before continuing.
    pause
    exit /b 1
)

echo ✅ Build successful

REM Start development server
echo 🌐 Starting development server...
echo 📱 Open http://localhost:3000 in your browser
echo 🧪 Test the cancellation flow by clicking 'Cancel Migrate Mate'
echo.
echo 📊 To test A/B testing:
echo    1. Clear browser data between tests
echo    2. Check database for variant assignments
echo    3. Verify pricing differences (Variant A: $25/$29, Variant B: $15/$19)
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

call npm run dev
