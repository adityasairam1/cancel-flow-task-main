// src/app/api/cancellation/route.ts
// Secure API route for handling cancellation requests

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimiters, getClientIP } from '@/lib/rate-limiter';
import { InputSanitizer } from '@/lib/input-sanitizer';
import { csrfProtection } from '@/lib/csrf-protection';
import { handleCancellationCompletion } from '@/lib/database-operations';
import { analytics } from '@/lib/analytics';

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

    // 6. Track analytics
    analytics.trackCancellationComplete(
      sanitizedData.reason,
      false,
      {
        variant: sanitizedData.variant,
        userId: sanitizedData.userId,
        amount: sanitizedData.amount
      }
    );

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

// Export the handler wrapped with security middleware
export const POST = withRateLimit(
  csrfProtection.middleware(handleCancellation),
  cancellationRateLimiter,
  getClientIP
);

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
