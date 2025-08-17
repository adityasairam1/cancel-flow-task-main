// src/lib/payment-stub.ts
// Simple payment stub for downsell processing

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string | null;
}

/**
 * Simple payment stub for downsell processing
 * This is just a stub - no real payment processing
 */
export async function processDownsellPayment(
  _userId: string, 
  _originalPrice: number, 
  _downsellPrice: number
): Promise<PaymentResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Always succeed for stub
  return {
    success: true,
    transactionId: `mock-transaction-${Date.now()}`,
    error: null
  };
}

/**
 * Update subscription price after successful downsell payment
 */
export async function updateSubscriptionPrice(
  userId: string,
  newPrice: number
): Promise<boolean> {
  try {
    // In a real implementation, this would update the subscription in the database
    // and potentially notify the payment processor of the price change
    
    console.log('STUB: Subscription price updated', {
      userId,
      newPrice: `$${(newPrice / 100).toFixed(2)}`
    });
    
    // Simulate successful update
    return true;
  } catch (error) {
    console.error('STUB: Error updating subscription price:', error);
    return false;
  }
}

