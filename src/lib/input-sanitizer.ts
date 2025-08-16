// src/lib/input-sanitizer.ts
// Input sanitization utility for XSS protection and data validation

/* eslint-disable @typescript-eslint/no-explicit-any */
import DOMPurify from 'dompurify';

// Sanitization options for different content types
const sanitizeOptions = {
  ALLOWED_TAGS: [], // No HTML tags allowed by default
  ALLOWED_ATTR: [], // No attributes allowed by default
  KEEP_CONTENT: true, // Keep text content
  RETURN_DOM: false, // Return string, not DOM
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onresize', 'onabort', 'onbeforeunload', 'onerror', 'onhashchange', 'onmessage', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate', 'onstorage', 'oncontextmenu', 'oninput', 'oninvalid', 'onsearch']
};

// HTML content sanitization options (for rich text)
const htmlSanitizeOptions = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onresize', 'onabort', 'onbeforeunload', 'onerror', 'onhashchange', 'onmessage', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate', 'onstorage', 'oncontextmenu', 'oninput', 'oninvalid', 'onsearch']
};

// Validation patterns
const validationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  amount: /^\d+(\.\d{1,2})?$/,
  userId: /^[a-zA-Z0-9\-_]{1,50}$/,
  feedback: /^[\w\s\.,!?@#$%^&*()\[\]{}|\\:;"'<>\/\-_+=~`]+$/,
  reason: /^[a-zA-Z0-9\s\-_]+$/
};

// Input sanitization class
export class InputSanitizer {
  /**
   * Sanitize plain text input (removes all HTML)
   */
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove HTML tags and decode entities
    const sanitized = DOMPurify.sanitize(input, sanitizeOptions);
    
    // Additional cleaning for common XSS patterns
    return sanitized
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Sanitize HTML content (allows safe HTML tags)
   */
  static sanitizeHTML(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    return DOMPurify.sanitize(input, htmlSanitizeOptions);
  }

  /**
   * Validate and sanitize email address
   */
  static sanitizeEmail(input: string): string | null {
    const sanitized = this.sanitizeText(input).toLowerCase();
    
    if (!validationPatterns.email.test(sanitized)) {
      return null;
    }
    
    return sanitized;
  }

  /**
   * Validate and sanitize amount (currency)
   */
  static sanitizeAmount(input: string): number | null {
    const sanitized = this.sanitizeText(input);
    
    if (!validationPatterns.amount.test(sanitized)) {
      return null;
    }
    
    const amount = parseFloat(sanitized);
    return isNaN(amount) || amount < 0 ? null : amount;
  }

  /**
   * Validate and sanitize user ID
   */
  static sanitizeUserId(input: string): string | null {
    const sanitized = this.sanitizeText(input);
    
    if (!validationPatterns.userId.test(sanitized)) {
      return null;
    }
    
    return sanitized;
  }

  /**
   * Validate and sanitize feedback text
   */
  static sanitizeFeedback(input: string, minLength: number = 25, maxLength: number = 1000): string | null {
    const sanitized = this.sanitizeText(input);
    
    if (sanitized.length < minLength || sanitized.length > maxLength) {
      return null;
    }
    
    // Check for suspicious patterns
    if (sanitized.includes('<script') || sanitized.includes('javascript:') || sanitized.includes('data:')) {
      return null;
    }
    
    return sanitized;
  }

  /**
   * Validate and sanitize cancellation reason
   */
  static sanitizeReason(input: string): string | null {
    const sanitized = this.sanitizeText(input);
    
    if (!validationPatterns.reason.test(sanitized)) {
      return null;
    }
    
    return sanitized;
  }

  /**
   * Sanitize object with multiple fields
   */
  static sanitizeObject<T extends Record<string, unknown>>(obj: T, schema: Record<string, 'text' | 'email' | 'amount' | 'userId' | 'feedback' | 'reason' | 'html'>): Partial<T> {
    const sanitized = {} as Partial<T>;
    
    for (const [key, type] of Object.entries(schema)) {
      if (obj[key] !== undefined && obj[key] !== null) {
        const value = obj[key] as string;
        switch (type) {
          case 'text':
            (sanitized as any)[key] = this.sanitizeText(value);
            break;
          case 'email':
            (sanitized as any)[key] = this.sanitizeEmail(value);
            break;
          case 'amount':
            (sanitized as any)[key] = this.sanitizeAmount(value);
            break;
          case 'userId':
            (sanitized as any)[key] = this.sanitizeUserId(value);
            break;
          case 'feedback':
            (sanitized as any)[key] = this.sanitizeFeedback(value);
            break;
          case 'reason':
            (sanitized as any)[key] = this.sanitizeReason(value);
            break;
          case 'html':
            (sanitized as any)[key] = this.sanitizeHTML(value);
            break;
        }
      }
    }
    
    return sanitized;
  }

  /**
   * Check if input contains potentially malicious content
   */
  static isMalicious(input: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Generate a secure random string
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      // Use cryptographically secure random number generator
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        result += chars.charAt(array[i] % chars.length);
      }
    } else {
      // Fallback for server-side or environments without crypto
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    return result;
  }
}

// Utility functions for common sanitization tasks
export const sanitize = {
  text: InputSanitizer.sanitizeText,
  html: InputSanitizer.sanitizeHTML,
  email: InputSanitizer.sanitizeEmail,
  amount: InputSanitizer.sanitizeAmount,
  userId: InputSanitizer.sanitizeUserId,
  feedback: InputSanitizer.sanitizeFeedback,
  reason: InputSanitizer.sanitizeReason,
  object: InputSanitizer.sanitizeObject,
  isMalicious: InputSanitizer.isMalicious,
  generateToken: InputSanitizer.generateSecureToken
};

export default InputSanitizer;
