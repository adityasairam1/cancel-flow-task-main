'use client';

import React from 'react';
import styles from '../css/12-SubscriptionPopup.module.css';

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

export default function SubscriptionPopup({ isOpen, onClose, onBack }: SubscriptionPopupProps) {
  if (!isOpen) return null;

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
            <span className={styles.headerText}>Subscription</span>
          </div>
        </div>
        
        <div className={styles.content}>
          <div className={styles.textSection}>
            <div className={styles.textContent}>
              <h3 className={styles.title}>Great choice, mate!</h3>
              <p className={styles.description}>
                You're still on the path to your dream role. <span className={styles.highlight}>Let's make it happen together!</span>
              </p>
              <div className={styles.subscriptionDetails}>
                <p className={styles.detailText}>
                  You've got <strong>XX days</strong> left on your current plan.
                </p>
                <p className={styles.detailText}>
                  Starting from <strong>XX date</strong>, your monthly payment will be <strong>$12.50</strong>.
                </p>
                <p className={styles.detailText}>
                  You can cancel anytime before then.
                </p>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.ctaButton} 
                onClick={() => {
                  // Handle subscription action
                  console.log('Land your dream role clicked');
                  onClose();
                }}
              >
                Land your dream role
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
