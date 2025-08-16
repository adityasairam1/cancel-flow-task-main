// src/lib/rate-limiter.ts
// Rate limiting utility for protecting against brute force attacks

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes default
      maxRequests: 100, // 100 requests per window default
      keyGenerator: (req: NextRequest) => req.ip || 'unknown',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  // Check if request is allowed
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();
    
    const now = Date.now();
    
    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: this.store[key].resetTime
      };
    }

    // Reset if window has passed
    if (this.store[key].resetTime <= now) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: this.store[key].resetTime
      };
    }

    // Check if limit exceeded
    if (this.store[key].count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime
      };
    }

    // Increment count
    this.store[key].count++;
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime
    };
  }

  // Reset rate limit for a key
  reset(key: string): void {
    delete this.store[key];
  }

  // Get current status for a key
  getStatus(key: string): { count: number; remaining: number; resetTime: number } | null {
    this.cleanup();
    
    if (!this.store[key]) {
      return null;
    }

    return {
      count: this.store[key].count,
      remaining: Math.max(0, this.config.maxRequests - this.store[key].count),
      resetTime: this.store[key].resetTime
    };
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // 100 requests per 15 minutes
  }),

  // Authentication rate limiting (stricter)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 login attempts per 15 minutes
  }),

  // Cancellation flow rate limiting
  cancellation: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10 // 10 cancellation attempts per hour
  }),

  // Feedback submission rate limiting
  feedback: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5 // 5 feedback submissions per hour
  })
};

// Utility function to get client IP
export function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         req.ip ||
         'unknown';
}

// Rate limiting middleware for Next.js API routes
export function withRateLimit(
  handler: (req: NextRequest, res: NextResponse) => Promise<NextResponse>,
  limiter: RateLimiter = rateLimiters.api,
  keyGenerator?: (req: NextRequest) => string
) {
  return async (req: NextRequest, res: NextResponse) => {
    const key = keyGenerator ? keyGenerator(req) : getClientIP(req);
    const result = limiter.check(key);

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limiter.config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    return handler(req, res);
  };
}

export default RateLimiter;
