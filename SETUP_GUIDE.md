# Quick Setup Guide

This guide will help you get the Migrate Mate cancellation flow running quickly.

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn
- Git

### 2. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd cancel-flow-task-main

# Install dependencies
npm install
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your Supabase credentials
# You only need these 3 variables to get started:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Supabase Cloud Setup (2 minutes)

#### Option A: Use Your Existing Project
1. Go to your Supabase Cloud dashboard
2. Copy your project URL and anon key
3. Update `.env.local`

#### Option B: Create New Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name (e.g., "migrate-mate-cancel-flow")
5. Set a database password
6. Choose a region
7. Click "Create new project"
8. Wait for setup to complete
9. Go to Settings → API
10. Copy the URL and anon key to `.env.local`

### 5. Run the Application
```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 🎯 What You'll See

1. **Profile Page**: A clean profile interface with subscription details
2. **Cancel Button**: Click "Cancel Migrate Mate" to start the flow
3. **A/B Testing**: Users get different experiences (Variant A vs B)
4. **Dynamic Flow**: Based on user responses and A/B test variant
5. **Responsive Design**: Works perfectly on mobile and desktop

## 🔧 Configuration Options

### Basic Configuration
```bash
# App name (appears in headers)
NEXT_PUBLIC_APP_NAME=Migrate Mate

# Enable/disable features
NEXT_PUBLIC_ENABLE_AB_TESTING=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_FEEDBACK=true

# Pricing
NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE=2500
NEXT_PUBLIC_DOWSELL_DISCOUNT_AMOUNT=1000
```

### Advanced Configuration
```bash
# A/B test split (0.5 = 50/50)
NEXT_PUBLIC_AB_TEST_SPLIT=0.5

# UI Colors
NEXT_PUBLIC_PRIMARY_COLOR=#8952fc
NEXT_PUBLIC_SECONDARY_COLOR=#7b40fc

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

## 📱 Testing Different Devices

### Mobile Testing
1. Open Chrome DevTools (F12)
2. Click the device toggle button
3. Select iPhone or Android device
4. The app will automatically adapt to mobile layout

### Desktop Testing
- The app works perfectly on all screen sizes
- Try resizing your browser window to see responsive behavior

## 🧪 Testing A/B Variants

### Variant A (Direct Flow)
- Users go directly to cancellation reasons
- No offer screen

### Variant B (Offer First)
- Users see a discount offer first
- Then proceed to cancellation flow

### Testing Both Variants
```bash
# Force Variant A
NEXT_PUBLIC_AB_TEST_SPLIT=1.0

# Force Variant B  
NEXT_PUBLIC_AB_TEST_SPLIT=0.0

# 50/50 split (default)
NEXT_PUBLIC_AB_TEST_SPLIT=0.5
```

## 🚨 Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Supabase connection issues
```bash
# Check your environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Make sure your Supabase project is active
# Check the dashboard for any errors
```

#### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Getting Help

1. **Check the console**: Open browser DevTools (F12) and look for errors
2. **Check the terminal**: Look for build or runtime errors
3. **Verify Supabase**: Make sure your project is active and keys are correct
4. **Check environment**: Ensure `.env.local` is in the root directory

## 🚀 Next Steps

### Production Deployment
1. **Vercel** (Recommended): Connect your GitHub repo to Vercel
2. **Netlify**: Connect your GitHub repo to Netlify
3. **Manual**: Build with `npm run build` and deploy to any Node.js hosting

### Customization
1. **Colors**: Update the color variables in `.env.local`
2. **Content**: Modify text in `src/lib/config.ts`
3. **Flow**: Customize the cancellation flow in components
4. **Analytics**: Add your analytics IDs to track user behavior

### Database Schema
The app will automatically create the necessary tables in Supabase Cloud when you first run it. If you need to manually set up the schema, check the `seed.sql` file.

---

**That's it!** Your dynamic, responsive cancellation flow is now running. 🎉

For more detailed information, check the main README.md file.
