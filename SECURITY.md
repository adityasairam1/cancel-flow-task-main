# Security Implementation Guide

This document outlines the comprehensive security features implemented in the Migrate Mate cancellation flow application.

## 🔒 Security Features Overview

### 1. **Rate Limiting** ✅
- **Global rate limiting**: 100 requests per 15 minutes per IP
- **Endpoint-specific limits**: 
  - Authentication: 5 attempts per 15 minutes
  - Cancellation: 10 attempts per hour
  - Feedback: 5 submissions per hour
- **Automatic cleanup**: Expired entries are automatically removed
- **Rate limit headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### 2. **Input Sanitization** ✅
- **XSS Protection**: Uses DOMPurify for comprehensive sanitization
- **HTML stripping**: Removes all HTML tags from text inputs
- **Pattern validation**: Regex patterns for email, amount, user ID, etc.
- **Malicious content detection**: Blocks script tags, event handlers, and dangerous protocols
- **Type-specific sanitization**: Different rules for different input types

### 3. **CSRF Protection** ✅
- **Token generation**: Cryptographically secure random tokens
- **Cookie-based storage**: HttpOnly, Secure, SameSite cookies
- **Timing-safe comparison**: Prevents timing attacks
- **Automatic validation**: Middleware validates all non-GET requests
- **Form integration**: Hidden fields for form submissions

### 4. **Security Headers** ✅
- **Content Security Policy**: Comprehensive CSP with allowed sources
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **Strict-Transport-Security**: HSTS with preload
- **Referrer Policy**: strict-origin-when-cross-origin
- **Permissions Policy**: Restricts camera, microphone, geolocation, payment
- **X-XSS-Protection**: Legacy XSS protection

### 5. **Global Security Middleware** ✅
- **Request validation**: Validates HTTP methods and headers
- **Bot detection**: Blocks suspicious user agents
- **IP validation**: Prevents localhost spoofing
- **Request tracking**: Unique request IDs for monitoring
- **Security logging**: Logs security events in production

## 🛠️ Implementation Details

### Rate Limiting Configuration

```typescript
// src/lib/rate-limiter.ts
export const rateLimiters = {
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  }),
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // Stricter for auth
  }),
  cancellation: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10
  })
};
```

### Input Sanitization Usage

```typescript
// Sanitize text input
const cleanText = InputSanitizer.sanitizeText(userInput);

// Sanitize email
const cleanEmail = InputSanitizer.sanitizeEmail(userEmail);

// Sanitize object with schema
const sanitizedData = InputSanitizer.sanitizeObject(data, {
  userId: 'userId',
  feedback: 'feedback',
  amount: 'amount'
});
```

### CSRF Protection Usage

```typescript
// Generate token for forms
const { token, field } = csrfProtection.generateFormToken();

// Validate in API route
const isValid = csrfProtection.verifyToken(providedToken, storedToken);
```

### Security Headers Configuration

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Content-Security-Policy', value: 'default-src \'self\'; ...' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }
      ]
    }
  ];
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Security Configuration
CSRF_SECRET=your_csrf_secret_key_here_minimum_64_characters
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Dependencies

```json
{
  "dompurify": "^3.0.9"
}
```

## 🚨 Security Testing

### Rate Limiting Test

```bash
# Test rate limiting
for i in {1..110}; do
  curl -X POST http://localhost:3000/api/cancellation \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'
done
```

### XSS Protection Test

```bash
# Test XSS protection
curl -X POST http://localhost:3000/api/cancellation \
  -H "Content-Type: application/json" \
  -d '{"feedback": "<script>alert(\"xss\")</script>"}'
```

### CSRF Protection Test

```bash
# Test CSRF protection (should fail without token)
curl -X POST http://localhost:3000/api/cancellation \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📊 Security Monitoring

### Logs to Monitor

1. **Rate limit violations**: 429 responses
2. **CSRF failures**: 403 responses with CSRF errors
3. **Malicious content**: 400 responses with validation errors
4. **Suspicious user agents**: 403 responses for bots
5. **Security headers**: Verify headers are present

### Metrics to Track

- Rate limit hit rate
- CSRF token validation failures
- Input sanitization rejections
- Security header compliance
- Bot detection rate

## 🔄 Security Updates

### Regular Maintenance

1. **Update dependencies**: Monthly security updates
2. **Review rate limits**: Adjust based on usage patterns
3. **Monitor logs**: Check for new attack patterns
4. **Update CSP**: Add new domains as needed
5. **Rotate secrets**: Quarterly CSRF secret rotation

### Incident Response

1. **Immediate actions**:
   - Block suspicious IPs
   - Increase rate limits temporarily
   - Review security logs
   - Update security rules

2. **Post-incident**:
   - Analyze attack patterns
   - Update security configurations
   - Document lessons learned
   - Implement additional protections

## ✅ Security Checklist

- [ ] Rate limiting configured and tested
- [ ] Input sanitization implemented for all user inputs
- [ ] CSRF protection enabled for all forms
- [ ] Security headers properly configured
- [ ] Global middleware active
- [ ] Environment variables secured
- [ ] Dependencies up to date
- [ ] Security monitoring in place
- [ ] Incident response plan ready
- [ ] Regular security audits scheduled

## 🆘 Emergency Contacts

- **Security Team**: security@migratemate.co
- **DevOps Team**: devops@migratemate.co
- **Emergency Hotline**: +1-XXX-XXX-XXXX

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Security Level**: Production Ready
