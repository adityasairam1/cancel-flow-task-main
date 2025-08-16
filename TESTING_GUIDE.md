# Testing Guide for Migrate Mate Cancellation Flow

This guide provides comprehensive instructions for testing all aspects of the subscription cancellation flow implementation.

## 🚀 Quick Start Testing

### 1. Automated Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci
```

### 2. Manual Testing Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 📋 Test Checklist

### ✅ Core Functionality Tests

#### A/B Testing
- [ ] **Variant Assignment**: Verify users get consistent variants
- [ ] **Variant A (No Downsell)**: Direct path to cancellation
- [ ] **Variant B (With Downsell)**: Shows $10 off offer
- [ ] **Persistence**: Variant remains same on repeat visits
- [ ] **Secure RNG**: Uses cryptographically secure random generation

#### Cancellation Flow
- [ ] **Main Entry**: "Have you found a job yet?" popup
- [ ] **Job Found Path**: Yes → Job form → Feedback → Success
- [ ] **Still Looking Path**: No → Offer (Variant B) → Reasons → Cancelled
- [ ] **Direct Cancellation**: No → Reasons (Variant A) → Cancelled

#### Data Persistence
- [ ] **Subscription Status**: Updated to `pending_cancellation`
- [ ] **Cancellation Record**: Created with all required fields
- [ ] **A/B Variant**: Stored in `downsell_variant` field
- [ ] **User Feedback**: Captured and stored correctly

#### Security
- [ ] **Row-Level Security**: RLS policies enforced
- [ ] **Input Validation**: All user inputs validated
- [ ] **XSS Protection**: No script injection possible
- [ ] **CSRF Protection**: Proper request handling

### ✅ User Experience Tests

#### Responsive Design
- [ ] **Mobile (< 768px)**: Full-screen modals, stacked layouts
- [ ] **Tablet (768px - 1024px)**: Medium modals, side-by-side
- [ ] **Desktop (> 1024px)**: Large modals, optimal spacing

#### Accessibility
- [ ] **Keyboard Navigation**: Tab, Enter, Escape keys work
- [ ] **Screen Readers**: Proper ARIA labels and roles
- [ ] **Focus Management**: Logical tab order
- [ ] **Color Contrast**: Meets WCAG guidelines

#### Error Handling
- [ ] **Database Errors**: Graceful fallbacks
- [ ] **Network Issues**: Offline handling
- [ ] **Invalid Input**: Clear error messages
- [ ] **Loading States**: Proper loading indicators

### ✅ Business Logic Tests

#### Pricing Logic
- [ ] **$25 Plan**: $25 → $15 with $10 discount
- [ ] **$29 Plan**: $29 → $19 with $10 discount
- [ ] **Price Display**: Correct formatting ($XX.XX)
- [ ] **Discount Calculation**: Accurate price reduction

#### Offer Acceptance
- [ ] **Accept Offer**: Logs action, returns to profile
- [ ] **Decline Offer**: Continues to reason selection
- [ ] **Payment Stub**: No actual payment processing
- [ ] **Transaction Logging**: Proper audit trail

#### Cancellation Reasons
- [ ] **Too Expensive**: Requires amount input
- [ ] **Platform Issues**: Requires feedback (25+ chars)
- [ ] **Job Relevance**: Requires feedback (25+ chars)
- [ ] **Change of Plans**: Requires feedback (25+ chars)
- [ ] **Other**: Requires feedback (25+ chars)

## 🧪 Detailed Test Scenarios

### Scenario 1: Variant A User Journey
1. **Setup**: User assigned to Variant A
2. **Action**: Click "Cancel Migrate Mate"
3. **Expected**: Main popup appears
4. **Action**: Click "Not yet - I'm still looking"
5. **Expected**: Goes directly to offer page (same as B for "Not yet")
6. **Action**: Click "No thanks"
7. **Expected**: Goes to reason selection
8. **Action**: Select reason and complete
9. **Expected**: Cancellation completed, subscription marked pending

### Scenario 2: Variant B User Journey
1. **Setup**: User assigned to Variant B
2. **Action**: Click "Cancel Migrate Mate"
3. **Expected**: Main popup appears
4. **Action**: Click "Not yet - I'm still looking"
5. **Expected**: Shows $10 off offer
6. **Action**: Click "Get $10 off"
7. **Expected**: Returns to profile, subscription updated
8. **Action**: Or click "No thanks"
9. **Expected**: Goes to reason selection

### Scenario 3: Job Found Journey
1. **Action**: Click "Yes, I've found a job"
2. **Expected**: Job found form appears
3. **Action**: Select "Yes, I found it through Migrate Mate"
4. **Expected**: Feedback form appears
5. **Action**: Fill feedback and continue
6. **Expected**: Success message appears

### Scenario 4: Error Handling
1. **Setup**: Disconnect database
2. **Action**: Try to access cancellation flow
3. **Expected**: Graceful fallback, mock data used
4. **Action**: Complete flow
5. **Expected**: Flow continues without errors

## 🔧 Testing Tools

### Browser Developer Tools
```javascript
// Check A/B variant assignment
console.log('Current variant:', window.abVariant)

// Check subscription data
console.log('Subscription:', window.userSubscription)

// Check analytics events
console.log('Analytics events:', window.analyticsEvents)
```

### Database Testing
```sql
-- Check cancellation records
SELECT * FROM cancellations WHERE user_id = 'your-test-user-id';

-- Check subscription status
SELECT * FROM subscriptions WHERE user_id = 'your-test-user-id';

-- Check A/B variant distribution
SELECT downsell_variant, COUNT(*) 
FROM cancellations 
GROUP BY downsell_variant;
```

### Network Testing
```bash
# Test with slow network
# Use Chrome DevTools → Network → Slow 3G

# Test offline functionality
# Use Chrome DevTools → Application → Service Workers → Offline
```

## 📊 Performance Testing

### Load Testing
```bash
# Test component render times
npm run test:coverage

# Check bundle size
npm run analyze

# Test memory usage
# Use Chrome DevTools → Performance → Memory
```

### Responsive Testing
```bash
# Test different screen sizes
# Use Chrome DevTools → Device Toolbar
# Test: 320px, 768px, 1024px, 1440px
```

## 🐛 Debugging

### Common Issues
1. **A/B Testing Not Working**
   - Check environment variables
   - Verify database connection
   - Check browser console for errors

2. **Database Errors**
   - Check Supabase configuration
   - Verify RLS policies
   - Check network connectivity

3. **Styling Issues**
   - Check Tailwind CSS compilation
   - Verify responsive breakpoints
   - Check CSS module imports

### Debug Commands
```bash
# Check TypeScript errors
npm run type-check

# Check linting errors
npm run lint

# Check build errors
npm run build

# Check test coverage
npm run test:coverage
```

## 📈 Analytics Testing

### Event Tracking
```javascript
// Check if events are being tracked
window.addEventListener('analytics', (event) => {
  console.log('Analytics event:', event.detail);
});
```

### A/B Test Tracking
```javascript
// Check A/B test events
window.addEventListener('ab-test', (event) => {
  console.log('A/B test event:', event.detail);
});
```

## ✅ Final Verification

Before considering the implementation complete, verify:

1. **All automated tests pass** ✅
2. **Manual testing scenarios completed** ✅
3. **Responsive design works on all devices** ✅
4. **Accessibility requirements met** ✅
5. **Security measures implemented** ✅
6. **Performance benchmarks met** ✅
7. **Error handling works correctly** ✅
8. **Analytics tracking functional** ✅

## 🚀 Production Readiness

The implementation is ready for production when:

- [ ] All tests pass with >70% coverage
- [ ] No critical security vulnerabilities
- [ ] Performance meets requirements
- [ ] Error handling is robust
- [ ] Documentation is complete
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Monitoring and alerting set up

---

**Happy Testing! 🎉**
