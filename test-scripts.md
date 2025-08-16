# Testing Guide for Migrate Mate Cancellation Flow

## 🚀 Quick Start Testing

### 1. Setup Environment
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your Supabase Cloud credentials
# Get these from your Supabase project dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database (Supabase Cloud)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-cloud-setup.sql`
4. Run the SQL script

### 4. Start Development Server
```bash
npm run dev
```

## 🧪 Comprehensive Testing Checklist

### **A/B Testing Verification**

#### Test Variant Assignment
1. **Clear browser data** (cookies, localStorage)
2. **Open cancellation flow** multiple times
3. **Verify consistent variant** assignment per user
4. **Check database** for variant persistence

```javascript
// Browser Console Test
// Check variant assignment
localStorage.getItem('ab-test-variant')

// Check database records
// Query: SELECT * FROM cancellations WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'
```

#### Test Variant B Pricing
- **Variant A**: Should show original price ($25/$29)
- **Variant B**: Should show discounted price ($15/$19)

### **Flow Testing**

#### 1. Main Entry Point
- [ ] Click "Cancel Migrate Mate" button
- [ ] Verify popup opens correctly
- [ ] Test escape key closes popup
- [ ] Test click outside closes popup

#### 2. Job Found Question
- [ ] Select "Yes, I found a job with Migrate Mate"
- [ ] Select "No, I found a job without Migrate Mate"
- [ ] Verify proper navigation to next step

#### 3. A/B Test Variants

**Variant A (No Downsell):**
- [ ] Goes directly to cancellation flow
- [ ] No offer shown

**Variant B (With Downsell):**
- [ ] Shows offer before cancellation
- [ ] Displays correct discounted pricing
- [ ] "Accept Offer" button works
- [ ] "Continue to Cancel" button works

#### 4. Cancellation Reasons
- [ ] Test all reason options
- [ ] Verify amount field appears for "Too expensive"
- [ ] Test form validation
- [ ] Verify proper navigation

#### 5. Feedback Forms
- [ ] Test feedback submission
- [ ] Verify form validation
- [ ] Test optional fields

#### 6. Final Cancellation
- [ ] Verify cancellation completion
- [ ] Check database records
- [ ] Test success screen

### **Database Testing**

#### Check Database Records
```sql
-- Check users
SELECT * FROM users;

-- Check subscriptions
SELECT * FROM subscriptions;

-- Check cancellations
SELECT 
  c.id,
  c.user_id,
  c.downsell_variant,
  c.reason,
  c.accepted_downsell,
  c.created_at,
  u.email,
  s.monthly_price
FROM cancellations c
JOIN users u ON c.user_id = u.id
JOIN subscriptions s ON u.id = s.user_id
ORDER BY c.created_at DESC;
```

#### Test A/B Variant Distribution
```sql
-- Check variant distribution
SELECT 
  downsell_variant,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM cancellations 
GROUP BY downsell_variant;
```

### **Responsive Testing**

#### Mobile Testing (< 768px)
- [ ] Test on mobile devices
- [ ] Verify touch interactions
- [ ] Check modal sizing
- [ ] Test form inputs

#### Tablet Testing (768px - 1024px)
- [ ] Test intermediate screen sizes
- [ ] Verify layout adaptation

#### Desktop Testing (> 1024px)
- [ ] Test on large screens
- [ ] Verify optimal spacing
- [ ] Check hover states

### **Error Handling Testing**

#### Network Issues
1. **Disconnect internet** during flow
2. **Verify graceful degradation**
3. **Check error messages**
4. **Test retry mechanisms**

#### Database Connection Issues
1. **Use invalid Supabase credentials**
2. **Verify fallback to mock data**
3. **Check console warnings**

### **Security Testing**

#### Input Validation
- [ ] Test XSS prevention
- [ ] Verify SQL injection protection
- [ ] Test special characters in forms

#### RLS Policies
```sql
-- Test RLS policies
-- Should only see own data
SELECT * FROM cancellations WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';
```

## 🔧 Debug Mode

Enable debug logging:
```bash
# In .env.local
NEXT_PUBLIC_APP_ENV=development
```

Check browser console for:
- A/B test assignments
- Database operations
- Analytics events
- Error messages

## 📊 Analytics Testing

### Verify Event Tracking
```javascript
// Check analytics events in browser console
// Look for:
// - popup_opened
// - ab_test_event
// - cancellation_flow_step
// - offer_interaction
// - cancellation_completed
```

## 🚨 Common Issues & Solutions

### Issue: A/B Testing Not Working
**Solution:**
1. Check `NEXT_PUBLIC_ENABLE_AB_TESTING=true`
2. Verify Supabase connection
3. Clear browser cache
4. Check database permissions

### Issue: Database Connection Failed
**Solution:**
1. Verify Supabase credentials
2. Check RLS policies
3. Ensure tables exist
4. Check network connectivity

### Issue: Variant Assignment Inconsistent
**Solution:**
1. Clear localStorage
2. Check user ID consistency
3. Verify database records
4. Check RNG implementation

## 📈 Performance Testing

### Load Testing
```bash
# Test with multiple concurrent users
# Use browser dev tools to simulate slow network
# Check bundle size and load times
```

### Memory Testing
- [ ] Monitor memory usage during flow
- [ ] Check for memory leaks
- [ ] Test with multiple popup opens/closes

## 🎯 Production Readiness Checklist

### Before Deployment
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies active
- [ ] Analytics configured
- [ ] Error monitoring setup
- [ ] Performance optimized
- [ ] Security reviewed

### Post-Deployment
- [ ] Monitor error rates
- [ ] Track A/B test performance
- [ ] Verify analytics data
- [ ] Check database performance
- [ ] Monitor user feedback
