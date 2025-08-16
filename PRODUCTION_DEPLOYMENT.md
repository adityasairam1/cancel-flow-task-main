# Production Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### 2. Environment Variables Setup
In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set `NEXT_PUBLIC_APP_ENV=production`

#### 3. Domain Configuration
- Add custom domain in Vercel dashboard
- Configure SSL certificates
- Set up redirects if needed

### Option 2: Netlify

#### 1. Connect Repository
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`

#### 2. Environment Variables
In Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add all variables from `.env.local`

### Option 3: Manual Deployment

#### 1. Build Application
```bash
npm run build
npm start
```

#### 2. Server Requirements
- Node.js 18+
- 512MB RAM minimum
- SSL certificate
- Reverse proxy (nginx recommended)

## 🔒 Security Configuration

### 1. Environment Variables
```bash
# Production environment
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0

# Supabase (use production project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### 2. Database Security
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Verify policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'subscriptions', 'cancellations');
```

### 3. CORS Configuration
In Supabase Dashboard:
1. Go to Settings → API
2. Configure allowed origins
3. Add your production domain

## 📊 Monitoring Setup

### 1. Error Monitoring
```bash
# Add Sentry (optional)
npm install @sentry/nextjs

# Configure in next.config.ts
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    // your existing next config
  },
  {
    // Sentry config
    silent: true,
    org: "your-org",
    project: "your-project",
  }
);
```

### 2. Analytics Setup
```bash
# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

### 3. Performance Monitoring
```bash
# Vercel Analytics (if using Vercel)
npm install @vercel/analytics

# Add to _app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

## 🧪 Production Testing

### 1. Smoke Tests
```bash
# Health check
curl https://your-domain.com/api/health

# Test cancellation flow
# 1. Open cancellation popup
# 2. Complete full flow
# 3. Verify database records
```

### 2. Load Testing
```bash
# Install artillery
npm install -g artillery

# Create load test
artillery quick --count 100 --num 10 https://your-domain.com
```

### 3. A/B Testing Verification
```sql
-- Check variant distribution
SELECT 
  downsell_variant,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM cancellations 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY downsell_variant;
```

## 🔧 Performance Optimization

### 1. Bundle Optimization
```bash
# Analyze bundle
npm run analyze

# Optimize images
# Use next/image for all images
# Implement lazy loading
```

### 2. Database Optimization
```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_cancellations_user_variant 
ON cancellations(user_id, downsell_variant);

CREATE INDEX CONCURRENTLY idx_subscriptions_user_status 
ON subscriptions(user_id, status);

-- Monitor query performance
EXPLAIN ANALYZE SELECT * FROM cancellations WHERE user_id = 'xxx';
```

### 3. Caching Strategy
```typescript
// Implement caching for user data
const cache = new Map();

export async function getUserSubscription(userId: string) {
  const cacheKey = `subscription_${userId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const subscription = await fetchSubscription(userId);
  cache.set(cacheKey, subscription);
  
  // Cache for 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return subscription;
}
```

## 📈 Analytics & Reporting

### 1. Key Metrics to Track
- Cancellation flow completion rate
- A/B test conversion rates
- Offer acceptance rate
- User feedback sentiment
- Performance metrics

### 2. Dashboard Setup
```sql
-- Create views for reporting
CREATE VIEW cancellation_analytics AS
SELECT 
  DATE(created_at) as date,
  downsell_variant,
  COUNT(*) as total_cancellations,
  SUM(CASE WHEN accepted_downsell THEN 1 ELSE 0 END) as accepted_offers,
  ROUND(
    SUM(CASE WHEN accepted_downsell THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
    2
  ) as conversion_rate
FROM cancellations
GROUP BY DATE(created_at), downsell_variant
ORDER BY date DESC;
```

### 3. Alerting Setup
```sql
-- Monitor for anomalies
-- Set up alerts for:
-- - High error rates
-- - Unusual cancellation patterns
-- - A/B test distribution issues
```

## 🚨 Incident Response

### 1. Rollback Plan
```bash
# Quick rollback to previous version
vercel rollback

# Database rollback (if needed)
# Restore from backup
```

### 2. Emergency Contacts
- Database admin
- DevOps team
- Product team
- Customer support

### 3. Communication Plan
- Status page setup
- Customer notification process
- Internal escalation procedures

## 🔄 Continuous Deployment

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 2. Pre-deployment Checks
- [ ] All tests pass
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Database migrations ready
- [ ] Environment variables updated

## 📋 Post-Deployment Checklist

### Day 1
- [ ] Monitor error rates
- [ ] Verify A/B testing is working
- [ ] Check analytics data flow
- [ ] Test cancellation flow end-to-end
- [ ] Monitor performance metrics

### Week 1
- [ ] Review conversion rates
- [ ] Analyze user feedback
- [ ] Optimize based on data
- [ ] Plan next iteration

### Month 1
- [ ] Comprehensive performance review
- [ ] Security audit
- [ ] User experience analysis
- [ ] Feature enhancement planning
