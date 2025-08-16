'use client';

import React, { useState, useEffect } from 'react';
import styles from '../css/04-YesWithMM.module.css';
import YesMM from './05-YesMM';

interface YesWithMMProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export default function YesWithMM({ isOpen, onClose, onBack }: YesWithMMProps) {
  const [hasLawyer, setHasLawyer] = useState<'yes' | 'no' | null>(null);
  const [showVisaRequirement, setShowVisaRequirement] = useState(false);

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

  // Reset state when popup is closed
  useEffect(() => {
    if (!isOpen) {
      setHasLawyer(null);
      setShowVisaRequirement(false);
    }
  }, [isOpen]);

  const handleLawyerSelection = (selection: 'yes' | 'no') => {
    setHasLawyer(selection);
    setShowVisaRequirement(true);
  };

  const handleVisaRequirementComplete = (visaType: string) => {
    if (hasLawyer === 'yes') {
      console.log('Yes With MM - has lawyer, visa type:', visaType);
      // Navigate to success page with lawyer
      // window.location.href = '/mm-success-has-lawyer';
    } else {
      console.log('Yes With MM - needs lawyer, visa type:', visaType);
      // Navigate to success page with lawyer offer
      // window.location.href = '/mm-success-needs-lawyer';
    }
    
    // The success page is now handled within VisaRequirement component
    // so we don't need to close here
  };

  const handleBackToLawyerQuestion = () => {
    setShowVisaRequirement(false);
    setHasLawyer(null);
  };

  if (!isOpen) return null;

  // Show YesMM component when user has selected Yes or No
  if (showVisaRequirement) {
    return (
      <YesMM 
        isOpen={true}
        onClose={onClose}
        onBack={handleBackToLawyerQuestion}
        onComplete={handleVisaRequirementComplete}
        hasLawyer={hasLawyer === 'yes'}
      />
    );
  }

  // Main lawyer question page
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
            <span className={styles.step}>Step 3 of 3</span>
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
                We helped you land the job, now let's help you secure your visa.
              </h3>
              
              <div className={styles.questionGroup}>
                <p className={styles.questionText}>
                  Is your company providing an immigration lawyer to help with your visa?*
                </p>
                <div className={styles.optionGroup}>
                  {['yes', 'no'].map((option) => (
                    <label key={option} className={styles.optionButton}>
                      <input
                        type="radio"
                        name="hasLawyer"
                        value={option}
                        checked={hasLawyer === option}
                        onChange={() => handleLawyerSelection(option as 'yes' | 'no')}
                      />
                      <span className={styles.optionLabel}>{option === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.continueButton} 
                onClick={() => hasLawyer && handleLawyerSelection(hasLawyer)}
                disabled={hasLawyer === null}
                style={{
                  opacity: hasLawyer !== null ? 1 : 0.6,
                  cursor: hasLawyer !== null ? 'pointer' : 'not-allowed'
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
