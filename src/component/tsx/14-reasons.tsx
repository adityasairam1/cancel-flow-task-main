'use client';

import React, { useState, useEffect } from 'react';
import styles from '../css/14-reasons.module.css';
import { handleCancellationCompletion } from '../../lib/database-operations';

interface ReasonsProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onGet50Off?: () => void;
  onCompleteCancellation?: (reason: string, amount?: string, feedback?: string) => void;
  userId?: string;
  variant?: 'A' | 'B';
}

export default function Reasons({ 
  isOpen, 
  onClose, 
  onBack, 
  onGet50Off, 
  onCompleteCancellation,
  userId,
  variant
}: ReasonsProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackError, setFeedbackError] = useState<string>('');
  const [jobsFeedback, setJobsFeedback] = useState<string>('');
  const [jobsFeedbackError, setJobsFeedbackError] = useState<string>('');
  const [moveFeedback, setMoveFeedback] = useState<string>('');
  const [moveFeedbackError, setMoveFeedbackError] = useState<string>('');
  const [otherFeedback, setOtherFeedback] = useState<string>('');
  const [otherFeedbackError, setOtherFeedbackError] = useState<string>('');
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const MIN_FEEDBACK_CHARS = 25;

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

  if (!isOpen) return null;

  const validateAmount = (value: string) => {
    const numberRegex = /^$|^\d*\.?\d*$/;
    if (!numberRegex.test(value)) {
      setAmountError('Invalid format - only numbers and decimal numbers accepted');
      return false;
    }
    setAmountError('');
    return true;
  };

  const validateFeedback = (value: string, setError: (error: string) => void) => {
    if (value.length > 0 && value.length < MIN_FEEDBACK_CHARS) {
      setError(`Please enter at least ${MIN_FEEDBACK_CHARS} characters so we can understand your feedback*`);
      return false;
    }
    setError('');
    return true;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    validateAmount(value);
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFeedback(value);
    validateFeedback(value, setFeedbackError);
  };

  const handleJobsFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobsFeedback(value);
    validateFeedback(value, setJobsFeedbackError);
  };

  const handleMoveFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMoveFeedback(value);
    validateFeedback(value, setMoveFeedbackError);
  };

  const handleOtherFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setOtherFeedback(value);
    validateFeedback(value, setOtherFeedbackError);
  };

  const handleGet50Off = () => {
    setShowWarning(true);
    if (!selectedReason) {
      return;
    }
    console.log('50% off offer accepted');
    if (onGet50Off) {
      onGet50Off();
    } else {
      onClose();
    }
  };

  const handleCompleteCancellation = async () => {
    setShowWarning(true);
    if (!selectedReason) {
      return;
    }
    
    if (!userId || !variant) {
      console.error('Missing userId or variant for cancellation completion');
      return;
    }
    
    console.log('Cancellation completed with reason:', selectedReason);
    
    try {
      let cancellationFeedback: string | undefined;
      let cancellationAmount: string | undefined;
      
      // Determine feedback and amount based on reason
      if (selectedReason === 'too-expensive') {
        cancellationAmount = amount;
      } else if (selectedReason === 'platform-not-helpful') {
        cancellationFeedback = feedback;
      } else if (selectedReason === 'not-enough-jobs') {
        cancellationFeedback = jobsFeedback;
      } else if (selectedReason === 'decided-not-to-move') {
        cancellationFeedback = moveFeedback;
      } else if (selectedReason === 'other') {
        cancellationFeedback = otherFeedback;
      }
      
      // Handle cancellation completion in database
      const success = await handleCancellationCompletion(
        userId,
        variant,
        selectedReason,
        cancellationAmount,
        cancellationFeedback
      );
      
      if (success) {
        console.log('Cancellation completed and logged successfully');
        // Call the callback to continue the flow
        if (onCompleteCancellation) {
          if (selectedReason === 'too-expensive') {
            onCompleteCancellation(selectedReason, amount);
          } else if (selectedReason === 'platform-not-helpful') {
            onCompleteCancellation(selectedReason, undefined, feedback);
          } else if (selectedReason === 'not-enough-jobs') {
            onCompleteCancellation(selectedReason, undefined, jobsFeedback);
          } else if (selectedReason === 'decided-not-to-move') {
            onCompleteCancellation(selectedReason, undefined, moveFeedback);
          } else if (selectedReason === 'other') {
            onCompleteCancellation(selectedReason, undefined, otherFeedback);
          }
        }
      } else {
        console.error('Failed to complete cancellation in database');
        // Still continue the flow even if database operation fails
        if (onCompleteCancellation) {
          onCompleteCancellation(selectedReason, amount, feedback);
        }
      }
    } catch (error) {
      console.error('Error completing cancellation:', error);
      // Continue the flow even if there's an error
      if (onCompleteCancellation) {
        onCompleteCancellation(selectedReason, amount, feedback);
      }
    }
  };

  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWarning(true);
  };

  const handleReasonSelect = (reason: string) => {
    console.log('Reason selected:', reason);
    setSelectedReason(reason);
    setShowWarning(true);
    
    // Reset all fields when changing reason
    setAmount('');
    setAmountError('');
    setFeedback('');
    setFeedbackError('');
    setJobsFeedback('');
    setJobsFeedbackError('');
    setMoveFeedback('');
    setMoveFeedbackError('');
    setOtherFeedback('');
    setOtherFeedbackError('');
  };



  const isFormValid = () => {
    if (!selectedReason) return false;
    
    if (selectedReason === 'too-expensive') {
      return amount && !amountError;
    } else if (selectedReason === 'platform-not-helpful') {
      return feedback.length >= MIN_FEEDBACK_CHARS && !feedbackError;
    } else if (selectedReason === 'not-enough-jobs') {
      return jobsFeedback.length >= MIN_FEEDBACK_CHARS && !jobsFeedbackError;
    } else if (selectedReason === 'decided-not-to-move') {
      return moveFeedback.length >= MIN_FEEDBACK_CHARS && !moveFeedbackError;
    } else if (selectedReason === 'other') {
      return otherFeedback.length >= MIN_FEEDBACK_CHARS && !otherFeedbackError;
    }
    
    return false;
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
                <div className={`${styles.step} ${styles.active}`}></div>
              </div>
              <span className={styles.stepText}>Step 3 of 3</span>
            </div>
          </div>
        </div>
        
        <div className={styles.content}>
          <div className={styles.textSection}>
            <div className={styles.textContent}>
                             <h3 className={styles.title}>What&apos;s the main reason for cancelling?</h3>
               <p className={styles.description}>
                 Please take a minute to let us know why:
               </p>
               
               {showWarning && (
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

                             {/* Show feedback textarea when "Platform not helpful" is selected */}
               {selectedReason === 'platform-not-helpful' && (
                 <div className={styles.feedbackSection}>
                  <label className={styles.feedbackLabel}>
                    What can we change to make the platform more helpful?*
                  </label>
                  <div className={styles.textareaContainer}>
                    <textarea
                      value={feedback}
                      onChange={handleFeedbackChange}
                      className={styles.feedbackTextarea}
                      placeholder="Please share your feedback..."
                      rows={4}
                    />
                    <div className={styles.charCounter}>
                      Min {MIN_FEEDBACK_CHARS} characters ({feedback.length}/{MIN_FEEDBACK_CHARS})
                    </div>
                  </div>
                  {feedbackError && (
                    <div className={styles.errorMessage}>
                      {feedbackError}
                    </div>
                  )}
                </div>
              )}

              {/* Show feedback textarea when "Not enough relevant jobs" is selected */}
              {selectedReason === 'not-enough-jobs' && (
                <div className={styles.feedbackSection}>
                  <label className={styles.feedbackLabel}>
                    In which way can we make the jobs more relevant?*
                  </label>
                  <div className={styles.textareaContainer}>
                    <textarea
                      value={jobsFeedback}
                      onChange={handleJobsFeedbackChange}
                      className={styles.feedbackTextarea}
                      placeholder="Please share your feedback..."
                      rows={4}
                    />
                    <div className={styles.charCounter}>
                      Min {MIN_FEEDBACK_CHARS} characters ({jobsFeedback.length}/{MIN_FEEDBACK_CHARS})
                    </div>
                  </div>
                  {jobsFeedbackError && (
                    <div className={styles.errorMessage}>
                      {jobsFeedbackError}
                    </div>
                  )}
                </div>
              )}

              {/* Show feedback textarea when "Decided not to move" is selected */}
              {selectedReason === 'decided-not-to-move' && (
                <div className={styles.feedbackSection}>
                  <label className={styles.feedbackLabel}>
                    What changed for you to decide to not move?*
                  </label>
                  <div className={styles.textareaContainer}>
                    <textarea
                      value={moveFeedback}
                      onChange={handleMoveFeedbackChange}
                      className={styles.feedbackTextarea}
                      placeholder="Please share your feedback..."
                      rows={4}
                    />
                    <div className={styles.charCounter}>
                      Min {MIN_FEEDBACK_CHARS} characters ({moveFeedback.length}/{MIN_FEEDBACK_CHARS})
                    </div>
                  </div>
                  {moveFeedbackError && (
                    <div className={styles.errorMessage}>
                      {moveFeedbackError}
                    </div>
                  )}
                </div>
              )}

              {/* Show feedback textarea when "Other" is selected */}
              {selectedReason === 'other' && (
                <div className={styles.feedbackSection}>
                  <label className={styles.feedbackLabel}>
                    What would have helped you the most?*
                  </label>
                  <div className={styles.textareaContainer}>
                    <textarea
                      value={otherFeedback}
                      onChange={handleOtherFeedbackChange}
                      className={styles.feedbackTextarea}
                      placeholder="Please share your feedback..."
                      rows={4}
                    />
                    <div className={styles.charCounter}>
                      Min {MIN_FEEDBACK_CHARS} characters ({otherFeedback.length}/{MIN_FEEDBACK_CHARS})
                    </div>
                  </div>
                  {otherFeedbackError && (
                    <div className={styles.errorMessage}>
                      {otherFeedbackError}
                    </div>
                  )}
                </div>
              )}
            </div>
            
                         {/* Only show buttons when a reason is selected */}
             {selectedReason && (
               <div className={styles.buttonGroup}>
                 <button 
                   className={styles.offerButton} 
                   onClick={handleGet50Off}
                 >
                   Get 50% off | $12.50 <span className={styles.originalPrice}>$25</span>
                 </button>
                 <button 
                   className={styles.cancelButton} 
                   onClick={handleCompleteCancellation}
                   disabled={!isFormValid()}
                 >
                   Complete cancellation
                 </button>
               </div>
             )}
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