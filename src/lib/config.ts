// src/lib/config.ts
// Centralized configuration system for dynamic application settings

export interface AppConfig {
  // Application
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  
  // Feature Flags
  enableABTesting: boolean;
  enableAnalytics: boolean;
  enableFeedback: boolean;
  
  // Pricing
  defaultMonthlyPrice: number;
  downsellDiscountAmount: number;
  abTestSplit: number;
  
  // UI Colors
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  errorColor: string;
  
  // Analytics
  googleAnalyticsId?: string;
  mixpanelToken?: string;
  
  // Content Management
  contentApiUrl?: string;
  contentApiKey?: string;
  
  // Cancellation Reasons (Configurable)
  cancellationReasons: CancellationReason[];
  
  // Offers (Configurable)
  offers: Offer[];
  
  // Validation Rules
  validation: ValidationRules;
}

export interface CancellationReason {
  id: string;
  label: string;
  requiresFeedback: boolean;
  requiresAmount: boolean;
  feedbackPlaceholder?: string;
  amountPlaceholder?: string;
  minFeedbackLength?: number;
}

export interface Offer {
  id: string;
  label: string;
  discountPercentage: number;
  discountAmount: number;
  description: string;
  isActive: boolean;
  variant: 'A' | 'B' | 'both';
}

export interface ValidationRules {
  minFeedbackLength: number;
  maxFeedbackLength: number;
  minAmount: number;
  maxAmount: number;
  requiredFields: string[];
}

// Default configuration
const defaultConfig: AppConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Migrate Mate',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: (process.env.NEXT_PUBLIC_APP_ENV as 'development' | 'staging' | 'production') || 'development',
  
  enableABTesting: process.env.NEXT_PUBLIC_ENABLE_AB_TESTING === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableFeedback: process.env.NEXT_PUBLIC_ENABLE_FEEDBACK === 'true',
  
  defaultMonthlyPrice: parseInt(process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE || '2500'),
  downsellDiscountAmount: parseInt(process.env.NEXT_PUBLIC_DOWSELL_DISCOUNT_AMOUNT || '1000'),
  abTestSplit: parseFloat(process.env.NEXT_PUBLIC_AB_TEST_SPLIT || '0.5'),
  
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#8952fc',
  secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#7b40fc',
  successColor: process.env.NEXT_PUBLIC_SUCCESS_COLOR || '#10b981',
  errorColor: process.env.NEXT_PUBLIC_ERROR_COLOR || '#ef4444',
  
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  
  contentApiUrl: process.env.NEXT_PUBLIC_CONTENT_API_URL,
  contentApiKey: process.env.NEXT_PUBLIC_CONTENT_API_KEY,
  
  cancellationReasons: [
    {
      id: 'too-expensive',
      label: 'Too expensive',
      requiresFeedback: false,
      requiresAmount: true,
      amountPlaceholder: '0.00'
    },
    {
      id: 'platform-not-helpful',
      label: 'Platform not helpful',
      requiresFeedback: true,
      requiresAmount: false,
      feedbackPlaceholder: 'What can we change to make the platform more helpful?',
      minFeedbackLength: 25
    },
    {
      id: 'not-enough-jobs',
      label: 'Not enough relevant jobs',
      requiresFeedback: true,
      requiresAmount: false,
      feedbackPlaceholder: 'In which way can we make the jobs more relevant?',
      minFeedbackLength: 25
    },
    {
      id: 'decided-not-to-move',
      label: 'Decided not to move',
      requiresFeedback: true,
      requiresAmount: false,
      feedbackPlaceholder: 'What changed for you to decide to not move?',
      minFeedbackLength: 25
    },
    {
      id: 'other',
      label: 'Other',
      requiresFeedback: true,
      requiresAmount: false,
      feedbackPlaceholder: 'What would have helped you the most?',
      minFeedbackLength: 25
    }
  ],
  
  offers: [
    {
      id: '50-percent-off',
      label: 'Get 50% off',
      discountPercentage: 50,
      discountAmount: 1250, // $12.50
      description: 'Limited time offer - 50% off your subscription',
      isActive: true,
      variant: 'both'
    },
    {
      id: '10-dollar-off',
      label: 'Get $10 off',
      discountPercentage: 40,
      discountAmount: 1000, // $10.00
      description: 'Special discount for you',
      isActive: true,
      variant: 'B'
    }
  ],
  
  validation: {
    minFeedbackLength: 25,
    maxFeedbackLength: 1000,
    minAmount: 0,
    maxAmount: 10000,
    requiredFields: ['reason']
  }
};

// Configuration instance
let config: AppConfig = defaultConfig;

// Configuration management functions
export function getConfig(): AppConfig {
  return config;
}

export function updateConfig(newConfig: Partial<AppConfig>): void {
  config = { ...config, ...newConfig };
}

export function getCancellationReason(id: string): CancellationReason | undefined {
  return config.cancellationReasons.find(reason => reason.id === id);
}

export function getActiveOffers(variant?: 'A' | 'B'): Offer[] {
  return config.offers.filter(offer => 
    offer.isActive && (offer.variant === 'both' || offer.variant === variant)
  );
}

export function getPrimaryOffer(variant?: 'A' | 'B'): Offer | undefined {
  const activeOffers = getActiveOffers(variant);
  return activeOffers[0]; // Return first active offer
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateDiscountedPrice(originalPrice: number, discountAmount: number): number {
  return Math.max(originalPrice - discountAmount, 0);
}

// Dynamic content loading (for future CMS integration)
export async function loadDynamicContent(): Promise<void> {
  if (!config.contentApiUrl) {
    return;
  }
  
  try {
    const response = await fetch(`${config.contentApiUrl}/content`, {
      headers: {
        'Authorization': `Bearer ${config.contentApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const content = await response.json();
      // Update config with dynamic content
      if (content.cancellationReasons) {
        config.cancellationReasons = content.cancellationReasons;
      }
      if (content.offers) {
        config.offers = content.offers;
      }
    }
  } catch (error) {
    console.warn('Failed to load dynamic content:', error);
  }
}

export default config;

