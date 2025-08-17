// src/app/api/cancellation/route.ts
// Secure API route for handling cancellation requests

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters, getClientIP } from '@/lib/rate-limiter';
import { InputSanitizer } from '@/lib/input-sanitizer';
import { csrfProtection } from '@/lib/csrf-protection';
import { handleCancellationCompletion } from '@/lib/database-operations';

// Rate limiting configuration for cancellation endpoint
const cancellationRateLimiter = rateLimiters.cancellation;

// Input validation schema
const cancellationSchema = {
  userId: 'userId',
  variant: 'text',
  reason: 'reason',
  amount: 'amount',
  feedback: 'feedback'
} as const;

// Secure cancellation handler with all security features
async function handleCancellation(req: NextRequest) {
  try {
    // 1. CSRF Protection (handled by middleware)
    
    // 2. Input Sanitization
    const body = await req.json();
    
    // Sanitize all input fields
    const sanitizedData = InputSanitizer.sanitizeObject(body, cancellationSchema);
    
    // Validate required fields
    if (!sanitizedData.userId || !sanitizedData.variant || !sanitizedData.reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Additional validation
    if (!['A', 'B'].includes(sanitizedData.variant)) {
      return NextResponse.json(
        { error: 'Invalid variant' },
        { status: 400 }
      );
    }

    // 4. Check for malicious content
    if (InputSanitizer.isMalicious(sanitizedData.feedback || '')) {
      return NextResponse.json(
        { error: 'Malicious content detected' },
        { status: 400 }
      );
    }

    // 5. Process cancellation
    const result = await handleCancellationCompletion(
      sanitizedData.userId,
      sanitizedData.variant as 'A' | 'B',
      sanitizedData.reason,
      sanitizedData.amount?.toString(),
      sanitizedData.feedback
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to process cancellation' },
        { status: 500 }
      );
    }

    // 6. Log cancellation completion
    console.log('Cancellation completed:', {
      reason: sanitizedData.reason,
      variant: sanitizedData.variant,
      userId: sanitizedData.userId,
      amount: sanitizedData.amount
    });

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: 'Cancellation processed successfully',
      data: {
        userId: sanitizedData.userId,
        variant: sanitizedData.variant,
        reason: sanitizedData.reason
      }
    });

  } catch (error) {
    console.error('Cancellation API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler with basic rate limiting
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(req);
  const rateLimitResult = cancellationRateLimiter.check(clientIP);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    }, { status: 429 });
  }

  // Call the handler function
  const response = await handleCancellation(req);
  
  // Create a new response with the same body and status, but with rate limit headers
  const responseWithHeaders = NextResponse.json(
    await response.json(),
    { status: response.status }
  );
  
  // Add rate limit headers
  responseWithHeaders.headers.set('X-RateLimit-Limit', cancellationRateLimiter.config.maxRequests.toString());
  responseWithHeaders.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  responseWithHeaders.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
  
  return responseWithHeaders;
}

// GET endpoint for CSRF token generation
export async function GET() {
  try {
    // Generate new CSRF token
    const token = csrfProtection.generateToken();
    
    // Create response with token
    const response = NextResponse.json({
      success: true,
      csrfToken: token
    });
    
    // Set token in secure cookie
    return csrfProtection.setTokenInResponse(response, token);
    
  } catch (error) {
    console.error('CSRF token generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
