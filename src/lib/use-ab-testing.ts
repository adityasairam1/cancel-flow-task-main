// src/lib/use-ab-testing.ts
// Custom hook for managing A/B testing state

import { useState, useEffect, useCallback } from 'react';
import { getOrAssignVariant, calculateDownsellPrice, type ABVariant } from './ab-testing';
import { getUserSubscription } from './database-operations';

interface ABTestingState {
  variant: ABVariant | null;
  userSubscription: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isLoading: boolean;
  error: string | null;
  downsellPrice: number | null;
}

export function useABTesting(userId: string) {
  const [state, setState] = useState<ABTestingState>({
    variant: null,
    userSubscription: null,
    isLoading: true,
    error: null,
    downsellPrice: null
  });

  const initializeABTesting = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get or assign A/B variant
      const variantResult = await getOrAssignVariant(userId);
      
      // Get user subscription details
      const subscription = await getUserSubscription(userId);
      
      // Calculate downsell price
      const downsellPrice = subscription 
        ? calculateDownsellPrice(subscription.monthly_price, variantResult.variant)
        : null;

      setState({
        variant: variantResult.variant,
        userSubscription: subscription,
        isLoading: false,
        error: null,
        downsellPrice
      });

      console.log('A/B Testing initialized:', {
        variant: variantResult.variant,
        isNewAssignment: variantResult.isNewAssignment,
        subscription: subscription,
        downsellPrice: downsellPrice
      });

    } catch (error) {
      console.error('Error initializing A/B testing:', error);
      setState({
        variant: 'A', // Fallback to variant A
        userSubscription: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        downsellPrice: null
      });
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setState(prev => ({ ...prev, isLoading: false, error: 'No user ID provided' }));
      return;
    }

    initializeABTesting();
  }, [userId, initializeABTesting]);

  const refreshABTesting = () => {
    initializeABTesting();
  };

  return {
    ...state,
    refreshABTesting
  };
}
