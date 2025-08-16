'use client';

import React from 'react';
import styles from '../css/15-Cancelled.module.css';

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
  onBack,
  reason,
  amount,
  feedback
}: CancelledProps) {
  if (!isOpen) return null;

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'too-expensive':
        return 'Too expensive';
      case 'platform-not-helpful':
        return 'Platform not helpful';
      case 'not-enough-jobs':
        return 'Not enough relevant jobs';
      case 'decided-not-to-move':
        return 'Decided not to move';
      case 'other':
        return 'Other';
      default:
        return 'Unknown reason';
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
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
        
        <div className={styles.content}>
          <div className={styles.textSection}>
            <div className={styles.textContent}>
                             <h2 className={styles.title}>Sorry to see you go, mate.</h2>
               <p className={styles.subtitle}>
                 Thanks for being with us, and you're always welcome back.
               </p>
               
               <div className={styles.subscriptionDetails}>
                 <p>Your subscription is set to end on XX date.</p>
                 <p>You'll still have full access until then. No further charges after that.</p>
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
        </div>
      </div>
    </div>
  );
}
