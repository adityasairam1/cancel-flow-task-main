'use client';

import React, { useState, useEffect } from 'react';
import styles from '../css/07-VisaNoMM.module.css';
import SuccessNoMM from './09-SuccessNoMM';

interface VisaNoMMProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onComplete?: (visaType: string) => void;
  hasLawyer?: boolean;
}

export default function VisaNoMM({ isOpen, onClose, onBack, onComplete, hasLawyer }: VisaNoMMProps) {
  const [hasLawyerState, setHasLawyerState] = useState<'yes' | 'no' | null>(hasLawyer ? 'yes' : 'no');
  const [showSuccess, setShowSuccess] = useState(false);
  const [visaType, setVisaType] = useState('');

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
      setHasLawyerState(hasLawyer ? 'yes' : 'no');
      setShowSuccess(false);
    }
  }, [isOpen, hasLawyer]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete(visaType);
    }
    setShowSuccess(true);
  };

  if (!isOpen) return null;

  // Show success page
  if (showSuccess) {
    return (
      <SuccessNoMM 
        isOpen={true}
        onClose={onClose}
        visaType="visa-type"
        hasLawyer={hasLawyerState === 'yes'}
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
                You landed the job! That's what we live for.
              </h3>
              <p className={styles.subdescription}>
                Even if it wasn't through Migrate Mate, let us help get your visa sorted.
              </p>
              
              <div className={styles.lawyerQuestionGroup}>
                <p className={styles.lawyerQuestionText}>
                  Is your company providing an immigration lawyer to help with your visa?
                </p>
                <div className={styles.lawyerRadioGroup}>
                  <label className={styles.lawyerRadioOption}>
                    <input
                      type="radio"
                      name="hasLawyer"
                      value={hasLawyer ? "yes" : "no"}
                      checked={true}
                      readOnly
                    />
                    <span className={styles.lawyerRadioLabel}>
                      {hasLawyer ? "Yes" : "No"}
                    </span>
                  </label>
                </div>
                {hasLawyer === false && (
                  <p className={styles.lawyerOfferText}>
                    We can connect you with one of our trusted partners.
                  </p>
                )}
              </div>

              <div className={styles.visaQuestionGroup}>
                <p className={styles.visaQuestionText}>
                  {hasLawyer === false 
                    ? "Which visa would you like to apply for?"
                    : "What visa will you be applying for?*"
                  }
                </p>
                <input
                  type="text"
                  className={styles.visaInput}
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  placeholder="e.g., H-1B, L-1, O-1..."
                />
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.continueButton} 
                onClick={handleComplete}
                disabled={!visaType.trim()}
                style={{
                  opacity: visaType.trim() ? 1 : 0.6,
                  cursor: visaType.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Complete cancellation
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
