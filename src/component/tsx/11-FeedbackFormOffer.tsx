'use client';

import React, { useState, useEffect } from 'react';
import styles from '../css/11-FeedbackFormOffer.module.css';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
  onGet50Off?: () => void;
}

export default function FeedbackForm({ isOpen, onClose, onBack, onContinue, onGet50Off }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    rolesApplied: '',
    companiesEmailed: '',
    companiesInterviewed: ''
  });
  const [showWarning, setShowWarning] = useState(false);

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

  const handleOptionSelect = (question: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [question]: value
    }));
    setShowWarning(true);
  };

  const handleContinue = () => {
    // Here you would typically save the feedback data
    setShowWarning(true);
    onContinue();
  };

  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWarning(true);
  };

  const isFormComplete = formData.rolesApplied && formData.companiesEmailed && formData.companiesInterviewed;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={handlePopupClick}>
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
            <div className={styles.step}>Step 2 of 3</div>
            <div className={styles.progressMeter}>
              <div className={styles.progressBar} style={{ width: '66.67%' }}></div>
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
                Help us understand how you were using Migrate Mate.
              </h3>
              {showWarning && (
                <div className={styles.warningMessage}>
                  Mind letting us know why you&apos;re cancelling? It helps us understand your experience and improve the platform.*
                </div>
              )}
              
              <div className={styles.questionSection}>
                <h4 className={styles.question}>
                  How many roles did you <span className={styles.underline}>apply</span> for through Migrate Mate?
                </h4>
                <div className={styles.options}>
                  {['0', '1-5', '6-20', '20+'].map((option) => (
                    <button
                      key={option}
                      className={`${styles.option} ${formData.rolesApplied === option ? styles.selected : ''}`}
                      onClick={() => handleOptionSelect('rolesApplied', option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.questionSection}>
                <h4 className={styles.question}>
                  How many companies did you <span className={styles.underline}>email</span> directly?
                </h4>
                <div className={styles.options}>
                  {['0', '1-5', '6-20', '20+'].map((option) => (
                    <button
                      key={option}
                      className={`${styles.option} ${formData.companiesEmailed === option ? styles.selected : ''}`}
                      onClick={() => handleOptionSelect('companiesEmailed', option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.questionSection}>
                <h4 className={styles.question}>
                  How many different companies did you <span className={styles.underline}>interview</span> with?
                </h4>
                <div className={styles.options}>
                  {['0', '1-2', '3-5', '5+'].map((option) => (
                    <button
                      key={option}
                      className={`${styles.option} ${formData.companiesInterviewed === option ? styles.selected : ''}`}
                      onClick={() => handleOptionSelect('companiesInterviewed', option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.offerButton}
                onClick={() => {
                  console.log('Get 50% off clicked in FeedbackFormOffer');
                  if (onGet50Off) {
                    console.log('Calling onGet50Off function');
                    onGet50Off();
                  } else {
                    console.log('onGet50Off function is not available');
                  }
                }}
              >
                Get 50% off | $12.50 <span className={styles.strikethrough}>$25</span>
              </button>
              <button 
                className={`${styles.continueButton} ${isFormComplete ? styles.enabled : ''}`}
                onClick={handleContinue}
                disabled={!isFormComplete}
              >
                Continue
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
