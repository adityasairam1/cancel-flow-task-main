// src/lib/ab-testing.ts
// Deterministic A/B testing implementation for subscription cancellation flow

export type ABVariant = 'A' | 'B';

interface ABTestResult {
  variant: ABVariant;
  isNewAssignment: boolean;
}

/**
 * Get or assign A/B test variant for a user
 * Uses cryptographically secure RNG for new assignments
 * Simplified to use localStorage for persistence as required
 */
export async function getOrAssignVariant(userId: string): Promise<ABTestResult> {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const storageKey = `ab-variant-${userId}`;
      const existingVariant = localStorage.getItem(storageKey);
      
      if (existingVariant && (existingVariant === 'A' || existingVariant === 'B')) {
        return {
          variant: existingVariant as ABVariant,
          isNewAssignment: false
        };
      }
      
      // Generate new variant using cryptographically secure RNG
      const variant = generateSecureVariant();
      
      // Store in localStorage for persistence
      localStorage.setItem(storageKey, variant);
      
      console.log('New A/B variant assigned:', { userId, variant });
      
      return {
        variant,
        isNewAssignment: true
      };
    }
    
    // Server-side fallback
    const variant = generateSecureVariant();
    return {
      variant,
      isNewAssignment: true
    };

  } catch (error) {
    console.error('A/B testing error:', error);
    // Fallback to variant A in case of error
    return {
      variant: 'A',
      isNewAssignment: false
    };
  }
}

/**
 * Generate cryptographically secure A/B variant
 * Uses window.crypto.getRandomValues() for secure randomness
 */
function generateSecureVariant(): ABVariant {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    // Use cryptographically secure random number generator
    const array = new Uint8Array(1);
    window.crypto.getRandomValues(array);
    // 50/50 split: 0-127 = A, 128-255 = B
    return array[0] < 128 ? 'A' : 'B';
  } else {
    // Fallback for server-side or environments without crypto
    // Note: This is less secure but provides a fallback
    return Math.random() < 0.5 ? 'A' : 'B';
  }
}

/**
 * Get user's current subscription details for A/B testing
 * Simplified to return mock data as required
 */
export async function getUserSubscription(userId: string) {
  // Return mock subscription data as required
  return {
    id: 'mock-subscription-id',
    user_id: userId,
    monthly_price: 2500, // $25.00
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Calculate downsell price based on variant and current price
 */
export function calculateDownsellPrice(currentPrice: number, variant: ABVariant): number {
  if (variant === 'A') {
    // Variant A: No downsell, return original price
    return currentPrice;
  } else {
    // Variant B: $10 off
    return Math.max(currentPrice - 1000, 0); // Subtract 1000 cents ($10)
  }
}

/**
 * Format price from cents to dollars for display
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
