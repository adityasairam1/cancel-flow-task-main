'use client';

import React, { useState } from 'react';
import styles from '../css/02-JobFoundForm.module.css';
import { useResponsive } from '../../lib/responsive';


interface JobFoundFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: (foundWithMM: 'yes' | 'no') => void;
}

export default function JobFoundForm({ isOpen, onClose, onBack, onContinue }: JobFoundFormProps) {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
  const [formData, setFormData] = useState({
    foundWithMigrateMatch: '',
    rolesApplied: '',
    companiesEmailed: '',
    companiesInterviewed: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev] === value ? '' : value
    }));
  };

  // Check if all required fields are filled
  const isFormValid = formData.foundWithMigrateMatch !== '' && 
                     formData.rolesApplied !== '' && 
                     formData.companiesEmailed !== '' && 
                     formData.companiesInterviewed !== '';

  const handleContinue = () => {
    if (!isFormValid) return;
    
    // Handle form submission
    console.log('Form data:', formData);
    onContinue(formData.foundWithMigrateMatch as 'yes' | 'no');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.popup} ${isMobile ? 'w-full h-full max-w-none rounded-none' : isTablet ? 'w-11/12 max-w-2xl rounded-lg' : 'w-4/5 max-w-4xl rounded-xl'}`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            ← Back
          </button>
          <span className={styles.headerText}>Subscription Cancellation</span>
          <div className={styles.stepIndicator}>
            <span className={styles.step}>Step 1 of 3</span>
            <div className={styles.progressMeter}>
              <div className={styles.progressBar}></div>
            </div>
          </div>
          <div></div> {/* Placeholder for close button alignment */}
        </div>
        
        <div className={styles.content}>
          <div className={styles.textSection}>
            <div className={styles.textContent}>
              <h3 className={styles.title}>
                Congrats on the new role! 🎉
              </h3>
              
              <div className={styles.questionGroup}>
                <p className={styles.questionText}>
                  Did you find this job with MigrateMate?*
                </p>
                <div className={styles.optionGroup}>
                  {['yes', 'no'].map((option) => (
                    <label key={option} className={styles.optionButton}>
                      <input
                        type="radio"
                        name="foundWithMigrateMatch"
                        value={option}
                        checked={formData.foundWithMigrateMatch === option}
                        onChange={(e) => handleInputChange('foundWithMigrateMatch', e.target.value)}
                        onClick={(e) => {
                          if (formData.foundWithMigrateMatch === option) {
                            e.preventDefault();
                            handleInputChange('foundWithMigrateMatch', '');
                          }
                        }}
                      />
                      <span className={styles.optionLabel}>{option === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.questionGroup}>
                <p className={styles.questionText}>
                  How many roles did you apply for through Migrate Match?*
                </p>
                <div className={styles.optionGroup}>
                  {['0', '1-5', '6-20', '20+'].map((option) => (
                    <label key={option} className={styles.optionButton}>
                      <input
                        type="radio"
                        name="rolesApplied"
                        value={option}
                        checked={formData.rolesApplied === option}
                        onChange={(e) => handleInputChange('rolesApplied', e.target.value)}
                        onClick={(e) => {
                          if (formData.rolesApplied === option) {
                            e.preventDefault();
                            handleInputChange('rolesApplied', '');
                          }
                        }}
                      />
                      <span className={styles.optionLabel}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.questionGroup}>
                <p className={styles.questionText}>
                  How many companies did you email directly?*
                </p>
                <div className={styles.optionGroup}>
                  {['0', '1-5', '6-20', '20+'].map((option) => (
                    <label key={option} className={styles.optionButton}>
                      <input
                        type="radio"
                        name="companiesEmailed"
                        value={option}
                        checked={formData.companiesEmailed === option}
                        onChange={(e) => handleInputChange('companiesEmailed', e.target.value)}
                        onClick={(e) => {
                          if (formData.companiesEmailed === option) {
                            e.preventDefault();
                            handleInputChange('companiesEmailed', '');
                          }
                        }}
                      />
                      <span className={styles.optionLabel}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.questionGroup}>
                <p className={styles.questionText}>
                  How many different companies did you interview with?*
                </p>
                <div className={styles.optionGroup}>
                  {['0', '1-2', '3-5', '5+'].map((option) => (
                    <label key={option} className={styles.optionButton}>
                      <input
                        type="radio"
                        name="companiesInterviewed"
                        value={option}
                        checked={formData.companiesInterviewed === option}
                        onChange={(e) => handleInputChange('companiesInterviewed', e.target.value)}
                        onClick={(e) => {
                          if (formData.companiesInterviewed === option) {
                            e.preventDefault();
                            handleInputChange('companiesInterviewed', '');
                          }
                        }}
                      />
                      <span className={styles.optionLabel}>{option}</span>
                    </label>
                  ))}
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
          
          <div className={styles.imageSection}>
            <img src="/image/empire.jpg" alt="Empire State Building at twilight" className={styles.image} />
          </div>
        </div>
      </div>
    </div>
  );
}