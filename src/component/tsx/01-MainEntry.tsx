'use client';

import React, { useState, useEffect } from 'react';
import styles from '../css/01-MainEntry.module.css';
import YesWithMM from './04-YesWithMM';
import NoWithoutMM from './06-NoWithoutMM';
import JobFoundForm from './02-JobFoundForm';
import FeedbackForm from './03-FeedbackForm';
import Offer from './10-Offer';
import FeedbackFormStep2 from './11-FeedbackFormOffer';
import SubscriptionPopup from './12-SubscriptionPopup';

import Reasons from './14-reasons';
import Cancelled from './15-Cancelled';
import { useABTesting } from '../../lib/use-ab-testing';
import { getConfig, getPrimaryOffer } from '../../lib/config';
import { useAnalytics, analytics } from '../../lib/analytics';
import { useResponsive } from '../../lib/responsive';

interface CancelPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CancelPopup({ isOpen, onClose }: CancelPopupProps) {
  const [showJobForm, setShowJobForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showFinalStep, setShowFinalStep] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showFeedbackFormStep2, setShowFeedbackFormStep2] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showCancellationFlow, setShowCancellationFlow] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [cancellationData, setCancellationData] = useState<{
    reason: string;
    amount?: string;
    feedback?: string;
  } | null>(null);
  const [foundWithMigrateMate, setFoundWithMigrateMate] = useState<'yes' | 'no' | null>(null);
  
  // A/B Testing using custom hook
  const mockUserId = '550e8400-e29b-41d4-a716-446655440001';
  const { variant: abVariant, userSubscription, isLoading: isLoadingVariant, downsellPrice } = useABTesting(mockUserId);
  
  // Analytics and responsive hooks
  const { trackCancellationFlow } = useAnalytics();
  const { isMobile, isTablet } = useResponsive();
  const config = getConfig();





  // Initialize analytics when component mounts
  useEffect(() => {
    if (isOpen && abVariant && userSubscription) {
      analytics.initialize({
        userId: mockUserId,
        variant: abVariant,
        subscriptionPrice: userSubscription.monthly_price,
        userType: 'returning'
      });
      
      trackCancellationFlow('popup_opened', {
        variant: abVariant,
        subscriptionPrice: userSubscription.monthly_price
      });
    }
  }, [isOpen, abVariant, userSubscription, trackCancellationFlow]);

  // Reset to main screen whenever popup is closed
  useEffect(() => {
    if (!isOpen) {
      setShowJobForm(false);
      setShowFeedbackForm(false);
      setShowFinalStep(false);
      setShowOffer(false);
      setShowFeedbackFormStep2(false);
      setShowSubscriptionPopup(false);
      setShowCancellationFlow(false);
      setShowCancelled(false);
      setCancellationData(null);
      setFoundWithMigrateMate(null);
    }
  }, [isOpen]);



  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Show loading state while A/B testing initializes
  if (isLoadingVariant) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
          <div className={styles.content}>
            <div className={styles.textSection}>
              <div className={styles.textContent}>
                <h3 className={styles.subtitle}>Loading...</h3>
                <p className={styles.description}>
                  Setting up your cancellation experience...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Cancelled page when showCancelled is true
  if (showCancelled && cancellationData) {
    return (
      <Cancelled
        isOpen={true}
        onClose={onClose}
        onBack={() => {
          setShowCancelled(false);
          setCancellationData(null);
          setShowCancellationFlow(true);
        }}
        reason={cancellationData.reason}
        amount={cancellationData.amount}
        feedback={cancellationData.feedback}
      />
    );
  }

  // Show Reasons when showCancellationFlow is true
  if (showCancellationFlow) {
    return (
      <Reasons 
        isOpen={true} 
        onClose={onClose}
        onBack={() => setShowCancellationFlow(false)}
        onGet50Off={() => {
          setShowCancellationFlow(false);
          setShowSubscriptionPopup(true);
        }}
        onCompleteCancellation={(reason, amount, feedback) => {
          console.log('Cancellation completed:', { reason, amount, feedback });
          setShowCancellationFlow(false);
          setCancellationData({ reason, amount, feedback });
          setShowCancelled(true);
        }}
        userId={mockUserId}
        variant={abVariant || undefined}
      />
    );
  }

  // Show SubscriptionPopup when showSubscriptionPopup is true
  if (showSubscriptionPopup) {
    return (
      <SubscriptionPopup 
        isOpen={true} 
        onClose={onClose}
        onBack={() => setShowSubscriptionPopup(false)}
      />
    );
  }

  // Show FeedbackFormStep2 when showFeedbackFormStep2 is true
  if (showFeedbackFormStep2) {
    return (
      <FeedbackFormStep2 
        isOpen={true} 
        onClose={onClose}
        onBack={() => setShowFeedbackFormStep2(false)}
        onContinue={() => {
          // Handle continue to CancellationFlow
          setShowFeedbackFormStep2(false);
          setShowCancellationFlow(true);
        }}
        onGet50Off={() => {
          setShowSubscriptionPopup(true);
        }}
      />
    );
  }

  if (showOffer) {
    const currentPrice = userSubscription?.monthly_price || 2500;
    
    return (
      <Offer 
        isOpen={true} 
        onClose={onClose}
        onBack={() => setShowOffer(false)}
        onNoThanks={() => setShowFeedbackFormStep2(true)}
        currentPrice={currentPrice}
        downsellPrice={downsellPrice || currentPrice}
        userId={mockUserId}
        variant={abVariant || undefined}
      />
    );
  }

  // Show YesWithMM or NoWithoutMM based on user's selection
  if (showFinalStep) {
    if (foundWithMigrateMate === 'yes') {
      return (
        <YesWithMM 
          isOpen={true} 
          onClose={onClose}
          onBack={() => setShowFinalStep(false)}
        />
      );
    } else {
      return (
        <NoWithoutMM 
          isOpen={true} 
          onClose={onClose}
          onBack={() => setShowFinalStep(false)}
        />
      );
    }
  }

  // Show FeedbackForm when showFeedbackForm is true
  if (showFeedbackForm) {
    return (
      <FeedbackForm 
        isOpen={true} 
        onClose={onClose}
        onBack={() => {
          setShowFeedbackForm(false);
        }}
        onContinue={() => setShowFinalStep(true)}
      />
    );
  }

  // Show JobFoundForm when showJobForm is true
  if (showJobForm) {
    return (
      <JobFoundForm 
        isOpen={true} 
        onClose={onClose}
        onBack={() => setShowJobForm(false)}
        onContinue={(foundWithMM) => {
          setFoundWithMigrateMate(foundWithMM);
          setShowFeedbackForm(true);
        }}
      />
    );
  }

  // Original popup with responsive design
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.popup} ${isMobile ? 'w-full h-full max-w-none rounded-none' : isTablet ? 'w-11/12 max-w-2xl rounded-lg' : 'w-4/5 max-w-4xl rounded-xl'}`} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close popup"
        >
          ×
        </button>
        
        <div className={styles.header}>
          <span className={`${styles.headerText} ${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'}`}>
            {config.appName} - Subscription Cancellation
          </span>
        </div>
        
        <div className={`${styles.content} ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <div className={`${styles.textSection} ${isMobile ? 'w-full' : 'w-1/2'}`}>
            <div className={styles.textContent}>
              <h3 className={`${styles.subtitle} ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'}`}>
                Hey mate,<br />Quick one before you go.
              </h3>
              <p className={`${styles.description} ${isMobile ? 'text-base' : 'text-lg'}`}>
                <em>Have you found a job yet?</em>
              </p>
              <p className={`${styles.subdescription} ${isMobile ? 'text-sm' : 'text-base'}`}>
                Whatever your answer, we just want to help you take the next step. With visa support, or by hearing how we can do better.
              </p>
            </div>
            
            <div className={`${styles.buttonGroup} ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <button 
                className={`${styles.yesButton} ${isMobile ? 'px-4 py-3 text-sm' : isTablet ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'}`}
                onClick={() => {
                  trackCancellationFlow('job_found_clicked');
                  setShowJobForm(true);
                }}
              >
                Yes, I&apos;ve found a job
              </button>
              <button 
                className={`${styles.noButton} ${isMobile ? 'px-4 py-3 text-sm' : isTablet ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'}`}
                onClick={() => {
                  trackCancellationFlow('still_looking_clicked', { variant: abVariant });
                  // Always go to offer page first for "Not yet" users
                  setShowOffer(true);
                }}
              >
                Not yet - I&apos;m still looking
              </button>
            </div>
          </div>
          
          <div className={`${styles.imageSection} ${isMobile ? 'w-full h-48' : 'w-1/2'}`}>
            <img 
              src="/image/empire.jpg" 
              alt="Empire State Building at twilight" 
              className={`${styles.image} ${isMobile ? 'object-cover h-full w-full' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

