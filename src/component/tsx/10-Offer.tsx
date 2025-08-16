'use client';

import React, { useState, useEffect } from 'react';
import styles from '../css/10-Offer.module.css';
import { handleDownsellAcceptance } from '../../lib/database-operations';

interface OfferProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNoThanks: () => void;
  onGet50Off?: () => void;

  currentPrice?: number;
  downsellPrice?: number;
  userId?: string;
  variant?: 'A' | 'B';
}

export default function Offer({ isOpen, onClose, onBack, onNoThanks, onGet50Off, currentPrice = 2500, downsellPrice = 1500, userId, variant }: OfferProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleGetDiscount = async () => {
    if (!userId || !variant) {
      console.error('Missing userId or variant for downsell acceptance');
      setError('Configuration error. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Handle downsell acceptance in database
      const success = await handleDownsellAcceptance(userId, variant);
      
      if (success) {
        console.log('Downsell accepted successfully');
        // Close the popup to return to profile
        onClose();
      } else {
        console.error('Failed to process downsell acceptance');
        setError('Payment processing failed. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error processing downsell acceptance:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNoThanks = () => {
    onNoThanks();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button 
            className={styles.backButton} 
            onClick={onBack}
            aria-label="Go back"
          >
            ← Back
          </button>
          <div className={styles.headerTitle}>Subscription Cancellation</div>
          <div className={styles.stepIndicator}>
            <div className={styles.step}>Step 1 of 3</div>
            <div className={styles.progressMeter}>
              <div className={styles.progressBar} style={{ width: '33.33%' }}></div>
            </div>
          </div>
        </div>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close popup"
        >
          ×
        </button>
        
        <div className={styles.content}>
          <div className={styles.textSection}>
            <div className={styles.textContent}>
              <h3 className={styles.title}>
                We built this to help you land the job, this makes it a little easier.
              </h3>
              <p className={styles.description}>
                We've been there and we're here to help you.
              </p>
            </div>
            
            <div className={styles.offerBox}>
              <div className={styles.offerContent}>
                <h4 className={styles.offerTitle}>Here's <strong>$10 off</strong> until you find a job.</h4>
                <div className={styles.pricing}>
                  <span className={styles.newPrice}>${(downsellPrice / 100).toFixed(2)}/month</span>
                  <span className={styles.oldPrice}>${(currentPrice / 100).toFixed(2)}/month</span>
                </div>
                <button 
                  className={styles.acceptButton} 
                  onClick={handleGetDiscount}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Get $10 off | $${(downsellPrice / 100).toFixed(2)}`}
                </button>
                {error && (
                  <p className={styles.errorMessage} style={{ color: '#dc2626', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
                    {error}
                  </p>
                )}
                <p className={styles.billingNote}>
                  You won't be charged until your next billing date.
                </p>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.declineButton} 
                onClick={handleNoThanks}
              >
                No thanks
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
