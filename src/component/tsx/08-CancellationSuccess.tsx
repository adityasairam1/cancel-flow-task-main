'use client';

import React, { useEffect } from 'react';
import styles from '../css/08-CancellationSuccess.module.css';

interface CancellationSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  visaType?: string;
  hasLawyer?: boolean;
}

export default function CancellationSuccess({ isOpen, onClose, visaType, hasLawyer }: CancellationSuccessProps) {
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

  const handleFinish = () => {
    console.log('Cancellation completed successfully');
    console.log('Visa type:', visaType);
    console.log('Has lawyer:', hasLawyer);
    onClose();
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
          <span className={styles.headerText}>Subscription Cancelled</span>
          <div className={styles.progressIndicator}>
            <div className={styles.progressBar}>
              <div className={styles.progressSegment}></div>
              <div className={styles.progressSegment}></div>
              <div className={styles.progressSegment}></div>
              <div className={styles.progressSegment}></div>
            </div>
            <span className={styles.progressText}>Completed</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.textSection}>
            <div className={styles.textContent}>
              <h3 className={styles.title}>
                All done, your cancellation&apos;s been processed.
              </h3>
              
              <div className={styles.congratulatoryMessage}>
                <p className={styles.messageText}>
                  We&apos;re stoked to hear you&apos;ve landed a job and sorted your visa. Big congrats from the team. 🙌
                </p>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={styles.finishButton}
                onClick={handleFinish}
              >
                Finish
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
