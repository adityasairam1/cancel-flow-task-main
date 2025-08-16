'use client';

import React, { useEffect } from 'react';
import styles from '../css/09-SuccessNoMM.module.css';

interface SuccessNoMMProps {
  isOpen: boolean;
  onClose: () => void;
  visaType?: string;
  hasLawyer?: boolean;
}

export default function SuccessNoMM({ isOpen, onClose, visaType, hasLawyer }: SuccessNoMMProps) {
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
    console.log('No MM cancellation completed successfully');
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
          <span className={styles.headerText}>Subscription Cancellation</span>
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
                Your cancellation's all sorted, mate, no more charges.
              </h3>
              
              <div className={styles.profileContainer}>
                <div className={styles.profileInfo}>
                  <img 
                    src="/image/profile.jpeg" 
                    alt="Mihailo Bozic" 
                    className={styles.profileImage} 
                  />
                  <div className={styles.profileDetails}>
                    <h4 className={styles.profileName}>Mihailo Bozic</h4>
                    <p className={styles.profileEmail}>mihailo@migratemate.co</p>
                  </div>
                </div>
                
                <div className={styles.profileMessage}>
                  <p className={styles.messageText}>
                    I'll be reaching out soon to help with the visa side of things.
                  </p>
                  <p className={styles.messageText}>
                    We've got your back, whether it's questions, paperwork, or just figuring out your options.
                  </p>
                  <p className={styles.messageText}>
                    Keep an eye on your inbox. I'll be in touch <span className={styles.underlined}>shortly</span>.
                  </p>
                </div>
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
