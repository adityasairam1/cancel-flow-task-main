// src/middleware.ts
// Global security middleware for Next.js

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from '@/lib/rate-limiter';
import { getClientIP } from '@/lib/rate-limiter';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Basic rate limiting for all requests
  const clientIP = getClientIP(request);
  const rateLimitResult = rateLimiters.api.check(clientIP);

  if (!rateLimitResult.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimiters.api.config.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  // 2. Add rate limit headers to all responses
  response.headers.set('X-RateLimit-Limit', rateLimiters.api.config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

  // 3. Security headers (additional to next.config.js)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('X-Document-Policy', 'force-load-at-top');

  // 4. Block suspicious user agents
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /perl/i,
    /ruby/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !userAgent.includes('Mozilla') && !userAgent.includes('Chrome') && !userAgent.includes('Safari') && !userAgent.includes('Firefox')) {
    return new NextResponse(
      JSON.stringify({
        error: 'Access denied',
        message: 'Automated access not allowed'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  // 5. Validate request method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Method not allowed',
        message: 'HTTP method not supported'
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  // 6. Block requests with suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-forwarded-server',
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];

  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header);
    if (value && (value.includes('localhost') || value.includes('127.0.0.1') || value.includes('::1'))) {
      return new NextResponse(
        JSON.stringify({
          error: 'Access denied',
          message: 'Invalid request headers'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  // 7. Add request ID for tracking
  const requestId = generateRequestId();
  response.headers.set('X-Request-ID', requestId);

  // 8. Log security events
  if (process.env.NODE_ENV === 'production') {
    console.log(`[SECURITY] ${request.method} ${request.url} - IP: ${clientIP} - UA: ${userAgent.substring(0, 100)}`);
  }

  return response;
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
