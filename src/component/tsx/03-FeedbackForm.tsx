'use client';

import React, { useState, useEffect } from 'react';
import styles from '../css/03-FeedbackForm.module.css';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function FeedbackForm({ isOpen, onClose, onBack, onContinue }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const minCharacters = 25;

  // Check if form is valid
  useEffect(() => {
    const isValid = feedback.length >= minCharacters;
    setIsFormValid(isValid);
  }, [feedback]);

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

  const handleContinue = () => {
    if (!isFormValid) return;
    
    console.log('Feedback:', feedback);
    // You can add analytics or API calls here
    // For now, close the entire popup
    onContinue();
  };

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
          <button className={styles.backButton} onClick={onBack}>
            ← Back
          </button>
          <span className={styles.headerText}>Subscription Cancellation</span>
          <div className={styles.stepIndicator}>
            <span className={styles.step}>Step 2 of 3</span>
            <div className={styles.progressMeter}>
              <div className={styles.progressBar}></div>
            </div>
          </div>
          <div></div> {/* Placeholder for close button alignment */}
        </div>
        
        <div className={styles.formContent}>
          <div className={styles.formTextSection}>
            <div className={styles.textContent}>
              <h3 className={styles.title}>
                What&apos;s one thing you wish we could&apos;ve helped you with?
              </h3>
              <p className={styles.subdescription}>
                We&apos;re always looking to improve, your thoughts can help us make Migrate Mate more useful for others.*
              </p>
              
              <div className={styles.textareaContainer}>
                <textarea
                  className={styles.feedbackTextarea}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={6}
                />
                <div className={styles.characterCounter}>
                  Min {minCharacters} characters ({feedback.length}/{minCharacters})
                </div>
              </div>
            </div>
            
                          <div className={styles.buttonGroup}>
                <button 
                  className={styles.continueButton} 
                  onClick={handleContinue}
                  disabled={!isFormValid}
                  style={{
                    opacity: isFormValid ? 1 : 0.6,
                    cursor: isFormValid ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </button>
              </div>
          </div>
          
          <div className={styles.formImageSection}>
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
