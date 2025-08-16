// src/lib/csrf-protection.ts
// CSRF protection middleware for Next.js

import { NextRequest, NextResponse } from 'next/server';
import { InputSanitizer } from './input-sanitizer';

interface CSRFConfig {
  secret: string;
  tokenLength: number;
  cookieName: string;
  headerName: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
}

class CSRFProtection {
  private config: CSRFConfig;

  constructor(config?: Partial<CSRFConfig>) {
    this.config = {
      secret: process.env.CSRF_SECRET || InputSanitizer.generateSecureToken(64),
      tokenLength: 32,
      cookieName: 'csrf-token',
      headerName: 'x-csrf-token',
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      },
      ...config
    };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    return InputSanitizer.generateSecureToken(this.config.tokenLength);
  }

  /**
   * Verify CSRF token
   */
  verifyToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) {
      return false;
    }

    // Use timing-safe comparison to prevent timing attacks
    return this.timingSafeEqual(token, storedToken);
  }

  /**
   * Timing-safe string comparison
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Get CSRF token from request
   */
  async getTokenFromRequest(req: NextRequest): Promise<string | null> {
    // Try to get token from header first
    const headerToken = req.headers.get(this.config.headerName);
    if (headerToken) {
      return InputSanitizer.sanitizeText(headerToken);
    }

    // Try to get token from form data
    try {
      const formData = await req.formData();
      const formToken = formData.get('csrf_token');
      if (formToken && typeof formToken === 'string') {
        return InputSanitizer.sanitizeText(formToken);
      }
    } catch {
      // FormData not available or invalid
    }

    // Try to get token from query parameters
    const queryToken = req.nextUrl.searchParams.get('csrf_token');
    if (queryToken) {
      return InputSanitizer.sanitizeText(queryToken);
    }

    return null;
  }

  /**
   * Get stored CSRF token from cookies
   */
  getStoredToken(req: NextRequest): string | null {
    const cookie = req.cookies.get(this.config.cookieName);
    return cookie?.value || null;
  }

  /**
   * Set CSRF token in response
   */
  setTokenInResponse(res: NextResponse, token: string): NextResponse {
    res.cookies.set(this.config.cookieName, token, this.config.cookieOptions);
    return res;
  }

  /**
   * CSRF middleware for API routes
   */
  middleware(handler: (req: NextRequest, res: NextResponse) => Promise<NextResponse>) {
    return async (req: NextRequest, res: NextResponse) => {
      // Skip CSRF check for GET requests
      if (req.method === 'GET') {
        // Generate and set new token for GET requests
        const token = this.generateToken();
        const response = await handler(req, res);
        return this.setTokenInResponse(response, token);
      }

      // For non-GET requests, verify CSRF token
      const providedToken = await this.getTokenFromRequest(req);
      const storedToken = this.getStoredToken(req);

      if (!this.verifyToken(providedToken || '', storedToken || '')) {
        return NextResponse.json(
          {
            error: 'CSRF token validation failed',
            message: 'Invalid or missing CSRF token'
          },
          { status: 403 }
        );
      }

      // Token is valid, proceed with handler
      return handler(req, res);
    };
  }

  /**
   * Generate CSRF token for forms
   */
  generateFormToken(): { token: string; field: string } {
    const token = this.generateToken();
    return {
      token,
      field: `<input type="hidden" name="csrf_token" value="${token}" />`
    };
  }

  /**
   * Validate CSRF token for forms
   */
  validateFormToken(formData: FormData): boolean {
    const token = formData.get('csrf_token');
    if (!token || typeof token !== 'string') {
      return false;
    }

    // In a real implementation, you'd compare against the stored token
    // For now, we'll just validate the format
    return token.length === this.config.tokenLength && /^[A-Za-z0-9]+$/.test(token);
  }
}

// Create default CSRF protection instance
export const csrfProtection = new CSRFProtection();

// Utility functions
export const csrf = {
  generateToken: () => csrfProtection.generateToken(),
  verifyToken: (token: string, storedToken: string) => csrfProtection.verifyToken(token, storedToken),
  middleware: (handler: (req: NextRequest, res: NextResponse) => Promise<NextResponse>) => csrfProtection.middleware(handler),
  generateFormToken: () => csrfProtection.generateFormToken(),
  validateFormToken: (formData: FormData) => csrfProtection.validateFormToken(formData)
};

export default CSRFProtection;
