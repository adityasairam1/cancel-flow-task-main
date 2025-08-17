'use client';

import React from 'react';
import styles from '../css/15-Cancelled.module.css';
import { useResponsive } from '../../lib/responsive';

interface CancelledProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  reason?: string;
  amount?: string;
  feedback?: string;
}

export default function Cancelled({ 
  isOpen, 
  onClose, 
  onBack
}: CancelledProps) {
  const { isMobile, isTablet } = useResponsive();

  if (!isOpen) return null;

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
          <div className={styles.headerTopRow}>
            {onBack && (
              <button 
                className={styles.backButton} 
                onClick={onBack}
                aria-label="Go back"
              >
                ← Back
              </button>
            )}
            <span className={styles.headerText}>Subscription Cancellation</span>
            <div className={styles.progressIndicator}>
              <div className={styles.progressSteps}>
                <div className={`${styles.step} ${styles.completed}`}></div>
                <div className={`${styles.step} ${styles.completed}`}></div>
                <div className={`${styles.step} ${styles.completed}`}></div>
              </div>
              <span className={styles.stepText}>Completed</span>
            </div>
          </div>
        </div>
        
        <div className={`${styles.content} ${isMobile ? 'flex-col' : 'flex-row'}`}>
          {/* For mobile: Image at top, text below */}
          {isMobile ? (
            <>
              <div className={`${styles.imageSection} ${isMobile ? 'w-full h-48 order-first' : ''}`}>
                <img 
                  src="/image/empire.jpg" 
                  alt="Empire State Building at twilight" 
                  className={`${styles.image} ${isMobile ? 'object-cover h-full w-full rounded-t-lg' : ''}`}
                />
              </div>
              
              <div className={`${styles.textSection} ${isMobile ? 'w-full order-last' : ''}`}>
                <div className={styles.textContent}>
                  <h2 className={`${styles.title} ${isMobile ? 'text-xl' : ''}`}>Sorry to see you go, mate.</h2>
                  <p className={`${styles.subtitle} ${isMobile ? 'text-base' : ''}`}>
                    Thanks for being with us, and you&apos;re always welcome back.
                  </p>
                  
                  <div className={styles.subscriptionDetails}>
                    <p>Your subscription is set to end on XX date.</p>
                    <p>You&apos;ll still have full access until then. No further charges after that.</p>
                  </div>
                  
                  <div className={styles.reactivationMessage}>
                    <p>Changed your mind? You can reactivate anytime before your end date.</p>
                  </div>
                </div>
                
                <div className={styles.buttonGroup}>
                  <button 
                    className={`${styles.backToJobsButton} ${isMobile ? 'w-full' : ''}`}
                    onClick={onClose}
                  >
                    Back to Jobs
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* For desktop: Text on left, image on right */}
              <div className={styles.textSection}>
                <div className={styles.textContent}>
                  <h2 className={styles.title}>Sorry to see you go, mate.</h2>
                  <p className={styles.subtitle}>
                    Thanks for being with us, and you&apos;re always welcome back.
                  </p>
                  
                  <div className={styles.subscriptionDetails}>
                    <p>Your subscription is set to end on XX date.</p>
                    <p>You&apos;ll still have full access until then. No further charges after that.</p>
                  </div>
                  
                  <div className={styles.reactivationMessage}>
                    <p>Changed your mind? You can reactivate anytime before your end date.</p>
                  </div>
                </div>
                
                <div className={styles.buttonGroup}>
                  <button 
                    className={styles.backToJobsButton}
                    onClick={onClose}
                  >
                    Back to Jobs
                  </button>
                </div>
              </div>
              
              <div className={styles.imageSection}>
                <img 
                  src="/image/empire.jpg" 
                  alt="Empire State Building at twilight" 
                  className={styles.image} 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
