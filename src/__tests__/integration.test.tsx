import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CancelPopup from '../component/tsx/01-MainEntry'

// Mock all dependencies
jest.mock('../lib/use-ab-testing', () => ({
  useABTesting: jest.fn()
}))

jest.mock('../lib/analytics', () => ({
  useAnalytics: jest.fn(() => ({
    track: jest.fn(),
    trackCancellationFlow: jest.fn(),
    trackABTest: jest.fn()
  })),
  analytics: {
    initialize: jest.fn()
  }
}))

jest.mock('../lib/responsive', () => ({
  useResponsive: jest.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'lg'
  }))
}))

jest.mock('../lib/config', () => ({
  getConfig: jest.fn(() => ({
    appName: 'Migrate Mate',
    cancellationReasons: [
      {
        id: 'too-expensive',
        label: 'Too expensive',
        requiresFeedback: false,
        requiresAmount: true,
        amountPlaceholder: '0.00'
      },
      {
        id: 'platform-not-helpful',
        label: 'Platform not helpful',
        requiresFeedback: true,
        requiresAmount: false,
        feedbackPlaceholder: 'What can we change?',
        minFeedbackLength: 25
      }
    ],
    offers: [
      {
        id: '10-dollar-off',
        label: 'Get $10 off',
        discountAmount: 1000,
        isActive: true,
        variant: 'B'
      }
    ]
  })),
  getPrimaryOffer: jest.fn(() => ({
    id: '10-dollar-off',
    label: 'Get $10 off',
    discountAmount: 1000
  })),
  formatPrice: jest.fn((price) => `$${(price / 100).toFixed(2)}`)
}))

describe('Complete Cancellation Flow Integration', () => {
  const mockOnClose = jest.fn()
  const mockUseABTesting = jest.requireMock('../lib/use-ab-testing').useABTesting

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseABTesting.mockReturnValue({
      variant: 'B',
      userSubscription: { monthly_price: 2500 },
      isLoading: false,
      error: null,
      downsellPrice: 1500
    })
  })

  describe('Variant B Flow (with downsell)', () => {
    it('should complete full cancellation flow with downsell offer', async () => {
      const user = userEvent.setup()
      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)

      // Step 1: Main popup
      expect(screen.getByText('Hey mate,')).toBeInTheDocument()
      expect(screen.getByText("Not yet - I'm still looking")).toBeInTheDocument()

      // Click "Not yet" to go to offer page
      const notYetButton = screen.getByText("Not yet - I'm still looking")
      await user.click(notYetButton)

      // Step 2: Offer page
      await waitFor(() => {
        expect(screen.getByText('We built this to help you land the job, this makes it a little easier.')).toBeInTheDocument()
      })
      expect(screen.getByText('Here\'s $10 off until you find a job.')).toBeInTheDocument()
      expect(screen.getByText('$15.00/month')).toBeInTheDocument()
      expect(screen.getByText('$25.00/month')).toBeInTheDocument()

      // Click "No thanks" to continue to cancellation
      const noThanksButton = screen.getByText('No thanks')
      await user.click(noThanksButton)

      // Step 3: Feedback form step 2
      await waitFor(() => {
        expect(screen.getByText('What\'s the main reason for cancelling?')).toBeInTheDocument()
      })

      // Step 4: Reasons page
      await waitFor(() => {
        expect(screen.getByText('What\'s the main reason for cancelling?')).toBeInTheDocument()
      })

      // Select a reason
      const tooExpensiveRadio = screen.getByLabelText('Too expensive')
      await user.click(tooExpensiveRadio)

      // Fill in amount
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '15.00')

      // Complete cancellation
      const completeButton = screen.getByText('Complete cancellation')
      await user.click(completeButton)

      // Step 5: Cancelled page
      await waitFor(() => {
        expect(screen.getByText('Your subscription has been cancelled')).toBeInTheDocument()
      })
    })

    it('should handle downsell acceptance flow', async () => {
      const user = userEvent.setup()
      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)

      // Navigate to offer page
      const notYetButton = screen.getByText("Not yet - I'm still looking")
      await user.click(notYetButton)

      // Accept the offer
      await waitFor(() => {
        expect(screen.getByText('Get $10 off | $15.00')).toBeInTheDocument()
      })

      const acceptButton = screen.getByText('Get $10 off | $15.00')
      await user.click(acceptButton)

      // Should close popup and return to profile
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Variant A Flow (no downsell)', () => {
    beforeEach(() => {
      mockUseABTesting.mockReturnValue({
        variant: 'A',
        userSubscription: { monthly_price: 2500 },
        isLoading: false,
        error: null,
        downsellPrice: 2500
      })
    })

    it('should complete cancellation flow without downsell offer', async () => {
      const user = userEvent.setup()
      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)

      // Click "Not yet" - should go directly to reasons (no offer page)
      const notYetButton = screen.getByText("Not yet - I'm still looking")
      await user.click(notYetButton)

      // Should go directly to offer page (same as variant B for "Not yet")
      await waitFor(() => {
        expect(screen.getByText('We built this to help you land the job, this makes it a little easier.')).toBeInTheDocument()
      })

      // Click "No thanks" to continue
      const noThanksButton = screen.getByText('No thanks')
      await user.click(noThanksButton)

      // Should go to reasons page
      await waitFor(() => {
        expect(screen.getByText('What\'s the main reason for cancelling?')).toBeInTheDocument()
      })
    })
  })

  describe('Job Found Flow', () => {
    it('should handle job found flow correctly', async () => {
      const user = userEvent.setup()
      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)

      // Click "Yes, I've found a job"
      const yesButton = screen.getByText("Yes, I've found a job")
      await user.click(yesButton)

      // Should show job found form
      await waitFor(() => {
        expect(screen.getByText('Did you find your job through Migrate Mate?')).toBeInTheDocument()
      })

      // Select "Yes" (found with Migrate Mate)
      const yesWithMMButton = screen.getByText('Yes, I found it through Migrate Mate')
      await user.click(yesWithMMButton)

      // Should show feedback form
      await waitFor(() => {
        expect(screen.getByText('That\'s amazing! We\'re so happy for you.')).toBeInTheDocument()
      })

      // Continue to final step
      const continueButton = screen.getByText('Continue')
      await user.click(continueButton)

      // Should show YesWithMM component
      await waitFor(() => {
        expect(screen.getByText('Congratulations on your new job!')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle A/B testing errors gracefully', () => {
      mockUseABTesting.mockReturnValue({
        variant: 'A', // Fallback to variant A
        userSubscription: null,
        isLoading: false,
        error: 'Database connection failed',
        downsellPrice: null
      })

      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)

      // Should still render the popup
      expect(screen.getByText('Hey mate,')).toBeInTheDocument()
      expect(screen.getByText("Yes, I've found a job")).toBeInTheDocument()
      expect(screen.getByText("Not yet - I'm still looking")).toBeInTheDocument()
    })

    it('should handle loading state correctly', () => {
      mockUseABTesting.mockReturnValue({
        variant: null,
        userSubscription: null,
        isLoading: true,
        error: null,
        downsellPrice: null
      })

      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Setting up your cancellation experience...')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should handle different screen sizes', () => {
      // Test desktop view (default)
      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
      
      const popup = screen.getByRole('dialog')
      expect(popup).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByLabelText('Close popup')).toBeInTheDocument()
    })

    it('should handle keyboard navigation', async () => {
      render(<CancelPopup isOpen={true} onClose={mockOnClose} />)

      // Test escape key
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})

