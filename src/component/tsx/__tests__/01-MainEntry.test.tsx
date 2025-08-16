import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CancelPopup from '../01-MainEntry'

// Mock the hooks and dependencies
jest.mock('../../../lib/use-ab-testing', () => ({
  useABTesting: jest.fn()
}))

jest.mock('../../../lib/analytics', () => ({
  useAnalytics: jest.fn(() => ({
    track: jest.fn(),
    trackCancellationFlow: jest.fn(),
    trackABTest: jest.fn()
  })),
  analytics: {
    initialize: jest.fn()
  }
}))

jest.mock('../../../lib/responsive', () => ({
  useResponsive: jest.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'lg'
  }))
}))

jest.mock('../../../lib/config', () => ({
  getConfig: jest.fn(() => ({
    appName: 'Migrate Mate',
    cancellationReasons: [],
    offers: []
  })),
  getPrimaryOffer: jest.fn(() => ({
    id: '10-dollar-off',
    label: 'Get $10 off',
    discountAmount: 1000
  })),
  formatPrice: jest.fn((price) => `$${(price / 100).toFixed(2)}`)
}))

describe('CancelPopup', () => {
  const mockOnClose = jest.fn()
  const mockUseABTesting = jest.requireMock('../../../lib/use-ab-testing').useABTesting

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

  it('should render the main cancellation popup', () => {
    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Hey mate,')).toBeInTheDocument()
    expect(screen.getByText('Quick one before you go.')).toBeInTheDocument()
    expect(screen.getByText('Have you found a job yet?')).toBeInTheDocument()
    expect(screen.getByText("Yes, I've found a job")).toBeInTheDocument()
    expect(screen.getByText("Not yet - I'm still looking")).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    render(<CancelPopup isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByText('Hey mate,')).not.toBeInTheDocument()
  })

  it('should show loading state when A/B testing is initializing', () => {
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

  it('should navigate to job found form when "Yes, I\'ve found a job" is clicked', async () => {
    const user = userEvent.setup()
    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    const yesButton = screen.getByText("Yes, I've found a job")
    await user.click(yesButton)
    
    expect(screen.getByText('Did you find your job through Migrate Mate?')).toBeInTheDocument()
  })

  it('should navigate to offer page when "Not yet - I\'m still looking" is clicked', async () => {
    const user = userEvent.setup()
    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    const noButton = screen.getByText("Not yet - I'm still looking")
    await user.click(noButton)
    
    expect(screen.getByText('We built this to help you land the job, this makes it a little easier.')).toBeInTheDocument()
  })

  it('should close popup when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    const closeButton = screen.getByLabelText('Close popup')
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close popup when escape key is pressed', async () => {
    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close popup when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    const overlay = screen.getByRole('presentation')
    await user.click(overlay)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should not close popup when content is clicked', async () => {
    const user = userEvent.setup()
    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    const popup = screen.getByRole('dialog')
    await user.click(popup)
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should handle variant A (no downsell) correctly', () => {
    mockUseABTesting.mockReturnValue({
      variant: 'A',
      userSubscription: { monthly_price: 2500 },
      isLoading: false,
      error: null,
      downsellPrice: 2500
    })

    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    // Should still show the main popup with both options
    expect(screen.getByText("Yes, I've found a job")).toBeInTheDocument()
    expect(screen.getByText("Not yet - I'm still looking")).toBeInTheDocument()
  })

  it('should handle variant B (with downsell) correctly', () => {
    mockUseABTesting.mockReturnValue({
      variant: 'B',
      userSubscription: { monthly_price: 2500 },
      isLoading: false,
      error: null,
      downsellPrice: 1500
    })

    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    // Should show the main popup with both options
    expect(screen.getByText("Yes, I've found a job")).toBeInTheDocument()
    expect(screen.getByText("Not yet - I'm still looking")).toBeInTheDocument()
  })

  it('should handle $29 subscription correctly', () => {
    mockUseABTesting.mockReturnValue({
      variant: 'B',
      userSubscription: { monthly_price: 2900 },
      isLoading: false,
      error: null,
      downsellPrice: 1900
    })

    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    // Should show the main popup
    expect(screen.getByText('Hey mate,')).toBeInTheDocument()
  })

  it('should handle database errors gracefully', () => {
    mockUseABTesting.mockReturnValue({
      variant: 'A', // Fallback to variant A
      userSubscription: null,
      isLoading: false,
      error: 'Database connection failed',
      downsellPrice: null
    })

    render(<CancelPopup isOpen={true} onClose={mockOnClose} />)
    
    // Should still render the popup even with errors
    expect(screen.getByText('Hey mate,')).toBeInTheDocument()
  })
})

