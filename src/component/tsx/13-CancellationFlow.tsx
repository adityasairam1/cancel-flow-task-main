'use client';

import React, { useState } from 'react';
import styles from '../css/13-CancellationFlow.module.css';

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onGet50Off?: () => void;
}

export default function CancellationFlow({ isOpen, onClose, onBack, onGet50Off }: CancellationFlowProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showWarning, setShowWarning] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');

  if (!isOpen) return null;

  const validateAmount = (value: string) => {
    // Allow empty string, numbers, and decimal numbers
    const numberRegex = /^$|^\d*\.?\d*$/;
    if (!numberRegex.test(value)) {
      setAmountError('Invalid format - only numbers and decimal numbers accepted');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    validateAmount(value);
  };

  const handleGet50Off = () => {
    // Handle 50% off offer
    console.log('50% off offer accepted');
    setShowWarning(true);
    if (onGet50Off) {
      onGet50Off();
    } else {
      onClose();
    }
  };



  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWarning(true);
  };

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setShowWarning(false);
    // Reset amount when changing reason
    if (reason !== 'too-expensive') {
      setAmount('');
      setAmountError('');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={handlePopupClick}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close popup"
        >
          ×
        </button>
        
        <div className={styles.header}>
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
          <div className={styles.stepIndicator}>
            <span className={styles.step}>Step 3 of 3</span>
            <div className={styles.progressMeter}>
              <div className={styles.progressBar}></div>
            </div>
          </div>
          <div></div> {/* Placeholder for close button alignment */}
        </div>
        
        <div className={styles.content}>
          <div className={styles.textSection}>
            <div className={styles.textContent}>
              <h3 className={styles.title}>What&apos;s the main reason for cancelling?</h3>
              <p className={styles.description}>
                Please take a minute to let us know why:
              </p>
              {showWarning && !selectedReason && (
                <div className={styles.warningMessage}>
                  To help us understand your experience, please select a reason for cancelling*
                </div>
              )}
              
              <div className={styles.reasonOptions}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="cancellationReason"
                    value="too-expensive"
                    checked={selectedReason === 'too-expensive'}
                    onChange={(e) => handleReasonSelect(e.target.value)}
                  />
                  <span className={styles.radioLabel}>Too expensive</span>
                </label>
                
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="cancellationReason"
                    value="platform-not-helpful"
                    checked={selectedReason === 'platform-not-helpful'}
                    onChange={(e) => handleReasonSelect(e.target.value)}
                  />
                  <span className={styles.radioLabel}>Platform not helpful</span>
                </label>
                
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="cancellationReason"
                    value="not-enough-jobs"
                    checked={selectedReason === 'not-enough-jobs'}
                    onChange={(e) => handleReasonSelect(e.target.value)}
                  />
                  <span className={styles.radioLabel}>Not enough relevant jobs</span>
                </label>
                
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="cancellationReason"
                    value="decided-not-to-move"
                    checked={selectedReason === 'decided-not-to-move'}
                    onChange={(e) => handleReasonSelect(e.target.value)}
                  />
                  <span className={styles.radioLabel}>Decided not to move</span>
                </label>
                
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="cancellationReason"
                    value="other"
                    checked={selectedReason === 'other'}
                    onChange={(e) => handleReasonSelect(e.target.value)}
                  />
                  <span className={styles.radioLabel}>Other</span>
                </label>
              </div>

              {/* Show amount input when "Too expensive" is selected */}
              {selectedReason === 'too-expensive' && (
                <div className={styles.amountSection}>
                  <label className={styles.amountLabel}>
                    What would be the maximum you would be willing to pay?*
                  </label>
                  <div className={styles.amountInputContainer}>
                    <span className={styles.currencySymbol}>$</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      className={styles.amountInput}
                      placeholder="0.00"
                    />
                  </div>
                  {amountError && (
                    <div className={styles.errorMessage}>
                      {amountError}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.offerButton} 
                onClick={handleGet50Off}
              >
                Get 50% off | $12.50 <span className={styles.originalPrice}>$25</span>
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
