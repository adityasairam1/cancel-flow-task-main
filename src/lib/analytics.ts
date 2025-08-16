// src/lib/analytics.ts
// Analytics system for tracking user interactions and A/B test performance

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getConfig } from './config';

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  variant?: 'A' | 'B';
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface UserProperties {
  userId: string;
  variant: 'A' | 'B';
  subscriptionPrice?: number;
  userType?: 'new' | 'returning';
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = getConfig().enableAnalytics;
  }

  // Initialize analytics with user properties
  initialize(userProperties: UserProperties): void {
    if (!this.isEnabled) return;
    
    this.userProperties = userProperties;
    this.track('user_identified', {
      userId: userProperties.userId,
      variant: userProperties.variant,
      subscriptionPrice: userProperties.subscriptionPrice,
      userType: userProperties.userType
    });
  }

  // Track an event
  track(event: string, properties: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      userId: this.userProperties?.userId,
      variant: this.userProperties?.variant,
      properties: {
        ...properties,
        timestamp: Date.now(),
        environment: getConfig().environment
      },
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);
    this.sendToAnalytics(analyticsEvent);
  }

  // Track cancellation flow events
  trackCancellationFlow(step: string, data?: Record<string, any>): void {
    this.track('cancellation_flow_step', {
      step,
      ...data
    });
  }

  // Track A/B test events
  trackABTest(variant: 'A' | 'B', event: string, data?: Record<string, any>): void {
    this.track('ab_test_event', {
      variant,
      event,
      ...data
    });
  }

  // Track offer interactions
  trackOffer(offerId: string, action: 'viewed' | 'accepted' | 'declined', data?: Record<string, any>): void {
    this.track('offer_interaction', {
      offerId,
      action,
      ...data
    });
  }

  // Track cancellation completion
  trackCancellationComplete(reason: string, acceptedDownsell: boolean, data?: Record<string, any>): void {
    this.track('cancellation_completed', {
      reason,
      acceptedDownsell,
      ...data
    });
  }

  // Track feedback submission
  trackFeedback(reason: string, feedbackLength: number, data?: Record<string, any>): void {
    this.track('feedback_submitted', {
      reason,
      feedbackLength,
      ...data
    });
  }

  // Send event to analytics providers
  private sendToAnalytics(event: AnalyticsEvent): void {
    const config = getConfig();

    // Send to Google Analytics if configured
    if (config.googleAnalyticsId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, {
        event_category: 'cancellation_flow',
        event_label: event.variant,
        custom_parameters: event.properties
      });
    }

    // Send to Mixpanel if configured
    if (config.mixpanelToken && typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event.event, {
        ...event.properties,
        variant: event.variant,
        userId: event.userId
      });
    }

    // Send to internal analytics endpoint (if configured)
    this.sendToInternalAnalytics(event);

    // Log to console in development
    if (config.environment === 'development') {
      console.log('Analytics Event:', event);
    }
  }

  // Send to internal analytics endpoint
  private async sendToInternalAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      // This would typically send to your own analytics endpoint
      // For now, we'll just store locally
      if (typeof window !== 'undefined') {
        const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        storedEvents.push(event);
        localStorage.setItem('analytics_events', JSON.stringify(storedEvents.slice(-100))); // Keep last 100 events
      }
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  // Get analytics events (for debugging)
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear events
  clearEvents(): void {
    this.events = [];
  }

  // Export events for analysis
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Analytics hooks for React components
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackCancellationFlow: analytics.trackCancellationFlow.bind(analytics),
    trackABTest: analytics.trackABTest.bind(analytics),
    trackOffer: analytics.trackOffer.bind(analytics),
    trackCancellationComplete: analytics.trackCancellationComplete.bind(analytics),
    trackFeedback: analytics.trackFeedback.bind(analytics)
  };
}

// Analytics middleware for tracking page views
export function trackPageView(page: string): void {
  analytics.track('page_view', { page });
}

// Analytics middleware for tracking user interactions
export function trackUserInteraction(element: string, action: string, data?: Record<string, any>): void {
  analytics.track('user_interaction', {
    element,
    action,
    ...data
  });
}

// Performance tracking
export function trackPerformance(metric: string, value: number, data?: Record<string, any>): void {
  analytics.track('performance_metric', {
    metric,
    value,
    ...data
  });
}

// Error tracking
export function trackError(error: Error, context?: Record<string, any>): void {
  analytics.track('error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
}

export default analytics;

