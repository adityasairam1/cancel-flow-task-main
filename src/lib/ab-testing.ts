// src/lib/ab-testing.ts
// Deterministic A/B testing implementation for subscription cancellation flow

import { supabase } from './supabase';

export type ABVariant = 'A' | 'B';

interface ABTestResult {
  variant: ABVariant;
  isNewAssignment: boolean;
}

/**
 * Get or assign A/B test variant for a user
 * Uses cryptographically secure RNG for new assignments
 * Always returns the same variant for repeat visits
 */
export async function getOrAssignVariant(userId: string): Promise<ABTestResult> {
  try {
    // First, check if user already has a variant assigned
    const { data: existingCancellation, error: fetchError } = await supabase
      .from('cancellations')
      .select('downsell_variant')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing variant:', fetchError);
      // If it's a connection error, use mock data
      if (fetchError.message?.includes('fetch') || fetchError.message?.includes('network')) {
        console.warn('Database connection failed, using mock variant assignment');
        return {
          variant: generateSecureVariant(),
          isNewAssignment: true
        };
      }
      throw fetchError;
    }

    // If user already has a variant, return it
    if (existingCancellation && existingCancellation.length > 0) {
      return {
        variant: existingCancellation[0].downsell_variant as ABVariant,
        isNewAssignment: false
      };
    }

    // Generate new variant using cryptographically secure RNG
    const variant = generateSecureVariant();
    
    // Create a new cancellation record with the assigned variant
    const { error: insertError } = await supabase
      .from('cancellations')
      .insert({
        user_id: userId,
        downsell_variant: variant,
        accepted_downsell: false,
        reason: null
      });

    if (insertError) {
      console.error('Error persisting variant:', insertError);
      // If it's a connection error, still return the variant but don't persist
      if (insertError.message?.includes('fetch') || insertError.message?.includes('network')) {
        console.warn('Database connection failed, returning variant without persistence');
        return {
          variant,
          isNewAssignment: true
        };
      }
      throw insertError;
    }

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
 * This function is now deprecated in favor of the one in database-operations.ts
 * Keeping for backward compatibility
 */
export async function getUserSubscription(userId: string) {
  // Import the function from database-operations to avoid duplication
  const { getUserSubscription: getSubscription } = await import('./database-operations');
  return getSubscription(userId);
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
